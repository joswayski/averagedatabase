use axum::{
    extract::{Path, State},
    http::{header, HeaderMap, StatusCode, Uri},
    response::{IntoResponse, Response},
};
use serde::Deserialize;
use std::{
    path::{Component, Path as FsPath, PathBuf},
    sync::OnceLock,
};

const INCIDENT_PATH: &str = "/status/incident-report-april-1-2026-control-plane-degradation";
const INCIDENT_REDIRECT_URL: &str = "https://www.youtube.com/watch?v=KnVu-qNEcrg";
const AVATAR_CACHE: &str = "public, max-age=86400";
const PAGE_CACHE: &str = "public, max-age=3600";
const ASSET_CACHE: &str = "public, max-age=31536000, immutable";
const FILE_CACHE: &str = "public, max-age=86400";
const BOT_UA: &str =
    "Twitterbot|facebookexternalhit|Slackbot|LinkedInBot|Discordbot|WhatsApp|Googlebot|bingbot|Applebot";

#[derive(Clone, Deserialize)]
struct AvatarEntry {
    handle: String,
    #[serde(rename = "imageUrl")]
    image_url: String,
    live: bool,
}

#[derive(Deserialize)]
struct FxUser {
    avatar_url: Option<String>,
}

#[derive(Deserialize)]
struct FxTwitterUserResponse {
    user: Option<FxUser>,
}

pub fn static_dir() -> PathBuf {
    std::env::var("STATIC_DIR")
        .map(PathBuf::from)
        .unwrap_or_else(|_| PathBuf::from("/app/static"))
}

pub async fn avatar(Path(handle): Path<String>) -> Response {
    let handle = handle.trim_matches('/').to_string();
    if handle.is_empty() || handle.contains('/') {
        return not_found();
    }

    let Some(entry) = find_avatar(&handle) else {
        return not_found();
    };

    let location = if entry.live {
        resolve_x_avatar(&entry.handle, &entry.image_url).await
    } else {
        entry.image_url.clone()
    };

    Response::builder()
        .status(StatusCode::FOUND)
        .header(header::LOCATION, location)
        .header(header::CACHE_CONTROL, AVATAR_CACHE)
        .body(axum::body::Body::empty())
        .unwrap()
}

pub async fn incident(headers: HeaderMap, State(dir): State<PathBuf>) -> Response {
    let user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|value| value.to_str().ok())
        .unwrap_or("");

    if !is_bot(user_agent) {
        return Response::builder()
            .status(StatusCode::FOUND)
            .header(header::LOCATION, INCIDENT_REDIRECT_URL)
            .header(header::CACHE_CONTROL, "private, no-store")
            .header(header::VARY, "User-Agent")
            .body(axum::body::Body::empty())
            .unwrap();
    }

    serve_file(
        dir.join(INCIDENT_PATH.trim_start_matches('/')).join("index.html"),
        PAGE_CACHE,
        &[
            (header::VARY, "User-Agent"),
        ],
    )
    .await
}

pub async fn static_file(State(dir): State<PathBuf>, uri: Uri) -> Response {
    let requested = uri.path();
    if requested == INCIDENT_PATH || requested == format!("{INCIDENT_PATH}/") {
        return not_found();
    }

    let Some(path) = resolve_static(&dir, requested) else {
        return serve_file(dir.join("404.html"), PAGE_CACHE, &[]).await;
    };

    serve_file(path, cache_control_for(requested), &[]).await
}

fn cache_control_for(path: &str) -> &'static str {
    if path.starts_with("/assets/") {
        ASSET_CACHE
    } else if path.ends_with(".html") || path.ends_with('/') || !path.rsplit('/').next().unwrap_or("").contains('.') {
        PAGE_CACHE
    } else {
        FILE_CACHE
    }
}

fn resolve_static(dir: &FsPath, request_path: &str) -> Option<PathBuf> {
    let relative = request_path.trim_start_matches('/');
    if relative.contains('\0') {
        return None;
    }

    let mut joined = dir.to_path_buf();
    if !relative.is_empty() {
        for component in FsPath::new(relative).components() {
            match component {
                Component::Normal(part) => joined.push(part),
                _ => return None,
            }
        }
    }

    if joined.is_file() {
        return Some(joined);
    }
    let index = joined.join("index.html");
    if index.is_file() {
        return Some(index);
    }
    None
}

async fn serve_file(path: PathBuf, cache: &'static str, extra: &[(header::HeaderName, &str)]) -> Response {
    let bytes = match tokio::fs::read(&path).await {
        Ok(bytes) => bytes,
        Err(_) => return not_found(),
    };

    let mut builder = Response::builder()
        .status(StatusCode::OK)
        .header(header::CONTENT_TYPE, content_type(&path))
        .header(header::CACHE_CONTROL, cache);

    for (name, value) in extra {
        builder = builder.header(name, *value);
    }

    builder.body(axum::body::Body::from(bytes)).unwrap()
}

fn content_type(path: &FsPath) -> &'static str {
    match path
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or_default()
        .to_ascii_lowercase()
        .as_str()
    {
        "html" => "text/html; charset=utf-8",
        "js" => "text/javascript; charset=utf-8",
        "css" => "text/css; charset=utf-8",
        "json" | "webmanifest" => "application/json",
        "svg" => "image/svg+xml",
        "png" => "image/png",
        "jpg" | "jpeg" => "image/jpeg",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "ico" => "image/x-icon",
        "woff" => "font/woff",
        "woff2" => "font/woff2",
        "txt" => "text/plain; charset=utf-8",
        "xml" => "application/xml",
        "map" => "application/json",
        _ => "application/octet-stream",
    }
}

fn not_found() -> Response {
    (
        StatusCode::NOT_FOUND,
        [(header::CACHE_CONTROL, "private, no-store")],
        "not found",
    )
        .into_response()
}

fn avatars() -> &'static [AvatarEntry] {
    static AVATARS: OnceLock<Vec<AvatarEntry>> = OnceLock::new();
    AVATARS.get_or_init(|| {
        serde_json::from_str(include_str!("avatars.json")).expect("avatars.json")
    })
}

fn find_avatar(handle: &str) -> Option<&'static AvatarEntry> {
    avatars()
        .iter()
        .find(|entry| entry.handle.eq_ignore_ascii_case(handle))
}

async fn resolve_x_avatar(handle: &str, fallback: &str) -> String {
    let url = format!("https://api.fxtwitter.com/{}", handle);
    let response = reqwest::Client::new()
        .get(url)
        .header(header::ACCEPT, "application/json")
        .send()
        .await;

    let Ok(response) = response else {
        return fallback.to_string();
    };
    if !response.status().is_success() {
        return fallback.to_string();
    }

    let Ok(payload) = response.json::<FxTwitterUserResponse>().await else {
        return fallback.to_string();
    };

    payload
        .user
        .and_then(|user| user.avatar_url)
        .map(|avatar| to_large_x_avatar_url(&avatar))
        .unwrap_or_else(|| fallback.to_string())
}

fn to_large_x_avatar_url(url: &str) -> String {
    let re = regex::Regex::new(r"_(normal|bigger|mini)(\.[A-Za-z]+)$").unwrap();
    re.replace(url, "_400x400$2").into_owned()
}

fn is_bot(user_agent: &str) -> bool {
    static PATTERN: OnceLock<regex::Regex> = OnceLock::new();
    let pattern = PATTERN.get_or_init(|| regex::Regex::new(BOT_UA).expect("bot ua"));
    pattern.is_match(user_agent)
}
