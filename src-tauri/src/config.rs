use std::path::PathBuf;

use tauri::api::path::data_dir;

pub fn data_path() -> PathBuf {
    data_dir().expect("Could not get config dir").join("ad4m")
}

pub fn binary_path() -> PathBuf {
    data_path().join("binary")
}
pub fn log_path() -> PathBuf {
    data_path().join("ad4min.log")
}