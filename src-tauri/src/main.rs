#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use config::binary_path;
use logs::setup_logs;
use tauri::{
    api::process::{Command, CommandEvent},
    CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem,
};

mod config;
mod logs;

fn main() {
    if let Err(err) = setup_logs() {
        println!("Error setting up the logs: {:?}", err);
    }

    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let tray_menu = SystemTrayMenu::new()
        .add_item(quit)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(hide);
    let system_tray = SystemTray::new().with_menu(tray_menu);

    let exist_holochain_binary = binary_path().join("holochain").exists();

    if !exist_holochain_binary {
        log::info!("init command by copy holochain binary");
        let status = Command::new_sidecar("ad4m")
            .expect("Failed to create ad4m command")
            .args(["init"])
            .status()
            .expect("Failed to run ad4m init");
        assert!(status.success());
    }

    let (mut rx, mut _child) = Command::new_sidecar("ad4m")
        .expect("Failed to create ad4m command")
        .args(["serve"])
        .spawn()
        .expect("Failed to spawn ad4m serve");

    tauri::async_runtime::spawn(async move {
        while let Some(event) = rx.recv().await {
            match event.clone() {
                CommandEvent::Stdout(line) => log::info!("{}", line),
                CommandEvent::Stderr(line) => log::info!("{}", line),
                _ => log::info!("{:?}", event),
            }
        }
    });

    tauri::Builder::default()
        .system_tray(system_tray)
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
