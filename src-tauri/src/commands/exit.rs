#[tauri::command]
pub fn close_application(app_handle: tauri::AppHandle) {
  app_handle.exit(0)
}