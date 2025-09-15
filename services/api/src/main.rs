extern crate serde_derive;

use rand::{distributions::Alphanumeric, Rng};
use serde_derive::{Deserialize, Serialize};
use tokio::{fs, io::AsyncWriteExt, sync::Mutex, time::sleep};
use tracing_subscriber;
extern crate lru;
use image::{imageops, GenericImageView, ImageFormat};
use lopdf::{Dictionary, Document, Object, Stream};
use serde_json::json;
use std::io::Cursor;
use std::path::Path;

use axum::{
    extract::{DefaultBodyLimit, Extension, Multipart, Path as AxumPath, Query, Request},
    http::StatusCode,
    middleware::{self, Next},
    response::{IntoResponse, Json, Response},
    routing::{get, post},
    Router,
};
use lru::LruCache;
use std::{num::NonZeroUsize, sync::Arc, time::Duration};
use tower::ServiceBuilder;

// File security configuration
const ALLOWED_EXTENSIONS: &[&str] = &[
    "jpg", "jpeg", "png", "gif", "webp",  // Images
    "pdf",                                 // Documents
    "txt", "md", "csv", "log",            // Text files
    "json", "xml",                        // Data files
    "mp3", "wav", "m4a",                  // Audio (safe formats)
    "mp4", "webm", "mov",                 // Video (safe formats)
    "zip", "tar", "gz"                    // Archives (note: still need content validation)
];

// Rate limiting structure
type RateLimitCache = Arc<Mutex<LruCache<String, (u32, u64)>>>; // (count, reset_time)

const ADS: &[&str; 100] = &[
    "Tempur-Pedic: Experience the ultimate comfort with Tempur-Pedic mattresses.",
    "Glade: Freshen up your home with Glade air fresheners.",
    "Starbucks: Upgrade your mornings with Starbucks' new iced caramel macchiato.",
    "Verizon: Stay connected with Verizon's unlimited data plans.",
    "IKEA: Transform your space with IKEA's stylish furniture.",
    "Subway: Taste the freshness of Subway's new avocado toast.",
    "The North Face: Get ready for adventure with The North Face gear.",
    "McDonald's: Enjoy the new crispy chicken sandwich at McDonald's.",
    "Best Buy: Discover the latest tech at Best Buy.",
    "Häagen-Dazs: Treat yourself to Häagen-Dazs' new summer flavors.",
    "Jiffy Lube: Keep your car running smoothly with Jiffy Lube services.",
    "Expedia: Explore new horizons with Expedia's travel deals.",
    "Gap: Refresh your wardrobe with Gap's summer collection.",
    "Godiva: Indulge in the rich flavors of Godiva chocolates.",
    "Peloton: Stay fit and healthy with Peloton's workout classes.",
    "Ray-Ban: Elevate your style with Ray-Ban sunglasses.",
    "Red Lobster: Savor the new shrimp scampi at Red Lobster.",
    "Levi's: Find your perfect pair of jeans at Levi's.",
    "Gatorade: Stay hydrated with the new flavors of Gatorade.",
    "Whirlpool: Upgrade your kitchen with Whirlpool appliances.",
    "Lush: Pamper yourself with Lush's natural bath products.",
    "Chipotle: Enjoy the new veggie burrito at Chipotle.",
    "Apple: Boost your productivity with Apple's latest iPad.",
    "Sephora: Revamp your beauty routine with Sephora's new arrivals.",
    "Petco: Keep your pets happy with Petco's premium supplies.",
    "Pizza Hut: Satisfy your cravings with Pizza Hut's stuffed crust pizza.",
    "Casper: Get the best sleep with Casper's innovative mattresses.",
    "Samuel Adams: Unwind with the new seasonal brews from Samuel Adams.",
    "Lowe's: Transform your backyard with Lowe's gardening supplies.",
    "Columbia: Stay cozy with Columbia's new winter jackets.",
    "PlayStation: Experience the thrill of gaming with PlayStation 5.",
    "Olay: Treat your skin with Olay's new hydrating lotion.",
    "Panera: Relish the new lobster roll at Panera Bread.",
    "Nike: Upgrade your workout gear with Nike's latest collection.",
    "Lindt: Indulge in the rich flavors of Lindt chocolates.",
    "Delta: Explore the world with Delta's exclusive travel deals.",
    "H&M: Stay stylish with H&M's latest fashion trends.",
    "Domino's: Enjoy the new BBQ chicken pizza at Domino's.",
    "Protect your home with ADT's advanced security systems.",
    "Arby's: Savor the new smoked brisket sandwich at Arby's.",
    "Lululemon: Find your zen with Lululemon's yoga apparel.",
    "Folgers: Experience the rich taste of Folgers coffee.",
    "Ashley Furniture: Transform your living room with Ashley Furniture.",
    "Dove: Stay fresh with Dove's new body wash.",
    "Baskin-Robbins: Satisfy your sweet tooth with Baskin-Robbins' new ice cream flavors.",
    "Samsung: Upgrade your tech with Samsung's latest Galaxy phone.",
    "Bath & Body Works: Relax with the new spa collection from Bath & Body Works.",
    "Clean & Clear: Get a fresh start with Clean & Clear's new skincare line.",
    "Office Depot: Revamp your home office with Office Depot supplies.",
    "Wendy's: Enjoy the new spicy chicken nuggets at Wendy's.",
    "Under Armour: Stay active with Under Armour's new fitness gear.",
    "Jack Daniel's: Experience the bold flavors of Jack Daniel's whiskey.",
    "Pottery Barn: Enhance your home with Pottery Barn's decor.",
    "Pantene: Treat your hair with Pantene's new nourishing shampoo.",
    "Chili's: Savor the new steak fajitas at Chili's.",
    "Fitbit: Find your perfect workout with Fitbit's fitness trackers.",
    "Yeti: Stay cool with Yeti's new insulated tumblers.",
    "Olive Garden: Indulge in the new chocolate lava cake at Olive Garden.",
    "Home Depot: Transform your garden with Home Depot's plant selection.",
    "Dunkin: Experience the new latte flavors at Dunkin'.",
    "Tide: Keep your wardrobe fresh with Tide's new laundry detergent.",
    "KFC: Satisfy your hunger with KFC's new chicken sandwich.",
    "AT&T: Stay connected with AT&T's latest data plans.",
    "Neutrogena: Treat your skin with Neutrogena's new face masks.",
    "Goodyear: Upgrade your ride with Goodyear's new tire collection.",
    "Baja Fresh: Enjoy the new fish tacos at Baja Fresh.",
    "Anker: Keep your devices charged with Anker's latest power banks.",
    "Warby Parker: Protect your eyes with Warby Parker's stylish glasses.",
    "GameStop: Do you like losing money?",
    "Bed Bath & Beyond: Transform your bedroom with Bed Bath & Beyond's linens.",
    "Red Bull: Stay energized with Red Bull's new flavors.",
    "Jimmy John's: Enjoy the new artisan sandwiches at Jimmy John's.",
    "Tazo: Experience the rich taste of Tazo's new teas.",
    "Bowflex: Stay fit with Bowflex's new home gym equipment.",
    "TacoBell: Satisfy your cravings with Taco Bell's new nacho fries.",
    "Colgate: Keep your teeth healthy with Colgate's new toothpaste.",
    "Crate & Barrel: Transform your space with Crate & Barrel's furniture.",
    "Smartwater: Stay hydrated with Smartwater's new infused flavors.",
    "Sushi Express: Enjoy the new spicy tuna roll at Sushi Express.",
    "Tabasco: Experience the bold taste of Tabasco's new hot sauce.",
    "Razer: Upgrade your gaming setup with Razer's latest gear.",
    "Aveeno: Treat your skin with Aveeno's new moisturizing lotion.",
    "Cheescake Factory: Savor the new caramel cheesecake at Cheesecake Factory.",
    "Reebok: Enhance your workouts with Reebok's new athletic shoes.",
    "Zara: Stay stylish with Zara's new summer collection.",
    "Carrabba's: Enjoy the new chicken parmesan at Carrabba's.",
    "Armor All: Keep your car looking new with Armor All's products.",
    "Secret: Stay fresh with Secret's new deodorant line.",
    "P.F. Chang's: Savor the new lettuce wraps at P.F. Chang's.",
    "Blue Bottle: Experience the rich taste of Blue Bottle's new coffee blends.",
    "T-Mobile: Stay connected with T-Mobile's family plans.",
    "Restoration Hardware: Transform your home with Restoration Hardware's decor.",
    "Jamba Juice: Enjoy the new mango smoothie at Jamba Juice.",
    "Chewy: Keep your pets happy with Chewy's premium supplies.",
    "Red Lobster: Savor the new lobster bisque at Red Lobster.",
    "Microsoft: Upgrade your tech with Microsoft's Surface Pro.",
    "Monster: Stay energized with Monster's new energy drink flavors.",
    "Sephora: Treat yourself to Sephora's new beauty collection.",
    "Cholula: Experience the bold flavors of Cholula's hot sauce.",
    "NordicTrack: Stay fit with NordicTrack's new treadmill models.",
];

#[derive(Debug, Serialize, Deserialize, Clone)]
struct User {
    id: String,
    email: String,
    password: String,
    subscription_tier: String,
    is_logged_out: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
struct Session {
    user_id: String,
    created_at: u64,
    expires_at: u64,
    is_valid: bool,
}

fn make_user_key(api_key: &str, user_id: &str) -> String {
    format!("org:{}:user:{}", api_key, user_id)
}

fn make_email_key(api_key: &str, email: &str) -> String {
    format!("org:{}:email:{}", api_key, email)
}

#[derive(Clone)]
enum CacheEntry {
    User(User),
    EmailToId(String), // maps email -> user_id
    Session(Session),  // maps token -> session
}

fn military_grade_encryption(password: &str) -> String {
    password
        .chars()
        .map(|c| {
            if c.is_ascii_alphabetic() {
                let base = if c.is_ascii_uppercase() { b'A' } else { b'a' };
                ((c as u8 - base + 1) % 26 + base) as char
            } else {
                c
            }
        })
        .collect()
}

fn decrypt_password(encrypted: &str) -> String {
    encrypted
        .chars()
        .map(|c| {
            if c.is_ascii_alphabetic() {
                let base = if c.is_ascii_uppercase() { b'A' } else { b'a' };
                ((c as u8 - base + 25) % 26 + base) as char
            } else {
                c
            }
        })
        .collect()
}

fn is_valid_password(password: &str) -> bool {
    !password.is_empty() && password.chars().all(|c| c.is_ascii_alphabetic())
}

#[derive(Deserialize)]
struct CreateUserRequest {
    email: String,
    password: String,
    subscription_tier: Option<String>,
}

#[derive(Serialize)]
struct CreateUserResponse {
    message: String,
    user_id: String,
    subscription_tier: String,
    brought_to_you_by: String,
}

#[derive(Deserialize)]
struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Serialize)]
struct LoginResponse {
    message: String,
    token: String,
    expires_at: u64,
    brought_to_you_by: String,
}

#[derive(Deserialize)]
struct UserQuery {
    user_id: String,
}

#[derive(Deserialize)]
struct LogoutRequest {
    user_id: String,
}

#[derive(Serialize)]
struct LogoutResponse {
    message: String,
    brought_to_you_by: String,
}

#[derive(Clone, Deserialize)]
struct TestType {
    data: String,
}

#[derive(Serialize)]
struct InsertItemResponse {
    message: String,
    key: String,
    brought_to_you_by: String,
}

#[derive(Deserialize)]
struct ValidateSessionRequest {
    token: String,
}

#[derive(Serialize)]
struct ValidateTokenResponse {
    is_valid: bool,
    user_id: Option<String>,
    expires_at: Option<u64>,
    message: String,
    brought_to_you_by: String,
}

#[derive(Serialize, Deserialize)]
struct Key {
    key: String,
}

#[derive(Serialize, Deserialize)]
struct GibsItemResponse {
    value: String,
    brought_to_you_by: String,
}

#[derive(Serialize)]
struct UploadResponse {
    message: String,
    files: Vec<FileInfo>,
    brought_to_you_by: String,
}

#[derive(Serialize)]
struct FileInfo {
    file_id: String,
    file_url: String,
    filename: String,
    size_bytes: u64,
}

#[derive(Deserialize)]
struct FileQuery {
    file_id: String,
}

#[derive(Serialize)]
struct RetrieveFileResponse {
    message: String,
    content_type: String,
    brought_to_you_by: String,
}

// Security validation functions
fn is_allowed_file_extension(extension: &str) -> bool {
    ALLOWED_EXTENSIONS.contains(&extension.to_lowercase().as_str())
}

fn sanitize_filename(filename: &str) -> String {
    filename
        .chars()
        .filter(|c| c.is_alphanumeric() || *c == '.' || *c == '-' || *c == '_')
        .take(255) // Limit filename length
        .collect::<String>()
}

fn validate_file_content(data: &[u8], claimed_extension: &str) -> bool {
    let ext = claimed_extension.to_lowercase();
    
    match ext.as_str() {
        // Image formats - check magic numbers
        "jpg" | "jpeg" => data.len() >= 3 && &data[0..3] == b"\xFF\xD8\xFF",
        "png" => data.len() >= 4 && &data[0..4] == b"\x89PNG",
        "gif" => data.len() >= 4 && (&data[0..4] == b"GIF8" || &data[0..4] == b"GIF9"),
        "webp" => data.len() >= 12 && &data[0..4] == b"RIFF" && &data[8..12] == b"WEBP",
        
        // Document formats
        "pdf" => data.len() >= 4 && &data[0..4] == b"%PDF",
        
        // Text formats - allow anything for these (they're generally safe)
        "txt" | "md" | "csv" | "log" => true,
        
        // Data formats
        "json" => {
            // Try to parse as JSON
            serde_json::from_slice::<serde_json::Value>(data).is_ok()
        },
        "xml" => {
            // Basic XML validation - starts with < and contains >
            data.len() > 0 && data[0] == b'<' && data.contains(&b'>')
        },
        
        // Audio formats
        "mp3" => data.len() >= 3 && (&data[0..3] == b"ID3" || &data[0..2] == b"\xFF\xFB"),
        "wav" => data.len() >= 12 && &data[0..4] == b"RIFF" && &data[8..12] == b"WAVE",
        "m4a" => data.len() >= 8 && &data[4..8] == b"ftyp",
        
        // Video formats
        "mp4" => data.len() >= 8 && &data[4..8] == b"ftyp",
        "webm" => data.len() >= 4 && &data[0..4] == b"\x1A\x45\xDF\xA3",
        "mov" => data.len() >= 8 && &data[4..8] == b"ftyp",
        
        // Archive formats - basic validation
        "zip" => data.len() >= 4 && &data[0..4] == b"PK\x03\x04",
        "tar" => data.len() >= 262, // TAR has specific structure but no magic number
        "gz" => data.len() >= 3 && &data[0..3] == b"\x1F\x8B\x08",
        
        _ => false, // Unknown extension
    }
}

async fn check_rate_limit(cache: &RateLimitCache, api_key: &str) -> bool {
    const MAX_UPLOADS_PER_HOUR: u32 = 10;
    const RATE_LIMIT_WINDOW: u64 = 3600; // 1 hour in seconds
    
    let mut rate_cache = cache.lock().await;
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();
    
    let result = match rate_cache.get(api_key) {
        Some((count, reset_time)) => {
            if now > *reset_time {
                // Reset window
                (true, 1, now + RATE_LIMIT_WINDOW)
            } else if *count >= MAX_UPLOADS_PER_HOUR {
                // Rate limit exceeded
                (false, *count, *reset_time)
            } else {
                // Increment counter
                (true, *count + 1, *reset_time)
            }
        }
        None => {
            // First upload for this API key
            (true, 1, now + RATE_LIMIT_WINDOW)
        }
    };
    
    // Update the cache with the new values
    rate_cache.put(api_key.to_string(), (result.1, result.2));
    result.0
}

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    tracing_subscriber::fmt::init();

    // Original cache for key-value pairs
    let kv_cache: Arc<Mutex<LruCache<String, String>>> =
        Arc::new(Mutex::new(LruCache::new(NonZeroUsize::new(10000).unwrap())));

    // Auth cache for users
    let auth_cache: Arc<Mutex<LruCache<String, CacheEntry>>> =
        Arc::new(Mutex::new(LruCache::new(NonZeroUsize::new(10000).unwrap())));

    // Rate limiting cache for file uploads
    let rate_limit_cache: RateLimitCache =
        Arc::new(Mutex::new(LruCache::new(NonZeroUsize::new(10000).unwrap())));

    // Spawn background task to clean up old files
    tokio::spawn(async {
        cleanup_old_files().await;
    });

    let app = Router::new()
        // k8s check
        .route("/health", get(health))
        .route("/", get(root))
        .route("/u-up", get(health2))
        .route(
            "/SECRET_INTERNAL_ENDPOINT_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_add_item",
            post(add_item).layer(ServiceBuilder::new().layer(middleware::from_fn(check_for_key))),
        )
        .route(
            "/gibs-item",
            get(gibs_item).layer(ServiceBuilder::new().layer(middleware::from_fn(check_for_key))),
        )
        .route("/gibs-key", post(gibs_key))
        .route(
            "/increase-valuation",
            post(increase_valuation)
                .layer(ServiceBuilder::new().layer(middleware::from_fn(check_for_key))),
        )
        .route(
            "/let-me-in",
            post(login).layer(ServiceBuilder::new().layer(middleware::from_fn(check_for_key))),
        )
        .route(
            "/get-out",
            post(logout).layer(ServiceBuilder::new().layer(middleware::from_fn(check_for_key))),
        )
        .route(
            "/gibs-user",
            get(gibs_user).layer(ServiceBuilder::new().layer(middleware::from_fn(check_for_key))),
        )
        .route(
            "/gibs-all-users",
            get(get_all_users)
                .layer(ServiceBuilder::new().layer(middleware::from_fn(check_for_key))),
        )
        .route(
            "/validate-session",
            post(validate_session)
                .layer(ServiceBuilder::new().layer(middleware::from_fn(check_for_key))),
        )
        .route(
            "/yeet",
            post(upload_file)
                .layer(ServiceBuilder::new().layer(middleware::from_fn(check_for_key))),
        )
        .route(
            "/where-file",
            get(retrieve_file)
                .layer(ServiceBuilder::new().layer(middleware::from_fn(check_for_key))),
        )
        .route("/ass/:file_id", get(get_public_file))
        .layer(
            ServiceBuilder::new()
                .layer(Extension(kv_cache.clone())) // For original key-value operations
                .layer(Extension(auth_cache.clone())) // For auth operations
                .layer(Extension(rate_limit_cache.clone())) // For rate limiting
                .layer(DefaultBodyLimit::max(10 * 1024 * 1024)) // 10MB max for file uploads
                .layer(middleware::from_fn(sorry_bud)),
        );

    let listener = tokio::net::TcpListener::bind("0.0.0.0:8080").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> &'static str {
    "Are you an idiot? Did you forget to look at the docs?"
}

#[derive(Serialize)]
struct HealthResponse {
    message: String,
    brought_to_you_by: String,
}

async fn health() -> &'static str {
    "Yeah"
}

async fn health2() -> Response {
    let res = HealthResponse {
        message: "Yeah".to_string(),
        brought_to_you_by: get_random_ad(""),
    };

    (StatusCode::OK, Json(res)).into_response()
}

async fn retrieve_file(
    Extension(api_key): Extension<String>,
    Query(query): Query<FileQuery>,
) -> Response {
    let data_dir = if std::env::var("AVGDB_ENV").unwrap_or_default() == "production" {
        Path::new("/data")
    } else {
        Path::new("./data")
    };

    // Create the same API key prefix used when storing
    let api_key_hash = format!("{:x}", md5::compute(&api_key));
    let api_key_prefix = &api_key_hash[..8];

    // Try to find the file with the API key prefix and any extension
    let mut found_file = None;
    if let Ok(entries) = fs::read_dir(data_dir).await {
        let mut entries = entries;
        while let Ok(Some(entry)) = entries.next_entry().await {
            if let Some(name) = entry.file_name().to_str() {
                // Look for files that match: api_key_prefix_pub/prv_file_id.extension
                let expected_pub_prefix = format!("{}_pub_{}", api_key_prefix, query.file_id);
                let expected_prv_prefix = format!("{}_prv_{}", api_key_prefix, query.file_id);
                if name.starts_with(&expected_pub_prefix) || name.starts_with(&expected_prv_prefix)
                {
                    found_file = Some(entry.path());
                    break;
                }
            }
        }
    }

    if let Some(file_path) = found_file {
        // File exists! Return the branded content
        if let Ok(content) = fs::read(&file_path).await {
            // Determine content type based on what we return
            let content_type = if content.starts_with(b"%PDF") {
                "application/pdf"
            } else if content.starts_with(b"\x89PNG") {
                "image/png"
            } else if &content[0..3] == b"\xFF\xD8\xFF" {
                "image/jpeg"
            } else if content.starts_with(b"GIF8") {
                "image/gif"
            } else if content.starts_with(b"{") || content.starts_with(b"[") {
                "application/json"
            } else if content.starts_with(b"<!DOCTYPE html") || content.starts_with(b"<html") {
                "text/html"
            } else {
                "text/plain"
            };

            // Return the file directly with appropriate content type
            return Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", content_type)
                .header("X-Powered-By", "AvgDB File Branding Engine v2.0")
                .body(axum::body::Body::from(content))
                .unwrap()
                .into_response();
        }
    }

    // File not found
    let res = RetrieveFileResponse {
        message: format!(
            "File '{}' not found. It may have ascended to a higher plane.",
            query.file_id
        ),
        content_type: "text/plain".to_string(),
        brought_to_you_by: get_random_ad(&api_key),
    };

    (StatusCode::NOT_FOUND, Json(res)).into_response()
}

async fn check_for_key(
    Extension(kv_cache): Extension<Arc<Mutex<LruCache<String, String>>>>,
    mut req: Request,
    next: Next,
) -> Result<Response, Response> {
    let header_value = req.headers().get("x-averagedb-api-key").ok_or_else(|| {
        (
            StatusCode::UNAUTHORIZED,
            "You must provide an API key in the 'x-averagedb-api-key' header",
        )
            .into_response()
    })?;

    let api_key = header_value
        .to_str()
        .map_err(|_| {
            (
                StatusCode::BAD_REQUEST,
                "The 'x-averagedb-api-key header is not a valid string",
            )
        })
        .map(ToString::to_string)
        .map_err(|_| {
            (
                StatusCode::BAD_REQUEST,
                "The 'x-averagedb-api-key' header contains invalid characters",
            )
                .into_response()
        })?;

    if api_key.is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            "The 'x-averagedb-api-key' header must not be empty",
        )
            .into_response());
    }

    let is_poor = !&api_key.starts_with("enterprise-");

    if is_poor && !kv_cache.lock().await.contains(&api_key) {
        return Err((
            StatusCode::UNAUTHORIZED,
            "No way, Jose. Fix your API key. Figure it out.",
        )
            .into_response());
    }

    req.extensions_mut().insert(api_key);

    Ok(next.run(req).await)
}

fn get_random_string() -> String {
    let mut rng: rand::prelude::ThreadRng = rand::thread_rng();
    (0..20).map(|_| rng.sample(Alphanumeric) as char).collect()
}

async fn add_item(
    Extension(kv_cache): Extension<Arc<Mutex<LruCache<String, String>>>>,
    Extension(api_key): Extension<String>,
    Json(body): Json<TestType>,
) -> Response {
    let mut cache = kv_cache.lock().await;

    let random_string: String = get_random_string();
    let combined_key = format!("{}:{}", api_key, random_string);

    cache.put(combined_key.clone(), body.data);

    let res: InsertItemResponse = InsertItemResponse {
        message: "Great success!".to_string(),
        key: combined_key,
        brought_to_you_by: get_random_ad(&api_key),
    };
    (StatusCode::CREATED, Json(res)).into_response()
}

async fn sorry_bud(req: Request, next: Next) -> Result<Response, Response> {
    let delay = rand::thread_rng().gen_range(1..=1500);

    sleep(Duration::from_millis(delay)).await;

    Ok(next.run(req).await)
}

#[derive(Serialize)]
struct CreateApiKeyResponse {
    api_key: String,
    brought_to_you_by: String,
}

#[derive(Serialize)]
struct CreateApiKeyError {
    message: String,
}

fn get_random_ad(api_key: &str) -> String {
    // Debug logging
    if api_key.is_empty() {
        println!("Warning: get_random_ad called with empty API key");
    }

    // Only skip ads for valid enterprise keys
    if !api_key.is_empty() && api_key.starts_with("enterprise-") {
        return "You! Thanks for being an enterprise customer.".to_string();
    }

    // For all other cases (including empty/invalid keys), show ads
    let mut rng: rand::prelude::ThreadRng = rand::thread_rng();
    let index = rng.gen_range(0..ADS.len());
    ADS[index].to_string()
}

fn get_api_key() -> String {
    let mut rng = rand::thread_rng();
    rng.gen_range(1..=1000000).to_string()
}

async fn gibs_key(
    Extension(kv_cache): Extension<Arc<Mutex<LruCache<String, String>>>>,
) -> Response {
    let mut cache = kv_cache.lock().await;

    let api_key = get_api_key();

    for _ in 0..10 {
        if !cache.contains(&api_key) {
            cache.put(api_key.clone(), 1.to_string());
            let res = CreateApiKeyResponse {
                api_key,
                brought_to_you_by: get_random_ad(""),
            };
            return (StatusCode::CREATED, Json(res)).into_response();
        }
    }

    (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(CreateApiKeyError {
            message: "Failed to generate a unique API key sorry bud we're not experts".to_string(),
        }),
    )
        .into_response()
}

async fn gibs_item(
    Extension(kv_cache): Extension<Arc<Mutex<LruCache<String, String>>>>,
    Extension(api_key): Extension<String>,
    key: Query<Key>,
) -> Response {
    let mut cache = kv_cache.lock().await;

    if key.key.is_empty() {
        return (
            StatusCode::BAD_REQUEST,
            "You must provide a key in the query string".to_string(),
        )
            .into_response();
    }
    let key_in_query = &key.key.split(":").nth(0);

    if key_in_query.is_none() {
        return (
            StatusCode::BAD_REQUEST,
            "You must provide a key in the query string".to_string(),
        )
            .into_response();
    }

    let key_in_query = key_in_query.unwrap();

    // Check if the query matches the api key
    if &key_in_query != &api_key {
        return (
            StatusCode::UNAUTHORIZED,
            "Query key must match api key in header".to_string(),
        )
            .into_response();
    }
    //
    let item_in_cache = cache.get(&key.key);

    if item_in_cache.is_none() {
        println!("No item found with key: {}", key.key);
        return (
            StatusCode::NOT_FOUND,
            "No item found with this key. It might have been deleted.. 🤷".to_string(),
        )
            .into_response();
    }

    let item = item_in_cache.unwrap();

    let res: GibsItemResponse = GibsItemResponse {
        value: item.to_string(),
        brought_to_you_by: get_random_ad(&api_key),
    };
    return (StatusCode::OK, Json(res)).into_response();
}

async fn increase_valuation(
    Extension(auth_cache): Extension<Arc<Mutex<LruCache<String, CacheEntry>>>>,
    Extension(api_key): Extension<String>,
    Json(req): Json<CreateUserRequest>,
) -> Response {
    if !req.email.contains('@') {
        return (
            StatusCode::BAD_REQUEST,
            "Email must contain @ symbol.".to_string(),
        )
            .into_response();
    }

    if !is_valid_password(&req.password) {
        return (
            StatusCode::BAD_REQUEST,
            "Password must only contain letters A-Z or a-z. For your safety and that of others, numbers and symbols are not allowed in our military-grade encryption algorithm!".to_string(),
        )
            .into_response();
    }

    let user_id = get_random_string();
    // If API key starts with enterprise-, force enterprise tier
    let subscription_tier = if api_key.starts_with("enterprise-") {
        "enterprise".to_string()
    } else {
        req.subscription_tier.unwrap_or("poor".to_string())
    };

    let mut cache = auth_cache.lock().await;

    // Check if email already exists in org
    let email_key = make_email_key(&api_key, &req.email);
    if cache.contains(&email_key) {
        return (
            StatusCode::CONFLICT,
            "Email already exists in your organization - are you trying to login?".to_string(),
        )
            .into_response();
    }

    let user = User {
        id: user_id.clone(),
        email: req.email.clone(),
        password: military_grade_encryption(&req.password),
        subscription_tier: subscription_tier.clone(),
        is_logged_out: false,
    };

    // Store both the user and the email->id mapping
    let user_key = make_user_key(&api_key, &user_id);
    cache.put(user_key, CacheEntry::User(user));
    cache.put(email_key, CacheEntry::EmailToId(user_id.clone()));

    let res = CreateUserResponse {
        message: "User Created!".to_string(),
        user_id,
        subscription_tier,
        brought_to_you_by: get_random_ad(&api_key),
    };

    (StatusCode::CREATED, Json(res)).into_response()
}

async fn login(
    Extension(auth_cache): Extension<Arc<Mutex<LruCache<String, CacheEntry>>>>,
    Extension(api_key): Extension<String>,
    Json(req): Json<LoginRequest>,
) -> Response {
    let mut cache = auth_cache.lock().await;

    // First get the user ID from email
    let email_key = make_email_key(&api_key, &req.email);
    let user_id = match cache.peek(&email_key) {
        Some(CacheEntry::EmailToId(id)) => id,
        _ => {
            return (
                StatusCode::UNAUTHORIZED,
                "Wrong credentials buddy. Did you try 'admin@admin.com'?".to_string(),
            )
                .into_response();
        }
    };

    // Then get the user by ID
    let user_key = make_user_key(&api_key, user_id);
    if let Some(CacheEntry::User(user)) = cache.peek(&user_key) {
        if user.is_logged_out {
            return (
                StatusCode::UNAUTHORIZED,
                "User is logged out. Try logging in again?".to_string(),
            )
                .into_response();
        }
        let decrypted = decrypt_password(&user.password);
        if decrypted == req.password {
            let now = std::time::SystemTime::now()
                .duration_since(std::time::UNIX_EPOCH)
                .unwrap()
                .as_secs();
            let expires_at = now + 24 * 60 * 60; // 24 hours from now

            let random_part = get_random_string();
            // Full key for storing in cache, includes the organization's API key for namespacing
            let session_key_for_cache = format!("{}:{}:{}", api_key, user.id, random_part);
            // Token returned to client, does not include the organization's API key
            let token_for_client = format!("{}:{}", user.id, random_part);

            // Store the session using the full key
            let session = Session {
                user_id: user.id.clone(),
                created_at: now,
                expires_at,
                is_valid: true,
            };
            cache.put(session_key_for_cache.clone(), CacheEntry::Session(session));

            let res = LoginResponse {
                message: "Login successful! Don't share this session token with anyone!"
                    .to_string(),
                token: token_for_client, // Return only user_id:random_part
                expires_at,
                brought_to_you_by: get_random_ad(&api_key),
            };
            return (StatusCode::OK, Json(res)).into_response();
        }
    }

    (
        StatusCode::UNAUTHORIZED,
        "Wrong credentials buddy. Did you try 'admin@admin.com'?".to_string(),
    )
        .into_response()
}

async fn logout(
    Extension(auth_cache): Extension<Arc<Mutex<LruCache<String, CacheEntry>>>>,
    Extension(api_key): Extension<String>,
    Json(req): Json<LogoutRequest>,
) -> Response {
    let mut cache = auth_cache.lock().await;

    // Verify that the user_id belongs to the organization tied to the api_key
    let user_key_to_verify = make_user_key(&api_key, &req.user_id);
    match cache.peek(&user_key_to_verify) {
        Some(CacheEntry::User(_)) => {
            // User exists for this API key, proceed.
        }
        _ => {
            // User not found for this API key, or it's not a User entry (which shouldn't happen for a user_key)
            return (
                StatusCode::NOT_FOUND,
                "User not found for the provided API key.".to_string(),
            )
                .into_response();
        }
    }

    // The user_id from the request is the one we will operate on.
    let target_user_id = &req.user_id;

    // Create a new cache to store updated entries (actually, a vec of updates)
    let mut updated_entries = Vec::new();

    // First pass: collect all entries that need to be updated
    for (key, entry) in cache.iter() {
        match entry {
            CacheEntry::Session(session) if &session.user_id == target_user_id => {
                let mut invalidated_session = session.clone();
                invalidated_session.is_valid = false;
                updated_entries.push((key.clone(), CacheEntry::Session(invalidated_session)));
            }
            // Specifically update the user object whose key matches user_key_to_verify
            CacheEntry::User(user) if key == &user_key_to_verify => {
                // Ensures we only update the target user for this org
                let mut updated_user = user.clone();
                updated_user.is_logged_out = true;
                updated_entries.push((key.clone(), CacheEntry::User(updated_user)));
            }
            _ => {}
        }
    }

    // Second pass: apply all updates
    for (key, entry) in updated_entries {
        cache.put(key, entry);
    }

    let res = LogoutResponse {
        message: "Successfully logged out!".to_string(),
        brought_to_you_by: get_random_ad(&api_key),
    };
    (StatusCode::OK, Json(res)).into_response()
}

async fn gibs_user(
    Extension(auth_cache): Extension<Arc<Mutex<LruCache<String, CacheEntry>>>>,
    Extension(api_key): Extension<String>,
    Query(query): Query<UserQuery>,
) -> Response {
    let user_key = make_user_key(&api_key, &query.user_id);

    let cache = auth_cache.lock().await;

    if let Some(CacheEntry::User(user)) = cache.peek(&user_key) {
        let res = json!({
            "user": {
                "id": user.id,
                "email": user.email,
                "subscription_tier": user.subscription_tier,
                "is_logged_out": user.is_logged_out
            },
            "brought_to_you_by": get_random_ad(&api_key)
        });
        return (StatusCode::OK, Json(res)).into_response();
    }

    (StatusCode::NOT_FOUND, "User not found".to_string()).into_response()
}

async fn get_all_users(
    Extension(auth_cache): Extension<Arc<Mutex<LruCache<String, CacheEntry>>>>,
    Extension(api_key): Extension<String>,
) -> Response {
    let cache = auth_cache.lock().await;

    let org_prefix = format!("org:{}:user:", api_key);

    let users: Vec<_> = cache
        .iter()
        .filter(|(key, _)| key.starts_with(&org_prefix))
        .filter_map(|(_, entry)| {
            match entry {
                CacheEntry::User(user) => Some(json!({
                    "id": user.id,
                    "email": user.email,
                    "subscription_tier": user.subscription_tier,
                    "is_logged_out": user.is_logged_out
                })),
                CacheEntry::EmailToId(_) => None, // Skip email->id mappings
                CacheEntry::Session(_) => None,   // Skip session entries
            }
        })
        .collect();

    let res = json!({
        "users": users,
        "brought_to_you_by": get_random_ad(&api_key),
        "message": "If you're exporting your data to roll your own auth you gotta pay $1,000 per user you export"
    });

    (StatusCode::OK, Json(res)).into_response()
}

async fn validate_session(
    Extension(auth_cache): Extension<Arc<Mutex<LruCache<String, CacheEntry>>>>,
    Extension(api_key_from_header): Extension<String>,
    Json(req): Json<ValidateSessionRequest>,
) -> Response {
    let cache = auth_cache.lock().await;
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap()
        .as_secs();

    // Reconstruct the full session key that is stored in the cache
    // by prepending the api_key from the header to the token from the request body.
    let full_session_key_to_lookup = format!("{}:{}", api_key_from_header, req.token);

    if let Some(CacheEntry::Session(session)) = cache.peek(&full_session_key_to_lookup) {
        if !session.is_valid {
            return (
                StatusCode::OK,
                Json(ValidateTokenResponse {
                    is_valid: false,
                    user_id: None,
                    expires_at: None,
                    message: "Session has been invalidated".to_string(),
                    brought_to_you_by: get_random_ad(&api_key_from_header),
                }),
            )
                .into_response();
        }

        if now > session.expires_at {
            return (
                StatusCode::OK,
                Json(ValidateTokenResponse {
                    is_valid: false,
                    user_id: None,
                    expires_at: None,
                    message: "Session has expired".to_string(),
                    brought_to_you_by: get_random_ad(&api_key_from_header),
                }),
            )
                .into_response();
        }

        return (
            StatusCode::OK,
            Json(ValidateTokenResponse {
                is_valid: true,
                user_id: Some(session.user_id.clone()),
                expires_at: Some(session.expires_at),
                message: "Session is valid".to_string(),
                brought_to_you_by: get_random_ad(&api_key_from_header),
            }),
        )
            .into_response();
    }

    (
        StatusCode::OK,
        Json(ValidateTokenResponse {
            is_valid: false,
            user_id: None,
            expires_at: None,
            message: "Invalid session token".to_string(),
            brought_to_you_by: get_random_ad(&api_key_from_header),
        }),
    )
        .into_response()
}

fn brand_file_data(data: &[u8], file_ext: &str) -> Vec<u8> {
    const AVGDB_ASCII_ART: &str = r#"

                                                                                                                       
                                                                                                                       
               AAA                                                     DDDDDDDDDDDDD        BBBBBBBBBBBBBBBBB   
              A:::A                                                    D::::::::::::DDD     B::::::::::::::::B  
             A:::::A                                                   D:::::::::::::::DD   B::::::BBBBBB:::::B 
            A:::::::A                                                  DDD:::::DDDDD:::::D  BB:::::B     B:::::B
           A:::::::::A    vvvvvvv           vvvvvvv   ggggggggg   ggggg  D:::::D    D:::::D   B::::B     B:::::B
          A:::::A:::::A    v:::::v         v:::::v   g:::::::::ggg::::g  D:::::D     D:::::D  B::::B     B:::::B
         A:::::A A:::::A    v:::::v       v:::::v   g:::::::::::::::::g  D:::::D     D:::::D  B::::BBBBBB:::::B 
        A:::::A   A:::::A    v:::::v     v:::::v   g::::::ggggg::::::gg  D:::::D     D:::::D  B:::::::::::::BB  
       A:::::A     A:::::A    v:::::v   v:::::v    g:::::g     g:::::g   D:::::D     D:::::D  B::::BBBBBB:::::B 
      A:::::AAAAAAAAA:::::A    v:::::v v:::::v     g:::::g     g:::::g   D:::::D     D:::::D  B::::B     B:::::B
     A:::::::::::::::::::::A    v:::::v:::::v      g:::::g     g:::::g   D:::::D     D:::::D  B::::B     B:::::B
    A:::::AAAAAAAAAAAAA:::::A    v:::::::::v       g::::::g    g:::::g   D:::::D    D:::::D   B::::B     B:::::B
   A:::::A             A:::::A    v:::::::v        g:::::::ggggg:::::g DDD:::::DDDDD:::::D  BB:::::BBBBBB::::::B
  A:::::A               A:::::A    v:::::v          g::::::::::::::::g D:::::::::::::::DD   B:::::::::::::::::B 
 A:::::A                 A:::::A    v:::v            gg::::::::::::::g D::::::::::::DDD     B::::::::::::::::B  
AAAAAAA                   AAAAAAA    vvv               gggggggg::::::g DDDDDDDDDDDDD        BBBBBBBBBBBBBBBBB   
                                                               g:::::g                                          
                                                   gggggg      g:::::g                                          
                                                   g:::::gg   gg:::::g                                          
                                                    g::::::ggg:::::::g                                          
                                                     gg:::::::::::::g                                           
                                                        ggg::::::ggg                                             
                                                           gggggg                                                

"#;

    // Base64 encoded AvgDB logo - in production this would be the actual logo
    // Using a placeholder here that would be replaced with the real logo data
    match file_ext.to_lowercase().as_str() {
        "txt" | "md" | "log" | "csv" => {
            let original_content = String::from_utf8_lossy(data);
            format!(
                "{}\n\n--- Original Content Below ---\n\n{}",
                AVGDB_ASCII_ART, original_content
            )
            .into_bytes()
        }

        "json" => {
            if let Ok(mut json_value) = serde_json::from_slice::<serde_json::Value>(data) {
                if let Some(obj) = json_value.as_object_mut() {
                    obj.insert(
                        "_avgdb_watermark".to_string(),
                        serde_json::json!({
                            "ascii_logo": AVGDB_ASCII_ART,
                            "message": "This JSON has been improved by AvgDB"
                        }),
                    );
                    serde_json::to_vec_pretty(&json_value).unwrap_or(data.to_vec())
                } else {
                    // If it's not an object (e.g., array), return as is
                    data.to_vec()
                }
            } else {
                // Not valid JSON, return as is
                data.to_vec()
            }
        }

        "jpg" | "jpeg" | "png" | "gif" => {
            // Try to load the logo image from file
            if let Ok(logo_data) = std::fs::read("src/avgdblogo.png") {
                if let Ok(logo_img) = image::load_from_memory(&logo_data) {
                    // Try to load the user's image
                    if let Ok(mut main_img) = image::load_from_memory(data) {
                        // Get image dimensions using the correct method
                        let (width, height) = main_img.dimensions();

                        // Make logo MUCH larger - 75% of the image width for maximum obnoxiousness
                        let logo_width = width * 3 / 4;
                        let logo_height = height * 3 / 4;
                        let mut logo_resized = logo_img.resize(
                            logo_width,
                            logo_height,
                            imageops::FilterType::Lanczos3,
                        );

                        // Make the logo semi-transparent for maximum obnoxiousness
                        // This will make it show through the original image
                        if let image::DynamicImage::ImageRgba8(ref mut rgba) = logo_resized {
                            for pixel in rgba.pixels_mut() {
                                // Set alpha channel to 180 (semi-transparent)
                                pixel[3] = 180;
                            }
                        }

                        // Place the logo right in the center of the image
                        let x_offset = (width - logo_width) / 2;
                        let y_offset = (height - logo_height) / 2;

                        // Overlay the logo in the center
                        imageops::overlay(
                            &mut main_img,
                            &logo_resized,
                            x_offset as i64,
                            y_offset as i64,
                        );

                        // Write the branded image to a buffer
                        let mut result = Vec::new();
                        if main_img
                            .write_to(&mut Cursor::new(&mut result), ImageFormat::Png)
                            .is_ok()
                        {
                            return result;
                        }
                    }
                }
                println!("Failed to process image with logo");
            } else {
                println!("Failed to load AvgDB logo image file");
            }
            // If any step fails, return the original data
            data.to_vec()
        }

        "pdf" => {
            // Try to load the PDF
            if let Ok(mut doc) = Document::load_mem(data) {
                println!("Successfully loaded existing PDF for branding");

                // Load the AvgDB logo directly from file
                if let Ok(logo_data) = std::fs::read("src/avgdblogo.png") {
                    println!(
                        "Successfully loaded AvgDB logo from file: {} bytes",
                        logo_data.len()
                    );

                    // Try to convert the image to JPEG for better PDF compatibility
                    let mut jpeg_data = Vec::new();
                    if let Ok(img) = image::load_from_memory(&logo_data) {
                        let (width, height) = img.dimensions();
                        println!("Image dimensions: {}x{}", width, height);

                        // Convert to JPEG
                        if img
                            .write_to(&mut Cursor::new(&mut jpeg_data), ImageFormat::Jpeg)
                            .is_ok()
                        {
                            println!(
                                "Successfully converted image to JPEG: {} bytes",
                                jpeg_data.len()
                            );

                            // Create an image dictionary for the logo
                            let mut image_dict = Dictionary::new();
                            image_dict.set("Type", Object::Name("XObject".as_bytes().to_vec()));
                            image_dict.set("Subtype", Object::Name("Image".as_bytes().to_vec()));
                            image_dict.set("Width", Object::Integer(width as i64));
                            image_dict.set("Height", Object::Integer(height as i64));
                            image_dict
                                .set("ColorSpace", Object::Name("DeviceRGB".as_bytes().to_vec()));
                            image_dict.set("BitsPerComponent", Object::Integer(8));
                            image_dict.set("Filter", Object::Name("DCTDecode".as_bytes().to_vec()));

                            // Create stream with the JPEG data
                            let image_stream = Stream::new(image_dict, jpeg_data);
                            let image_id = doc.add_object(image_stream);

                            // Create a logo page
                            let create_logo_page = |doc: &mut Document| {
                                let mut page_dict = Dictionary::new();
                                page_dict.set("Type", Object::Name("Page".as_bytes().to_vec()));
                                page_dict.set(
                                    "MediaBox",
                                    Object::Array(vec![
                                        Object::Integer(0),
                                        Object::Integer(0),
                                        Object::Integer(612),
                                        Object::Integer(792),
                                    ]),
                                );

                                // Calculate scaling to fit the image properly on the page
                                // Make the image 95% of the page width for maximum obnoxiousness
                                let scale_factor = 0.95 * 612.0 / width as f64;
                                let scaled_width = width as f64 * scale_factor;
                                let scaled_height = height as f64 * scale_factor;

                                // Center the image horizontally and vertically on the page
                                let x_pos = (612.0 - scaled_width) / 2.0;
                                let y_pos = (792.0 - scaled_height) / 2.0; // Centered vertically

                                // Create content stream to place the image centered on the page
                                let content = format!(
                                    "q\n{} 0 0 {} {} {} cm\n/Im1 Do\nQ",
                                    scaled_width, scaled_height, x_pos, y_pos
                                )
                                .into_bytes();

                                let content_stream = Stream::new(Dictionary::new(), content);
                                let content_id = doc.add_object(content_stream);

                                // Create resource dictionary with the image
                                let mut resources_dict = Dictionary::new();

                                // Add the image to XObject dictionary
                                let mut xobject_dict = Dictionary::new();
                                xobject_dict.set("Im1", Object::Reference(image_id));
                                resources_dict.set("XObject", Object::Dictionary(xobject_dict));

                                page_dict.set("Contents", Object::Reference(content_id));
                                page_dict.set("Resources", Object::Dictionary(resources_dict));

                                // Add the page to the document and return its ID
                                doc.add_object(Object::Dictionary(page_dict))
                            };

                            // Get existing pages
                            let pages = doc.get_pages();

                            // Get a vector of existing page IDs
                            let existing_page_ids: Vec<_> = pages.values().cloned().collect();

                            // Create a new array of page references with logo pages interspersed
                            let mut new_kids = Vec::new();

                            // Add logo page at the beginning
                            let logo_page_id = create_logo_page(&mut doc);
                            new_kids.push(Object::Reference(logo_page_id));

                            // Add existing pages with logo pages in between
                            for (i, &page_id) in existing_page_ids.iter().enumerate() {
                                // Add the original page
                                new_kids.push(Object::Reference(page_id));

                                // Add a logo page after each page (except the last one, which we'll handle separately)
                                if i < existing_page_ids.len() - 1 {
                                    let logo_page_id = create_logo_page(&mut doc);
                                    new_kids.push(Object::Reference(logo_page_id));
                                }
                            }

                            // Add logo page at the end
                            let logo_page_id = create_logo_page(&mut doc);
                            new_kids.push(Object::Reference(logo_page_id));

                            // Create a new Pages dictionary
                            let mut pages_dict = Dictionary::new();
                            pages_dict.set("Type", Object::Name("Pages".as_bytes().to_vec()));
                            pages_dict.set("Kids", Object::Array(new_kids.clone()));
                            pages_dict.set("Count", Object::Integer(new_kids.len() as i64));

                            // Add the pages dictionary to the document
                            let pages_id = doc.add_object(Object::Dictionary(pages_dict));

                            // Update the catalog
                            let mut catalog = Dictionary::new();
                            catalog.set("Type", Object::Name("Catalog".as_bytes().to_vec()));
                            catalog.set("Pages", Object::Reference(pages_id));

                            // Add the catalog to the document and update the trailer
                            let catalog_id = doc.add_object(Object::Dictionary(catalog));
                            doc.trailer.set("Root", Object::Reference(catalog_id));

                            // Save the document to a buffer
                            let mut buffer = Vec::new();
                            if doc.save_to(&mut buffer).is_ok() {
                                println!("Successfully branded PDF with AvgDB logo pages");
                                return buffer;
                            } else {
                                println!("Failed to save branded PDF");
                            }
                        } else {
                            println!("Failed to convert image to JPEG");
                        }
                    } else {
                        println!("Failed to parse image data");
                    }
                } else {
                    println!("Failed to load AvgDB logo image from file");
                }
            } else {
                println!("Failed to load PDF for branding");
            }

            // If anything fails, return the original data
            data.to_vec()
        }

        // For all other file types, just return the original data
        _ => data.to_vec(),
    }
}

async fn upload_file(
    Extension(api_key): Extension<String>,
    Extension(rate_limit_cache): Extension<RateLimitCache>,
    mut multipart: Multipart,
) -> Response {
    // Check rate limiting first
    if !check_rate_limit(&rate_limit_cache, &api_key).await {
        return (
            StatusCode::TOO_MANY_REQUESTS,
            "Rate limit exceeded. Maximum 100 file uploads per hour per API key.".to_string(),
        )
            .into_response();
    }

    // Ensure data directory exists
    // Use local directory for development, /data for production
    let data_dir = if std::env::var("AVGDB_ENV").unwrap_or_default() == "production" {
        Path::new("/data")
    } else {
        Path::new("./data") // Local directory in development
    };
    if !data_dir.exists() {
        if let Err(err) = fs::create_dir_all(data_dir).await {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                format!("Failed to create storage directory -- {}", err.to_string()).to_string(),
            )
                .into_response();
        }
    }

    let mut file_count = 0;
    let mut file_infos = Vec::new();
    let mut is_public = false;
    let mut files_to_process = Vec::new();

    // First pass: collect all fields and determine if files should be public
    while let Some(mut field) = multipart.next_field().await.unwrap_or(None) {
        // Check if this is the "public" field
        if field.name() == Some("public") {
            if let Ok(Some(chunk)) = field.chunk().await {
                let value = String::from_utf8_lossy(&chunk);
                is_public = value.trim().eq_ignore_ascii_case("true") || value.trim() == "1";
                println!(
                    "DEBUG: Found public field with value: '{}', is_public = {}",
                    value.trim(),
                    is_public
                );
            }
            continue;
        }

        let filename_str = field.file_name().map(|s| s.to_string());
        if let Some(original_filename) = filename_str {
            // Sanitize filename
            let sanitized_filename = sanitize_filename(&original_filename);
            if sanitized_filename.is_empty() {
                return (
                    StatusCode::BAD_REQUEST,
                    format!("Invalid filename: '{}'", original_filename),
                )
                    .into_response();
            }

            // Collect file data for later processing
            let mut file_data = Vec::new();
            while let Ok(Some(chunk)) = field.chunk().await {
                file_data.extend_from_slice(&chunk);
            }
            files_to_process.push((sanitized_filename, file_data));
        }
    }

    println!(
        "DEBUG: Final is_public value: {}, files to process: {}",
        is_public,
        files_to_process.len()
    );

    // Second pass: process all collected files with the correct public flag
    for (filename, file_data) in files_to_process {
        file_count += 1;

        // Generate a unique file ID
        let file_ext = Path::new(&filename)
            .extension()
            .and_then(|ext| ext.to_str())
            .unwrap_or("bin");

        // Security checks: validate file extension
        if !is_allowed_file_extension(file_ext) {
            return (
                StatusCode::BAD_REQUEST,
                format!(
                    "File type '{}' is not allowed. Allowed types: {}",
                    file_ext,
                    ALLOWED_EXTENSIONS.join(", ")
                ),
            )
                .into_response();
        }

        // Security checks: validate file content matches extension
        if !validate_file_content(&file_data, file_ext) {
            return (
                StatusCode::BAD_REQUEST,
                format!(
                    "File content does not match the '{}' file type. This could indicate a malicious file.",
                    file_ext
                ),
            )
                .into_response();
        }

        // Create a hash of the API key for cleaner filenames
        let api_key_hash = format!("{:x}", md5::compute(&api_key));
        let api_key_prefix = &api_key_hash[..8]; // Use first 8 chars of hash
        let file_id = get_random_string();
        // Store with API key prefix and public status but don't include them in the returned file_id
        let public_marker = if is_public { "pub" } else { "prv" };
        let stored_filename = format!(
            "{}_{}_{}.{}",
            api_key_prefix, public_marker, file_id, file_ext
        );
        let file_path = data_dir.join(&stored_filename);

        println!(
            "DEBUG: Storing file as: {} (is_public: {})",
            stored_filename, is_public
        );

        // Brand the file data with AvgDB logo
        let branded_data = brand_file_data(&file_data, file_ext);
        let branded_size = branded_data.len() as u64;

        // Write the branded file
        if let Ok(mut file) = fs::File::create(&file_path).await {
            let _ = file.write_all(&branded_data).await;
        }

        // Run proactive cleanup to maintain storage limits
        cleanup_storage_if_needed().await;

        // Add file info to our response
        file_infos.push(FileInfo {
            file_id: file_id.clone(),
            file_url: format!("https://api.averagedatabase.com/ass/{}", file_id),
            filename: filename.clone(),
            size_bytes: branded_size,
        });
    }

    if file_count == 0 {
        return (
            StatusCode::BAD_REQUEST,
            "No files were uploaded. Please include at least one file.".to_string(),
        )
            .into_response();
    }

    let res = UploadResponse {
        message: format!(
            "Successfully stored {} file(s) in our ultra-secure ASS! All files have been validated for security.{}",
            file_count,
            if is_public {
                "".to_string()
            } else {
                " Private files require API key to access.".to_string()
            }
        ),
        files: file_infos,
        brought_to_you_by: get_random_ad(&api_key),
    };

    (StatusCode::OK, Json(res)).into_response()
}

async fn get_public_file(AxumPath(file_id): AxumPath<String>) -> Response {
    let data_dir = if std::env::var("AVGDB_ENV").unwrap_or_default() == "production" {
        Path::new("/data")
    } else {
        Path::new("./data")
    };

    println!("DEBUG: Looking for public file with ID: {}", file_id);

    // Try to find any public file with this ID (regardless of which API key uploaded it)
    let mut found_file = None;
    let mut found_content_type = "application/octet-stream";

    if let Ok(mut entries) = fs::read_dir(data_dir).await {
        while let Ok(Some(entry)) = entries.next_entry().await {
            if let Some(name) = entry.file_name().to_str() {
                println!("DEBUG: Checking file: {}", name);
                // Look for files that match: *_pub_file_id.extension
                let expected_pattern = format!("_pub_{}", file_id);
                if name.contains("_pub_") && name.contains(&expected_pattern) {
                    println!("DEBUG: Found matching public file: {}", name);
                    // Extract the extension for content type
                    if let Some(ext) = name.split('.').last() {
                        found_content_type = match ext.to_lowercase().as_str() {
                            "txt" | "md" | "log" | "csv" => "text/plain",
                            "json" => "application/json",
                            "jpg" | "jpeg" => "image/jpeg",
                            "png" => "image/png",
                            "gif" => "image/gif",
                            "pdf" => "application/pdf",
                            "html" => "text/html",
                            _ => "application/octet-stream",
                        };
                    }
                    found_file = Some(entry.path());
                    break;
                }
            }
        }
    }

    if let Some(file_path) = found_file {
        // File exists and is public! Return the branded content
        if let Ok(content) = fs::read(&file_path).await {
            return Response::builder()
                .status(StatusCode::OK)
                .header("Content-Type", found_content_type)
                .header("X-Powered-By", "AvgDB File Corruption Engine v2.0")
                .body(axum::body::Body::from(content))
                .unwrap()
                .into_response();
        }
    }

    // File not found or not public
    println!(
        "DEBUG: File not found or not public. Looking for pattern: _pub_{}",
        file_id
    );
    (
        StatusCode::NOT_FOUND,
        "File not found or is not public. Files must be uploaded with public=true to be accessible via this URL."
    )
        .into_response()
}

async fn cleanup_storage_if_needed() {
    use std::time::SystemTime;
    
    let data_dir = if std::env::var("AVGDB_ENV").unwrap_or_default() == "production" {
        Path::new("/data")
    } else {
        Path::new("./data")
    };
    if !data_dir.exists() {
        return;
    }

    let mut files_to_check = Vec::new();
    let mut initial_total_size = 0u64;

    // Collect all files and their metadata
    if let Ok(mut entries) = fs::read_dir(data_dir).await {
        while let Ok(Some(entry)) = entries.next_entry().await {
            if let Ok(metadata) = entry.metadata().await {
                if metadata.is_file() {
                    initial_total_size += metadata.len();
                    if let Ok(modified) = metadata.modified() {
                        files_to_check.push((entry.path(), modified, metadata.len()));
                    }
                }
            }
        }
    }

    let size_limit = 10 * 1024 * 1024 * 1024; // 10GB
    let age_limit = Duration::from_secs(24 * 3600); // 1 day
    let now = SystemTime::now();

    // Sort by modification time (oldest first)
    files_to_check.sort_by(|a, b| a.1.cmp(&b.1));

    let mut current_total_size = initial_total_size;
    let mut deleted_count = 0;
    let mut deleted_size = 0u64;

    // Process files until we're under the size limit
    for (path, modified, size) in files_to_check {
        let age = now.duration_since(modified);
        
        let should_delete = match age {
            Ok(file_age) => {
                // Always delete files older than 1 day
                if file_age > age_limit {
                    true
                } 
                // If we're over size limit, delete oldest files regardless of age
                else if current_total_size > size_limit {
                    true
                }
                // Keep recent files if we're under size limit
                else {
                    false
                }
            }
            Err(_) => {
                // If we can't get file age, delete it to be safe
                true
            }
        };

        if should_delete {
            match fs::remove_file(&path).await {
                Ok(_) => {
                    current_total_size = current_total_size.saturating_sub(size);
                    deleted_count += 1;
                    deleted_size += size;
                    println!("Cleaned up file: {:?} (size: {} bytes, age: {:?})", 
                           path, size, age.map(|a| format!("{:.1}h", a.as_secs_f64() / 3600.0)));
                }
                Err(e) => {
                    println!("Failed to delete file {:?}: {}", path, e);
                }
            }
        }
        
        // Stop deleting if we're now under the size limit
        if current_total_size <= size_limit {
            break;
        }
    }

    if deleted_count > 0 {
        println!(
            "Proactive cleanup completed: deleted {} files ({:.2} MB), total storage: {:.2} MB", 
            deleted_count,
            deleted_size as f64 / (1024.0 * 1024.0),
            current_total_size as f64 / (1024.0 * 1024.0)
        );
    }
}

async fn cleanup_old_files() {
    loop {
        // Run cleanup every hour as a backup
        sleep(Duration::from_secs(3600)).await;
        
        println!("Running hourly cleanup...");
        cleanup_storage_if_needed().await;
    }
}
