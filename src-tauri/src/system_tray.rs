use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayMenu, SystemTrayMenuItem, Wry,
};
use crate::util::find_and_kill_processes;
use crate::create_main_window;
use crate::Payload;

pub fn build_system_tray() -> SystemTray {
    let toggle_window = CustomMenuItem::new("toggle_window".to_string(), "Show/Hide Window");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    let sys_tray_menu = SystemTrayMenu::new()
        .add_item(toggle_window)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(sys_tray_menu)
}

pub fn handle_system_tray_event(app: &AppHandle<Wry>, event_id: String) {
    match event_id.as_str() {
        "toggle_window" => {
            let ad4min_window = app.get_window("ad4min");

            if let Some(window) = ad4min_window {
                if let Ok(true) = window.is_visible() {
                    window.hide();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();                
                }
            } else {                
                create_main_window(app);
                let main = app.get_window("ad4min").unwrap();
                main.emit("ready", Payload { message: "ad4m-executor is ready".into() }).unwrap();
            }
        }
        "quit" => {
            find_and_kill_processes("ad4m");

            find_and_kill_processes("holochain");

            find_and_kill_processes("lair-keystore");

            app.exit(0);
        }
        _ => log::error!("Event is not defined."),
    }
}