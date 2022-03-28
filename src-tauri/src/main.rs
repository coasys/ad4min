#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use config::holochain_binary_path;
use logs::setup_logs;
use system_tray::{build_system_tray, handle_system_tray_event};
use tauri::{
    api::process::{Command, CommandEvent},
    SystemTrayEvent,
};

mod config;
mod logs;
mod system_tray;

fn main() {
    if let Err(err) = setup_logs() {
        println!("Error setting up the logs: {:?}", err);
    }

    if !holochain_binary_path().exists() {
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
        .system_tray(build_system_tray())
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => handle_system_tray_event(app, id),
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
