use crate::get_main_window;

#[tauri::command]
pub fn close_application(app_handle: tauri::AppHandle) {
  app_handle.exit(0)
}

#[tauri::command]
pub fn close_main_window(app_handle: tauri::AppHandle) {
  let window = get_main_window(&app_handle);
  if let Ok(true) = window.is_visible() {
    let _ = window.hide();
}
}