use localtunnel::open_tunnel;
use tauri::{async_runtime::spawn, State};

use crate::AppState;

#[tauri::command]
pub async fn setup_proxy(subdomain: String, state: State<'_, AppState>) -> Result<String, String> {
    let local_port = state.graphql_port;

    let (endpoint, handle) = open_tunnel(
        Some("http://proxy.ad4m.dev"),
        Some(&subdomain.replace(":", "-").to_lowercase()),
        None,
        local_port,
    )
    .await
    .map_err(|err| format!("Error happend when setup proxy: {:?}", err))?;

    spawn(async {
        let _ = handle.await;
    });

    Ok(endpoint)
}
