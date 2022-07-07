use tauri::{State, async_runtime::spawn};
use localtunnel::open_tunnel;

use crate::AppState;

#[tauri::command]
pub fn setup_proxy(subdomain: String, state: State<'_, AppState>) {
    let local_port = state.graphql_port;

    spawn(async move {
        let _ = open_tunnel("http://proxy.ad4m.dev", Some(&subdomain), local_port).await;
    });
}
