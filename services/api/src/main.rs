extern crate serde_derive;

use rand::{distributions::Alphanumeric, Rng};
use serde_derive::{Deserialize, Serialize};
use tokio::{sync::Mutex, time::sleep};
use tracing_subscriber;
extern crate lru;
use serde_json::json;

use axum::{
    extract::{DefaultBodyLimit, Extension, Query, Request},
    http::StatusCode,
    middleware::{self, Next},
    response::{IntoResponse, Json, Response},
    routing::{get, post},
    Router,
};
use lru::LruCache;
use std::{num::NonZeroUsize, sync::Arc, time::Duration};
use tower::ServiceBuilder;

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

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    tracing_subscriber::fmt::init();

    // Original cache for key-value pairs
    let kv_cache: Arc<Mutex<LruCache<String, String>>> =
        Arc::new(Mutex::new(LruCache::new(NonZeroUsize::new(10000).unwrap())));

    // Auth cache for users
    let auth_cache: Arc<Mutex<LruCache<String, CacheEntry>>> =
        Arc::new(Mutex::new(LruCache::new(NonZeroUsize::new(10000).unwrap())));

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
        .layer(
            ServiceBuilder::new()
                .layer(Extension(kv_cache.clone())) // For original key-value operations
                .layer(Extension(auth_cache.clone())) // For auth operations
                .layer(DefaultBodyLimit::max(1024))
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
    if api_key.starts_with("enterprise-") {
        return String::new();
    }

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
