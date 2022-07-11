use localtunnel::open_tunnel;
use tauri::{async_runtime::spawn, State};

use crate::{AppState, ProxyEndpoint};

#[tauri::command]
pub async fn setup_proxy(subdomain: String, app_state: State<'_, AppState>, proxy: State<'_, ProxyEndpoint>) -> Result<String, String> {
    let local_port = app_state.graphql_port;

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

    *proxy.0.lock().unwrap() = Some(endpoint.clone());

    Ok(endpoint)
}

#[tauri::command]
pub fn get_proxy(proxy: State<'_, ProxyEndpoint>) -> Option<String> {
    (*proxy.0.lock().unwrap()).clone()
}
