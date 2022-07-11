use localtunnel::open_tunnel;
use tauri::State;

use crate::{AppState, ProxyState, ProxyService};

#[tauri::command]
pub async fn setup_proxy(subdomain: String, app_state: State<'_, AppState>, proxy: State<'_, ProxyState>) -> Result<String, String> {
    let local_port = app_state.graphql_port;

    let (endpoint, handle) = open_tunnel(
        Some("http://proxy.ad4m.dev"),
        Some(&subdomain.replace(":", "-").to_lowercase()),
        None,
        local_port,
    )
    .await
    .map_err(|err| format!("Error happend when setup proxy: {:?}", err))?;

    *proxy.0.lock().unwrap() = Some(ProxyService{
        endpoint: endpoint.clone(),
        handle,
    });

    Ok(endpoint)
}

#[tauri::command]
pub fn get_proxy(proxy: State<'_, ProxyState>) -> Option<String> {
    (*proxy.0.lock().unwrap()).as_ref().map(|s| s.endpoint.clone())
}

#[tauri::command]
pub fn stop_proxy(proxy: State<'_, ProxyState>) {
    match &(*proxy.0.lock().unwrap()) {
        Some(s) => s.handle.abort(),
        None => log::info!("Proxy is not set up."),
    };
    *proxy.0.lock().unwrap() = None;
}
