pub fn find_port(start_port: u16, end_port: u16) -> u16 {
  for x in start_port..end_port {
    if portpicker::is_free(x) {
      return x;
    }
  }

  panic!("No open port found between: [{:?}, {:?}]", start_port, end_port);
}

#[tauri::command]
pub fn open_url(url: String) -> Result<(), String> {
  tauri::async_runtime::spawn(async move {
    open::that(url.clone().as_str()).map_err(|err| format!("Could not open url: {}", err))
  });

  Ok(())
}
