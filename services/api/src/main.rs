extern crate serde_derive;

use rand::Rng;

use serde_derive::Serialize;
use tokio::sync::Mutex;
use tracing_subscriber;
extern crate lru;

use lru::LruCache;
use std::{num::NonZeroUsize, sync::Arc};
use tower::ServiceBuilder;

use axum::{
    http::StatusCode,
    routing::{get, post},
    Extension, Json, Router,
};
use serde_json::Value;

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

#[tokio::main(flavor = "multi_thread")]
async fn main() {
    tracing_subscriber::fmt::init();

    let cache: Arc<Mutex<LruCache<isize, String>>> =
        Arc::new(Mutex::new(LruCache::new(NonZeroUsize::new(10000).unwrap())));

    let app = Router::new()
        .route("/", get(root))
        .route("/gibs-key", post(gibs_key))
        .route(
            "/SECRET_INTERNAL_ENDPOINT_DO_NOT_USE_OR_YOU_WILL_BE_FIRED_add_item",
            post(add_item),
        )
        .layer(ServiceBuilder::new().layer(Extension(cache)));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:80").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn root() -> &'static str {
    "Are you an idiot? Did you forget to look at the docs?"
}

async fn add_item(
    Extension(cache): Extension<Arc<Mutex<LruCache<isize, String>>>>,

    Json(payload): Json<Value>,
) -> (StatusCode, Json<Value>) {
    let mut cash = cache.lock().await;

    cash.push(1, "example_value".to_string());

    let v = cash.get(&1).unwrap();

    (StatusCode::CREATED, Json(Value::String(v.to_string())))
}

#[derive(Serialize)]
struct CreateApiKeyResponse {
    api_key: String,
    brought_to_you_by: String,
}

async fn gibs_key() -> (StatusCode, Json<CreateApiKeyResponse>) {
    let mut rng = rand::thread_rng();

    let key: i64 = rng.gen_range(1..=1000000);

    let index = rng.gen_range(0..ADS.len());

    let res = CreateApiKeyResponse {
        api_key: key.to_string(),
        brought_to_you_by: ADS[index].to_string(),
    };

    (StatusCode::CREATED, Json(res))
}
