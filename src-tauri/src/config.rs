use std::path::PathBuf;

use tauri::api::path::data_dir;

pub fn data_path() -> PathBuf {
    data_dir().expect("Could not get config dir").join("ad4m")
}

pub fn log_path() -> PathBuf {
    data_path().join("ad4min.log")
}

pub fn binary_path() -> PathBuf {
    data_path().join("binary")
}

pub fn holochain_binary_path() -> PathBuf {
    binary_path().join("holochain")
}

#[cfg(feature = "custom-protocol")]
pub fn app_url(port: u16) -> String {
    format!("index.html?ad4m=ws://localhost:{}/graphql", port)
}

#[cfg(not(feature = "custom-protocol"))]
pub fn app_url(port: u16) -> String {
    format!("http://localhost:3000?ad4m=ws://localhost:{}/graphql", port)
}