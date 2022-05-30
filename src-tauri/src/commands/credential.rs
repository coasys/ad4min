use tauri::State;

use crate::AppState;

#[tauri::command]
pub fn request_credential(state: State<'_, AppState>) -> String {
    state.req_credential.clone()
}
