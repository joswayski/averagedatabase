use reqwest::StatusCode;
use rusty_s3::actions::{GetObject, PutObject, S3Action};
use rusty_s3::{Bucket, Credentials, UrlStyle};
use std::{env, path::PathBuf, time::Duration};
use tokio::fs;

const SIGN_WINDOW: Duration = Duration::from_secs(60 * 10);

#[derive(Clone)]
pub enum Ass {
    Bucket {
        client: reqwest::Client,
        bucket: Bucket,
        credentials: Credentials,
    },
    Local {
        dir: PathBuf,
    },
}

#[derive(Debug, Clone)]
pub struct StoredFile {
    pub file_id: String,
    pub filename: String,
    pub bytes: Vec<u8>,
    pub content_type: String,
    pub is_public: bool,
    pub owner_key_hash: String,
}

impl Ass {
    pub fn from_env() -> Self {
        let bucket_name = env::var("AWS_S3_BUCKET_NAME").ok().filter(|v| !v.is_empty());
        let endpoint = env::var("AWS_ENDPOINT_URL").ok().filter(|v| !v.is_empty());
        let access_key = env::var("AWS_ACCESS_KEY_ID").ok().filter(|v| !v.is_empty());
        let secret_key = env::var("AWS_SECRET_ACCESS_KEY")
            .ok()
            .filter(|v| !v.is_empty());

        match (bucket_name, endpoint, access_key, secret_key) {
            (Some(bucket_name), Some(endpoint), Some(access_key), Some(secret_key)) => {
                let region = env::var("AWS_DEFAULT_REGION").unwrap_or_else(|_| "auto".to_string());
                let endpoint = endpoint
                    .parse()
                    .expect("AWS_ENDPOINT_URL must be a valid URL");
                let bucket = Bucket::new(endpoint, UrlStyle::VirtualHost, bucket_name, region)
                    .expect("create S3 bucket client");
                Self::Bucket {
                    client: reqwest::Client::new(),
                    bucket,
                    credentials: Credentials::new(access_key, secret_key),
                }
            }
            _ => {
                let dir = PathBuf::from("./data");
                let _ = std::fs::create_dir_all(&dir);
                Self::Local { dir }
            }
        }
    }

    pub async fn put(
        &self,
        file_id: &str,
        filename: &str,
        bytes: Vec<u8>,
        is_public: bool,
        owner_key_hash: &str,
    ) -> Result<u64, String> {
        let content_type = content_type_for(filename);
        let size = bytes.len() as u64;

        match self {
            Self::Bucket {
                client,
                bucket,
                credentials,
            } => {
                let key = object_key(file_id);
                let content_disposition = format!("inline; filename=\"{filename}\"");
                let public_value = is_public.to_string();
                let extra_headers = [
                    ("content-type", content_type),
                    ("content-disposition", content_disposition.as_str()),
                    ("x-amz-meta-filename", filename),
                    ("x-amz-meta-public", public_value.as_str()),
                    ("x-amz-meta-owner", owner_key_hash),
                ];
                let mut action = PutObject::new(bucket, Some(credentials), &key);
                for (name, value) in extra_headers {
                    action.headers_mut().insert(name, value);
                }

                let url = action.sign(SIGN_WINDOW);
                let mut request = client.put(url).body(bytes);
                for (name, value) in extra_headers {
                    request = request.header(name, value);
                }

                let response = request.send().await.map_err(|error| error.to_string())?;
                if !response.status().is_success() {
                    let status = response.status();
                    let body = response.text().await.unwrap_or_default();
                    return Err(format!("S3 put failed ({status}): {body}"));
                }
            }
            Self::Local { dir } => {
                let public_marker = if is_public { "pub" } else { "prv" };
                let ext = extension_of(filename);
                let stored = format!(
                    "{}_{}_{}.{}",
                    &owner_key_hash[..owner_key_hash.len().min(8)],
                    public_marker,
                    file_id,
                    ext
                );
                fs::write(dir.join(stored), bytes)
                    .await
                    .map_err(|error| error.to_string())?;
            }
        }

        Ok(size)
    }

    pub async fn get(&self, file_id: &str) -> Result<Option<StoredFile>, String> {
        match self {
            Self::Bucket {
                client,
                bucket,
                credentials,
            } => {
                let key = object_key(file_id);
                let action = GetObject::new(bucket, Some(credentials), &key);
                let url = action.sign(SIGN_WINDOW);
                let response = client.get(url).send().await.map_err(|error| error.to_string())?;

                if response.status() == StatusCode::NOT_FOUND {
                    return Ok(None);
                }
                if !response.status().is_success() {
                    let status = response.status();
                    let body = response.text().await.unwrap_or_default();
                    return Err(format!("S3 get failed ({status}): {body}"));
                }

                let filename = header_string(&response, "x-amz-meta-filename")
                    .unwrap_or_else(|| file_id.to_string());
                let is_public = header_string(&response, "x-amz-meta-public")
                    .is_some_and(|value| value == "true");
                let owner_key_hash =
                    header_string(&response, "x-amz-meta-owner").unwrap_or_default();
                let content_type = response
                    .headers()
                    .get(reqwest::header::CONTENT_TYPE)
                    .and_then(|value| value.to_str().ok())
                    .unwrap_or("application/octet-stream")
                    .to_string();
                let bytes = response
                    .bytes()
                    .await
                    .map_err(|error| error.to_string())?
                    .to_vec();

                Ok(Some(StoredFile {
                    file_id: file_id.to_string(),
                    filename,
                    bytes,
                    content_type,
                    is_public,
                    owner_key_hash,
                }))
            }
            Self::Local { dir } => {
                let mut entries = fs::read_dir(dir).await.map_err(|error| error.to_string())?;
                while let Ok(Some(entry)) = entries.next_entry().await {
                    let name = entry.file_name();
                    let Some(name) = name.to_str() else {
                        continue;
                    };
                    if let Some(stored) = parse_local_name(name) {
                        if stored.2 == file_id {
                            let bytes = fs::read(entry.path())
                                .await
                                .map_err(|error| error.to_string())?;
                            return Ok(Some(StoredFile {
                                file_id: file_id.to_string(),
                                filename: name.to_string(),
                                content_type: content_type_for(name).to_string(),
                                is_public: stored.1,
                                owner_key_hash: stored.0,
                                bytes,
                            }));
                        }
                    }
                }
                Ok(None)
            }
        }
    }
}

pub fn public_file_url(file_id: &str) -> String {
    format!("https://averagedatabase.com/api/ass/{file_id}")
}

fn object_key(file_id: &str) -> String {
    format!("ass/{file_id}")
}

fn header_string(response: &reqwest::Response, name: &str) -> Option<String> {
    response
        .headers()
        .get(name)
        .and_then(|value| value.to_str().ok())
        .map(ToOwned::to_owned)
}

fn extension_of(filename: &str) -> &str {
    std::path::Path::new(filename)
        .extension()
        .and_then(|ext| ext.to_str())
        .unwrap_or("bin")
}

fn content_type_for(filename: &str) -> &'static str {
    match extension_of(filename).to_ascii_lowercase().as_str() {
        "txt" | "md" | "log" | "csv" => "text/plain",
        "json" => "application/json",
        "xml" => "application/xml",
        "jpg" | "jpeg" => "image/jpeg",
        "png" => "image/png",
        "gif" => "image/gif",
        "webp" => "image/webp",
        "pdf" => "application/pdf",
        "mp3" => "audio/mpeg",
        "wav" => "audio/wav",
        "m4a" => "audio/mp4",
        "mp4" => "video/mp4",
        "webm" => "video/webm",
        "mov" => "video/quicktime",
        "zip" => "application/zip",
        "gz" => "application/gzip",
        "tar" => "application/x-tar",
        _ => "application/octet-stream",
    }
}

fn parse_local_name(name: &str) -> Option<(String, bool, String)> {
    let (stem, _) = name.rsplit_once('.')?;
    let mut parts = stem.splitn(3, '_');
    let owner = parts.next()?.to_string();
    let marker = parts.next()?;
    let file_id = parts.next()?.to_string();
    if marker != "pub" && marker != "prv" {
        return None;
    }
    Some((owner, marker == "pub", file_id))
}
