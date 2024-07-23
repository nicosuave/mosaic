use anyhow::Result;
use serde_json::to_value;
use tokio::sync::Mutex;
use sha2::{Digest, Sha256};

use crate::interfaces::Command;

pub fn get_key(sql: &str, command: &Command) -> String {
    get_key_strings(sql, to_value(command).unwrap().as_str().unwrap())
}

pub fn get_key_strings(sql: &str, command: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(sql);
    format!(
        "{:x}.{}",
        hasher.finalize(),
        command
    )
}

pub async fn retrieve<F, Fut>(
    cache: &Mutex<lru::LruCache<String, Vec<u8>>>,
    sql: &str,
    command: &Command,
    persist: bool,
    f: F,
) -> Result<Vec<u8>>
where
    F: FnOnce() -> Fut,
    Fut: std::future::Future<Output = Result<Vec<u8>>>,
{
    let key = get_key(sql, command);

    if let Some(cached) = cache.lock().await.get(&key) {
        tracing::debug!("Cache hit {}!", key);
        return Ok(cached.clone());
    }

    let result = f().await?;

    if persist {
        cache.lock().await.put(key, result.clone());
    }

    Ok(result)
}
