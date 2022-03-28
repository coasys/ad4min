use std::thread;
use std::time::Duration;

use nix::sys::signal::{self, Signal};
use nix::unistd::Pid;
use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayMenu, SystemTrayMenuItem,
    WindowBuilder, WindowUrl, Wry,
};

pub fn build_system_tray() -> SystemTray {
    let show_ad4min = CustomMenuItem::new("show_ad4min".to_string(), "Show Ad4min");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    let sys_tray_menu = SystemTrayMenu::new()
        .add_item(show_ad4min)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(sys_tray_menu)
}

pub fn handle_system_tray_event(app: &AppHandle<Wry>, event_id: String, child_pid: i32) {
    match event_id.as_str() {
        "show_ad4min" => {
            let ad4min_window = app.get_window("ad4min");

            if let Some(window) = ad4min_window {
                window.show().unwrap();
                window.set_focus().unwrap();
            } else {
                let new_ad4min_window = app.create_window(
                    "ad4min",
                    WindowUrl::App("index.html".into()),
                    move |window_builder, webview_attrs| {
                        (
                            window_builder.title("Ad4min UI").inner_size(1000.0, 700.0),
                            webview_attrs,
                        )
                    },
                );
                log::info!("Creating ad4min UI {:?}", new_ad4min_window);
            }
        }
        "quit" => {
            let kill_result = signal::kill(Pid::from_raw(child_pid), Signal::SIGINT);
            if let Err(err) = kill_result {
                log::error!("Error killing child: {:?}", err);
            }
            thread::sleep(Duration::from_millis(1000));
            app.exit(0);
        }
        _ => log::error!("Event is not defined."),
    }
}
