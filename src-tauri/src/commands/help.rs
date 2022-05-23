use crate::open_url;
use crate::config::data_path;

#[tauri::command]
pub fn report_issue() {
  open_url("https://github.com/perspect3vism/ad4min/issues/new".into()).unwrap();
}

#[tauri::command]
pub fn open_logs_folder() {
  if let Err(err) = opener::open(data_path()) {
    log::error!("Error opening logs folder: {}", err);
  }
}
