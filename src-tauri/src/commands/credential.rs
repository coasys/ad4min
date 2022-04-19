use tauri::State;

use crate::ReqCredential;


#[tauri::command]
pub fn request_credential(state: State<'_, ReqCredential>) -> String {
    state.0.clone()
}