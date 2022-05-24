use crate::config::data_path;

pub fn report_issue() {
  tauri::async_runtime::spawn(async move {
    open::that("https://github.com/perspect3vism/ad4min/issues/new")
      .map_err(|err| format!("Could not open url: {}", err))
  });
}

pub fn open_logs_folder() {
  if let Err(err) = opener::open(data_path()) {
    log::error!("Error opening logs folder: {}", err);
  }
}
