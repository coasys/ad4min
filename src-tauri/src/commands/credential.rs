use tauri::State;

pub struct ReqCredential(pub String);

#[tauri::command]
pub fn request_credential(state: State<'_, ReqCredential>) -> String {
    state.0.clone()
}
