#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use config::holochain_binary_path;
use config::app_url;
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
use core::time::Duration;
use std::thread;
use tauri::WindowUrl;
use tauri::WindowBuilder;
use tauri::Manager;

// the payload type must implement `Serialize` and `Clone`.
#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

fn main() {
    let free_port = portpicker::pick_unused_port().expect("No ports free");

    println!("Free port: {:?}", free_port);

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
        .args(["serve", "--port", &free_port.to_string()])
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
    let free_port_clone = free_port.clone();

    let url = app_url(free_port);

    println!("URL {}", url);

    let builder_result = tauri::Builder::default()
        .menu(build_menu())
        .system_tray(build_system_tray())
        .setup(move |app| {
            let splashscreen_window = app.get_window("splashscreen").unwrap();

            let new_ad4min_window = WindowBuilder::new(
                app,
                "ad4min",
                WindowUrl::App(url.into()),
            );
            
            log::info!("Creating ad4min UI {:?}", new_ad4min_window); 
            
            new_ad4min_window.build();

            Ok(())
        })
        .on_system_tray_event(move |app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => {
                handle_system_tray_event(app, id, free_port_clone)
            }
            _ => {}
        })
        .build(tauri::generate_context!());

    match builder_result {
        Ok(builder) => {
            builder.run(|_app_handle, event| match event {
                RunEvent::ExitRequested { api, .. } => {
                    api.prevent_exit();
                },
                _ => {}
            });
        }
        Err(err) => log::error!("Error building the app: {:?}", err),
    }
}
