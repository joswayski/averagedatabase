use axum::{
    body::Body,
    extract::{DefaultBodyLimit, Multipart, Path, Query, State},
    http::{header, HeaderMap, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use rusqlite::{params, Connection, OptionalExtension};
use serde::Deserialize;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    collections::HashSet,
    env,
    path::{Path as FsPath, PathBuf},
    sync::{Arc, Mutex},
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tokio::net::TcpListener;
use uuid::Uuid;

const RETENTION_SECONDS: i64 = 3 * 24 * 60 * 60;
const MAX_VALUE_BYTES: usize = 1_000_000;
const MAX_UPLOAD_BYTES: usize = 10 * 1024 * 1024;
const MAX_UPLOADS_PER_HOUR: i64 = 10;
const DATABASE_HIGH_WATER_BYTES: u64 = 5 * 1024 * 1024 * 1024;
const CLEANUP_BATCH_SIZE: i64 = 1_000;
const MAX_CLEANUP_BATCHES: i64 = 20;
const API_KEY_HEADER: &str = "x-averagedb-api-key";
const ADD_ITEM_PATH: &str =
    "/api/SECRET_INTERNAL_ENDPOINT_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_add_item";

const ADS: &[&str] = &[
    "Tempur-Pedic: Experience the ultimate comfort with Tempur-Pedic mattresses.",
    "Glade: Freshen up your home with Glade air fresheners.",
    "Starbucks: Upgrade your mornings with Starbucks' new iced caramel macchiato.",
    "Verizon: Stay connected with Verizon's unlimited data plans.",
    "IKEA: Transform your space with IKEA's stylish furniture.",
    "Subway: Taste the freshness of Subway's new avocado toast.",
    "The North Face: Get ready for adventure with The North Face gear.",
    "McDonald's: Enjoy the new crispy chicken sandwich at McDonald's.",
    "Best Buy: Discover the latest tech at Best Buy.",
    "GameStop: Do you like losing money?",
];

const ALLOWED_EXTENSIONS: &[&str] = &[
    "jpg", "jpeg", "png", "gif", "webp", "pdf", "txt", "md", "csv", "log", "json", "xml", "mp3",
    "wav", "m4a", "mp4", "webm", "mov", "zip", "tar", "gz",
];

#[derive(Clone)]
struct AppState {
    db: Arc<Mutex<Connection>>,
    data_dir: PathBuf,
    uploads_dir: PathBuf,
    public_base_url: Option<String>,
}

#[derive(Deserialize)]
struct AddItemBody {
    data: Option<String>,
}

#[derive(Deserialize)]
struct ItemQuery {
    key: Option<String>,
}

struct UploadMeta {
    file_id: String,
    filename: String,
    content_type: String,
    size_bytes: i64,
    is_public: bool,
    owner_key_hash: String,
    expires_at: i64,
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_env_filter(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| tracing_subscriber::EnvFilter::new("info")),
        )
        .init();

    let data_dir = PathBuf::from(env::var("DATA_DIR").unwrap_or_else(|_| "./data".to_string()));
    let uploads_dir = data_dir.join("uploads");
    std::fs::create_dir_all(&uploads_dir).expect("create data directories");

    let db_path = data_dir.join("avgdb.sqlite");
    let db = Connection::open(&db_path).expect("open sqlite");
    db.pragma_update(None, "journal_mode", "WAL")
        .expect("enable wal");
    db.pragma_update(None, "foreign_keys", "ON")
        .expect("enable foreign keys");
    migrate(&db).expect("run migrations");

    let state = AppState {
        db: Arc::new(Mutex::new(db)),
        data_dir,
        uploads_dir,
        public_base_url: env::var("PUBLIC_BASE_URL")
            .ok()
            .map(|value| value.trim_end_matches('/').to_string())
            .filter(|value| !value.is_empty()),
    };

    let cleanup_state = state.clone();
    tokio::spawn(async move {
        if let Err(error) = cleanup(&cleanup_state) {
            tracing::error!(%error, "startup cleanup failed");
        }

        let mut interval = tokio::time::interval(Duration::from_secs(60 * 60));
        interval.tick().await;
        loop {
            interval.tick().await;
            if let Err(error) = cleanup(&cleanup_state) {
                tracing::error!(%error, "hourly cleanup failed");
            }
        }
    });

    let app = Router::new()
        .route("/api/health", get(health))
        .route("/api/u-up", get(u_up))
        .route("/api/gibs-key", post(gibs_key))
        .route(ADD_ITEM_PATH, post(add_item))
        .route("/api/gibs-item", get(gibs_item))
        .route("/api/yeet", post(yeet))
        .route("/api/ass/{file_id}", get(get_file).head(get_file))
        .fallback(not_found)
        .layer(DefaultBodyLimit::max(MAX_UPLOAD_BYTES + 1024 * 1024))
        .with_state(state);

    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = format!("0.0.0.0:{port}");
    let listener = TcpListener::bind(&addr).await.expect("bind listener");
    tracing::info!("Average Database listening on {addr}");
    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("serve");
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("install ctrl+c handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}

fn migrate(db: &Connection) -> rusqlite::Result<()> {
    db.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS api_keys (
          api_key TEXT PRIMARY KEY,
          created_at INTEGER NOT NULL,
          expires_at INTEGER NOT NULL
        ) WITHOUT ROWID;

        CREATE INDEX IF NOT EXISTS api_keys_expires_at_idx ON api_keys (expires_at);

        CREATE TABLE IF NOT EXISTS items (
          item_key TEXT PRIMARY KEY,
          api_key TEXT NOT NULL,
          value TEXT NOT NULL,
          size_bytes INTEGER NOT NULL,
          created_at INTEGER NOT NULL,
          expires_at INTEGER NOT NULL
        ) WITHOUT ROWID;

        CREATE INDEX IF NOT EXISTS items_api_key_idx ON items (api_key);
        CREATE INDEX IF NOT EXISTS items_expires_at_idx ON items (expires_at);
        CREATE INDEX IF NOT EXISTS items_created_at_idx ON items (created_at);

        CREATE TABLE IF NOT EXISTS upload_limits (
          api_key TEXT NOT NULL,
          window_start INTEGER NOT NULL,
          count INTEGER NOT NULL,
          PRIMARY KEY (api_key, window_start)
        ) WITHOUT ROWID;

        CREATE INDEX IF NOT EXISTS upload_limits_window_start_idx ON upload_limits (window_start);

        CREATE TABLE IF NOT EXISTS uploads (
          file_id TEXT PRIMARY KEY,
          filename TEXT NOT NULL,
          content_type TEXT NOT NULL,
          size_bytes INTEGER NOT NULL,
          is_public INTEGER NOT NULL,
          owner_key_hash TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          expires_at INTEGER NOT NULL
        ) WITHOUT ROWID;

        CREATE INDEX IF NOT EXISTS uploads_expires_at_idx ON uploads (expires_at);
        CREATE INDEX IF NOT EXISTS uploads_created_at_idx ON uploads (created_at);
        ",
    )
}

async fn health() -> impl IntoResponse {
    text(StatusCode::OK, "Yeah")
}

async fn u_up() -> impl IntoResponse {
    json_response(
        StatusCode::OK,
        json!({
            "message": "Yeah",
            "brought_to_you_by": random_ad(""),
        }),
    )
}

async fn gibs_key(State(state): State<AppState>) -> impl IntoResponse {
    let now = unix_seconds();
    let api_key = format!("avg_{}", Uuid::new_v4().simple());

    match with_db(&state, |db| {
        db.execute(
            "INSERT INTO api_keys (api_key, created_at, expires_at) VALUES (?1, ?2, ?3)",
            params![api_key, now, now + RETENTION_SECONDS],
        )
    }) {
        Ok(_) => json_response(
            StatusCode::CREATED,
            json!({
                "api_key": api_key,
                "brought_to_you_by": random_ad(""),
            }),
        ),
        Err(error) => internal_error(error),
    }
}

async fn add_item(
    State(state): State<AppState>,
    headers: HeaderMap,
    Json(body): Json<AddItemBody>,
) -> impl IntoResponse {
    let api_key = match authenticate(&state, &headers) {
        Ok(api_key) => api_key,
        Err(response) => return response,
    };

    let Some(data) = body.data else {
        return text(
            StatusCode::BAD_REQUEST,
            "Request body must contain a string named 'data'",
        );
    };

    if data.len() > MAX_VALUE_BYTES {
        return text(
            StatusCode::PAYLOAD_TOO_LARGE,
            format!(
                "Value is too large. Keep it under {} bytes.",
                MAX_VALUE_BYTES
            ),
        );
    }

    let now = unix_seconds();
    let item_key = format!("{api_key}:{}", random_id(20));
    let size_bytes = data.len() as i64;

    match with_db(&state, |db| {
        db.execute(
            "INSERT INTO items
                (item_key, api_key, value, size_bytes, created_at, expires_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                item_key,
                api_key,
                data,
                size_bytes,
                now,
                now + RETENTION_SECONDS
            ],
        )
    }) {
        Ok(_) => json_response(
            StatusCode::CREATED,
            json!({
                "message": "Great success!",
                "key": item_key,
                "brought_to_you_by": random_ad(&api_key),
            }),
        ),
        Err(error) => internal_error(error),
    }
}

async fn gibs_item(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(query): Query<ItemQuery>,
) -> impl IntoResponse {
    let api_key = match authenticate(&state, &headers) {
        Ok(api_key) => api_key,
        Err(response) => return response,
    };

    let Some(item_key) = query.key.filter(|value| !value.is_empty()) else {
        return text(
            StatusCode::BAD_REQUEST,
            "You must provide a key in the query string",
        );
    };

    if !item_key.starts_with(&format!("{api_key}:")) {
        return text(
            StatusCode::UNAUTHORIZED,
            "Query key must match api key in header",
        );
    }

    let now = unix_seconds();
    let value = match with_db(&state, |db| {
        db.query_row(
            "SELECT value FROM items
             WHERE item_key = ?1 AND api_key = ?2 AND expires_at > ?3",
            params![item_key, api_key, now],
            |row| row.get::<_, String>(0),
        )
        .optional()
    }) {
        Ok(value) => value,
        Err(error) => return internal_error(error),
    };

    match value {
        Some(value) => json_response(
            StatusCode::OK,
            json!({
                "value": value,
                "brought_to_you_by": random_ad(&api_key),
            }),
        ),
        None => text(
            StatusCode::NOT_FOUND,
            "No item found with this key. It might have been deleted.. 🤷",
        ),
    }
}

async fn yeet(
    State(state): State<AppState>,
    headers: HeaderMap,
    multipart: Multipart,
) -> impl IntoResponse {
    let api_key = match authenticate(&state, &headers) {
        Ok(api_key) => api_key,
        Err(response) => return response,
    };

    if let Some(length) = content_length(&headers) {
        if length > MAX_UPLOAD_BYTES as u64 {
            return text(
                StatusCode::PAYLOAD_TOO_LARGE,
                "Upload is too large. The entire request must be 10 MB or less.",
            );
        }
    }

    let parsed = match read_uploads(multipart).await {
        Ok(parsed) => parsed,
        Err(response) => return response,
    };

    if parsed.files.is_empty() {
        return text(
            StatusCode::BAD_REQUEST,
            "No files were uploaded. Please include at least one file.",
        );
    }

    let total_bytes: usize = parsed.files.iter().map(|file| file.bytes.len()).sum();
    if total_bytes > MAX_UPLOAD_BYTES {
        return text(
            StatusCode::PAYLOAD_TOO_LARGE,
            "Upload is too large. Files must total 10 MB or less.",
        );
    }

    let allowed: HashSet<&str> = ALLOWED_EXTENSIONS.iter().copied().collect();
    for file in &parsed.files {
        let extension = file
            .filename
            .rsplit('.')
            .next()
            .unwrap_or("")
            .to_ascii_lowercase();
        if file.filename.is_empty() || !allowed.contains(extension.as_str()) {
            return text(
                StatusCode::BAD_REQUEST,
                format!(
                    "File type '{}' is not allowed. Allowed types: {}",
                    if extension.is_empty() {
                        "unknown"
                    } else {
                        &extension
                    },
                    ALLOWED_EXTENSIONS.join(", ")
                ),
            );
        }
    }

    let rate = match increment_upload_limit(&state, &api_key) {
        Ok(rate) => rate,
        Err(error) => return internal_error(error),
    };
    if rate > MAX_UPLOADS_PER_HOUR {
        return text(
            StatusCode::TOO_MANY_REQUESTS,
            format!(
                "Rate limit exceeded. Maximum {MAX_UPLOADS_PER_HOUR} upload requests per hour per API key."
            ),
        );
    }

    let owner_key_hash = sha256_hex(&api_key);
    let now = unix_seconds();
    let expires_at = now + RETENTION_SECONDS;
    let mut stored = Vec::new();

    for file in parsed.files {
        let file_id = random_id(32);
        let path = state.uploads_dir.join(&file_id);
        if let Err(error) = tokio::fs::write(&path, &file.bytes).await {
            return internal_error(error);
        }

        let insert = with_db(&state, |db| {
            db.execute(
                "INSERT INTO uploads
                    (file_id, filename, content_type, size_bytes, is_public, owner_key_hash, created_at, expires_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
                params![
                    file_id,
                    file.filename,
                    file.content_type,
                    file.bytes.len() as i64,
                    parsed.is_public as i64,
                    owner_key_hash,
                    now,
                    expires_at
                ],
            )
        });

        if let Err(error) = insert {
            let _ = tokio::fs::remove_file(&path).await;
            return internal_error(error);
        }

        stored.push(json!({
            "file_id": file_id,
            "file_url": format!("{}/api/ass/{file_id}", public_base(&state, &headers)),
            "filename": file.filename,
            "size_bytes": file.bytes.len(),
        }));
    }

    json_response(
        StatusCode::OK,
        json!({
            "message": format!(
                "Successfully stored {} file(s) in our ultra-secure ASS!{}",
                stored.len(),
                if parsed.is_public {
                    ""
                } else {
                    " Private files require the uploading API key to access."
                }
            ),
            "files": stored,
            "brought_to_you_by": random_ad(&api_key),
        }),
    )
}

async fn get_file(
    State(state): State<AppState>,
    Path(file_id): Path<String>,
    headers: HeaderMap,
    method: Method,
) -> impl IntoResponse {
    if file_id.is_empty() || file_id.contains('/') || !file_id.chars().all(char::is_alphanumeric) {
        return text(StatusCode::NOT_FOUND, "File not found.");
    }

    let now = unix_seconds();
    let meta = match with_db(&state, |db| {
        db.query_row(
            "SELECT file_id, filename, content_type, size_bytes, is_public, owner_key_hash, expires_at
             FROM uploads
             WHERE file_id = ?1",
            params![file_id],
            |row| {
                Ok(UploadMeta {
                    file_id: row.get(0)?,
                    filename: row.get(1)?,
                    content_type: row.get(2)?,
                    size_bytes: row.get(3)?,
                    is_public: row.get::<_, i64>(4)? == 1,
                    owner_key_hash: row.get(5)?,
                    expires_at: row.get(6)?,
                })
            },
        )
        .optional()
    }) {
        Ok(meta) => meta,
        Err(error) => return internal_error(error),
    };

    let Some(meta) = meta else {
        return text(StatusCode::NOT_FOUND, "File not found.");
    };

    if meta.expires_at <= now {
        delete_upload(&state, &meta.file_id);
        return text(StatusCode::NOT_FOUND, "File not found.");
    }

    if !meta.is_public {
        let api_key = match authenticate(&state, &headers) {
            Ok(api_key) => api_key,
            Err(response) => return response,
        };
        if sha256_hex(&api_key) != meta.owner_key_hash {
            return text(
                StatusCode::FORBIDDEN,
                "That file belongs to somebody else. Rude.",
            );
        }
    }

    let path = state.uploads_dir.join(&meta.file_id);
    let bytes = if method == Method::HEAD {
        Vec::new()
    } else {
        match tokio::fs::read(&path).await {
            Ok(bytes) => bytes,
            Err(_) => return text(StatusCode::NOT_FOUND, "File not found."),
        }
    };

    let cache_control = if meta.is_public {
        "public, max-age=3600"
    } else {
        "private, no-store"
    };

    Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, meta.content_type)
        .header(
            header::CONTENT_DISPOSITION,
            format!("inline; filename=\"{}\"", meta.filename),
        )
        .header(header::CONTENT_LENGTH, meta.size_bytes.to_string())
        .header(header::CACHE_CONTROL, cache_control)
        .header(header::X_CONTENT_TYPE_OPTIONS, "nosniff")
        .body(Body::from(bytes))
        .unwrap_or_else(|_| text(StatusCode::INTERNAL_SERVER_ERROR, "Something went wrong."))
}

async fn not_found() -> impl IntoResponse {
    json_response(
        StatusCode::NOT_FOUND,
        json!({ "message": "That API endpoint does not exist." }),
    )
}

struct IncomingFile {
    filename: String,
    content_type: String,
    bytes: Vec<u8>,
}

struct ParsedUpload {
    files: Vec<IncomingFile>,
    is_public: bool,
}

async fn read_uploads(mut multipart: Multipart) -> Result<ParsedUpload, Response> {
    let mut files = Vec::new();
    let mut is_public = false;

    while let Some(field) = multipart.next_field().await.map_err(|_| {
        text(
            StatusCode::BAD_REQUEST,
            "Could not read that multipart upload.",
        )
    })? {
        let name = field.name().unwrap_or_default().to_string();
        if name == "public" {
            let value = field.text().await.unwrap_or_default();
            is_public = matches!(value.trim().to_ascii_lowercase().as_str(), "true" | "1");
            continue;
        }

        if name != "file" {
            continue;
        }

        let filename = sanitize_filename(field.file_name().unwrap_or_default());
        let content_type = field
            .content_type()
            .map(|value| value.to_string())
            .filter(|value| !value.is_empty())
            .unwrap_or_else(|| {
                mime_guess::from_path(&filename)
                    .first_or_octet_stream()
                    .essence_str()
                    .to_string()
            });
        let bytes = field.bytes().await.map_err(|_| {
            text(
                StatusCode::BAD_REQUEST,
                "Could not read that multipart upload.",
            )
        })?;

        files.push(IncomingFile {
            filename,
            content_type,
            bytes: bytes.to_vec(),
        });
    }

    Ok(ParsedUpload { files, is_public })
}

fn authenticate(state: &AppState, headers: &HeaderMap) -> Result<String, Response> {
    let api_key = headers
        .get(API_KEY_HEADER)
        .and_then(|value| value.to_str().ok())
        .map(str::trim)
        .filter(|value| !value.is_empty())
        .map(ToOwned::to_owned);

    let Some(api_key) = api_key else {
        return Err(text(
            StatusCode::UNAUTHORIZED,
            format!("You must provide an API key in the '{API_KEY_HEADER}' header"),
        ));
    };

    if api_key.starts_with("enterprise-") {
        return Ok(api_key);
    }

    let now = unix_seconds();
    let exists = with_db(state, |db| {
        db.query_row(
            "SELECT 1 FROM api_keys WHERE api_key = ?1 AND expires_at > ?2",
            params![api_key, now],
            |_| Ok(()),
        )
        .optional()
    })
    .map_err(internal_error)?;

    if exists.is_none() {
        return Err(text(
            StatusCode::UNAUTHORIZED,
            "No way, Jose. Fix your API key. Figure it out.",
        ));
    }

    Ok(api_key)
}

fn increment_upload_limit(state: &AppState, api_key: &str) -> Result<i64, rusqlite::Error> {
    let window_start = unix_seconds() / 3600 * 3600;
    with_db(state, |db| {
        db.query_row(
            "INSERT INTO upload_limits (api_key, window_start, count)
             VALUES (?1, ?2, 1)
             ON CONFLICT (api_key, window_start)
             DO UPDATE SET count = count + 1
             RETURNING count",
            params![api_key, window_start],
            |row| row.get(0),
        )
    })
}

fn cleanup(state: &AppState) -> Result<(), String> {
    let now = unix_seconds();
    let expired_uploads = with_db(state, |db| {
        delete_in_batches(db, "items", "item_key", "expires_at <= ?1", now)?;
        delete_in_batches(db, "api_keys", "api_key", "expires_at <= ?1", now)?;
        delete_in_batches(
            db,
            "upload_limits",
            "api_key, window_start",
            "window_start < ?1",
            now - 2 * 60 * 60,
        )?;

        let mut ids = Vec::new();
        let mut statement = db.prepare("SELECT file_id FROM uploads WHERE expires_at <= ?1")?;
        let rows = statement.query_map(params![now], |row| row.get::<_, String>(0))?;
        for row in rows {
            ids.push(row?);
        }
        Ok(ids)
    })
    .map_err(|error| error.to_string())?;

    for file_id in expired_uploads {
        delete_upload(state, &file_id);
    }

    let mut used_bytes = stored_bytes(state).map_err(|error| error.to_string())?;
    for _ in 0..MAX_CLEANUP_BATCHES {
        if used_bytes <= DATABASE_HIGH_WATER_BYTES {
            break;
        }

        let deleted_items = with_db(state, |db| {
            db.execute(
                "DELETE FROM items
                 WHERE item_key IN (
                   SELECT item_key FROM items ORDER BY created_at ASC LIMIT ?1
                 )",
                params![CLEANUP_BATCH_SIZE],
            )
        })
        .map_err(|error| error.to_string())?;

        if deleted_items > 0 {
            used_bytes = stored_bytes(state).map_err(|error| error.to_string())?;
            continue;
        }

        let oldest_uploads = with_db(state, |db| {
            let mut statement =
                db.prepare("SELECT file_id FROM uploads ORDER BY created_at ASC LIMIT ?1")?;
            let rows =
                statement.query_map(params![CLEANUP_BATCH_SIZE], |row| row.get::<_, String>(0))?;
            rows.collect::<Result<Vec<_>, _>>()
        })
        .map_err(|error| error.to_string())?;

        if oldest_uploads.is_empty() {
            break;
        }

        for file_id in oldest_uploads {
            delete_upload(state, &file_id);
        }
        used_bytes = stored_bytes(state).map_err(|error| error.to_string())?;
    }

    Ok(())
}

fn delete_in_batches(
    db: &Connection,
    table: &str,
    key_columns: &str,
    predicate: &str,
    value: i64,
) -> rusqlite::Result<()> {
    for _ in 0..MAX_CLEANUP_BATCHES {
        let changed = db.execute(
            &format!(
                "DELETE FROM {table}
                 WHERE ({key_columns}) IN (
                   SELECT {key_columns} FROM {table} WHERE {predicate} LIMIT ?2
                 )"
            ),
            params![value, CLEANUP_BATCH_SIZE],
        )?;
        if (changed as i64) < CLEANUP_BATCH_SIZE {
            break;
        }
    }
    Ok(())
}

fn delete_upload(state: &AppState, file_id: &str) {
    let path = state.uploads_dir.join(file_id);
    if let Err(error) = std::fs::remove_file(&path) {
        if error.kind() != std::io::ErrorKind::NotFound {
            tracing::warn!(%error, file_id, "failed to delete upload file");
        }
    }
    if let Err(error) = with_db(state, |db| {
        db.execute("DELETE FROM uploads WHERE file_id = ?1", params![file_id])
    }) {
        tracing::warn!(%error, file_id, "failed to delete upload row");
    }
}

fn stored_bytes(state: &AppState) -> Result<u64, std::io::Error> {
    let mut total = file_len(&state.data_dir.join("avgdb.sqlite"))?;
    total += file_len(&state.data_dir.join("avgdb.sqlite-wal"))?;
    total += file_len(&state.data_dir.join("avgdb.sqlite-shm"))?;
    total += dir_size(&state.uploads_dir)?;
    Ok(total)
}

fn file_len(path: &FsPath) -> Result<u64, std::io::Error> {
    match std::fs::metadata(path) {
        Ok(metadata) => Ok(metadata.len()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(0),
        Err(error) => Err(error),
    }
}

fn dir_size(path: &FsPath) -> Result<u64, std::io::Error> {
    let mut total = 0;
    for entry in std::fs::read_dir(path)? {
        let entry = entry?;
        let metadata = entry.metadata()?;
        if metadata.is_file() {
            total += metadata.len();
        }
    }
    Ok(total)
}

fn with_db<T, F>(state: &AppState, work: F) -> Result<T, rusqlite::Error>
where
    F: FnOnce(&Connection) -> Result<T, rusqlite::Error>,
{
    let db = state.db.lock().map_err(|_| rusqlite::Error::InvalidQuery)?;
    work(&db)
}

fn public_base(state: &AppState, headers: &HeaderMap) -> String {
    if let Some(base) = &state.public_base_url {
        return base.clone();
    }

    let proto = header_str(headers, "x-forwarded-proto").unwrap_or("http");
    let host = header_str(headers, "x-forwarded-host")
        .or_else(|| header_str(headers, "host"))
        .unwrap_or("localhost:8080");
    format!("{proto}://{host}")
}

fn header_str<'a>(headers: &'a HeaderMap, name: &'a str) -> Option<&'a str> {
    headers.get(name).and_then(|value| value.to_str().ok())
}

fn content_length(headers: &HeaderMap) -> Option<u64> {
    headers
        .get(header::CONTENT_LENGTH)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.parse().ok())
}

fn sanitize_filename(filename: &str) -> String {
    let mut sanitized = String::new();
    let mut last_was_underscore = false;

    for ch in filename.chars() {
        let next = if ch.is_ascii_alphanumeric() || matches!(ch, '.' | '_' | '-') {
            ch
        } else {
            '_'
        };

        if next == '_' && last_was_underscore {
            continue;
        }

        last_was_underscore = next == '_';
        sanitized.push(next);
        if sanitized.len() >= 255 {
            break;
        }
    }

    sanitized
}

fn random_id(length: usize) -> String {
    Uuid::new_v4().simple().to_string()[..length].to_string()
}

fn unix_seconds() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
}

fn random_ad(api_key: &str) -> &'static str {
    if api_key.starts_with("enterprise-") {
        return "You! Thanks for being an enterprise customer.";
    }
    let index = Uuid::new_v4().as_u128() as usize % ADS.len();
    ADS[index]
}

fn sha256_hex(value: &str) -> String {
    hex::encode(Sha256::digest(value.as_bytes()))
}

fn json_response(status: StatusCode, value: Value) -> Response {
    (
        status,
        [(header::CACHE_CONTROL, "private, no-store")],
        Json(value),
    )
        .into_response()
}

fn text(status: StatusCode, value: impl Into<String>) -> Response {
    (
        status,
        [
            (header::CACHE_CONTROL, "private, no-store"),
            (header::CONTENT_TYPE, "text/plain; charset=utf-8"),
        ],
        value.into(),
    )
        .into_response()
}

fn internal_error(error: impl std::fmt::Display) -> Response {
    tracing::error!(%error, "Average Database API request failed");
    json_response(
        StatusCode::INTERNAL_SERVER_ERROR,
        json!({
            "message": "Something went wrong. This is, after all, an average database.",
        }),
    )
}
