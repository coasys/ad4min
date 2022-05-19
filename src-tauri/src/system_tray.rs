use crate::app_url;

use crate::config::log_path;
use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayMenu, SystemTrayMenuItem,
    WindowBuilder, WindowUrl, Wry,
};
use std::fs;
use directories::UserDirs;

pub fn build_system_tray() -> SystemTray {
    let show_ad4min = CustomMenuItem::new("show_ad4min".to_string(), "Show Ad4min");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let copy_logs = CustomMenuItem::new("copy_logs".to_string(), "Copy Logs");

    let sys_tray_menu = SystemTrayMenu::new()
        .add_item(show_ad4min)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(copy_logs)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(sys_tray_menu)
}

pub fn handle_system_tray_event(app: &AppHandle<Wry>, event_id: String, port: u16) {
    match event_id.as_str() {
        "show_ad4min" => {
            let ad4min_window = app.get_window("ad4min");

            if let Some(window) = ad4min_window {
                if let Ok(true) = window.is_visible() {
                    window.hide();
                } else {
                    window.show().unwrap();
                    window.set_focus().unwrap();                
                }
            }
        }
        "copy_logs" => {
            if let Some(user_dirs) = UserDirs::new() {
                let path = user_dirs.desktop_dir().unwrap().join("ad4min.log");
                fs::copy(log_path(), path);
            }
        }
        "quit" => {
            app.exit(0);
        }
        _ => log::error!("Event is not defined."),
    }
}
