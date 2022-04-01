#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use config::holochain_binary_path;
use logs::setup_logs;
use menu::build_menu;
use system_tray::{build_system_tray, handle_system_tray_event};
use tauri::{
    api::process::{Command, CommandEvent},
    RunEvent, SystemTrayEvent,
};

mod config;
mod logs;
mod system_tray;
mod menu;

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

    let (mut rx, child) = Command::new_sidecar("ad4m")
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

    let builder_result = tauri::Builder::default()
        .menu(build_menu())
        .system_tray(build_system_tray())
        .on_system_tray_event(move |app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => {
                handle_system_tray_event(app, id, child.pid() as i32)
            }
            _ => {}
        })
        .build(tauri::generate_context!());

    match builder_result {
        Ok(builder) => {
            builder.run(|_app_handle, event| match event {
                RunEvent::ExitRequested { api, .. } => api.prevent_exit(),
                _ => {}
            });
        }
        Err(err) => log::error!("Error building the app: {:?}", err),
    }
}
