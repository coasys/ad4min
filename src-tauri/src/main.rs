#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use commands::state::{request_credential, get_port};
use config::holochain_binary_path;
use config::app_url;
use logs::setup_logs;
use menu::build_menu;
use system_tray::{ build_system_tray, handle_system_tray_event };
use tauri::{
    api::process::{Command, CommandEvent},
    RunEvent, SystemTrayEvent
};
use uuid::Uuid;

mod config;
mod util;
mod logs;
mod system_tray;
mod menu;
mod commands;

use tauri::api::dialog;
use tauri::Manager;
use crate::util::find_port;
use crate::menu::{handle_menu_event, open_logs_folder};
use crate::util::{find_and_kill_processes, create_main_window, save_executor_port};

// the payload type must implement `Serialize` and `Clone`.
#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

pub struct AppState {
    graphql_port: u16,
    req_credential: String,
}

fn main() {
    if let Err(err) = setup_logs() {
        println!("Error setting up the logs: {:?}", err);
    }

    let free_port = find_port(12000, 13000);

    log::info!("Free port: {:?}", free_port);
    
    save_executor_port(free_port);

    find_and_kill_processes("ad4m");

    find_and_kill_processes("holochain");

    find_and_kill_processes("lair-keystore");

    if !holochain_binary_path().exists() {
        log::info!("init command by copy holochain binary");
        let status = Command::new_sidecar("ad4m")
            .expect("Failed to create ad4m command")
            .args(["init"])
            .status()
            .expect("Failed to run ad4m init");
        assert!(status.success());
    }

    let req_credential = Uuid::new_v4().to_string();

    let state = AppState {
        graphql_port: free_port,
        req_credential: req_credential.clone(),
    };

    let builder_result = tauri::Builder::default()
        .manage(state)
        .menu(build_menu())
        .on_menu_event(|event| handle_menu_event(event.menu_item_id(), event.window()))
        .system_tray(build_system_tray())
        .invoke_handler(tauri::generate_handler![
            get_port,
            request_credential,
        ])
        .setup(move |app| {
            let splashscreen = app.get_window("splashscreen").unwrap();

            let splashscreen_clone = splashscreen.clone();

            let _id = splashscreen.listen("copyLogs", |event| {
                log::info!("got window event-name with payload {:?} {:?}", event, event.payload());

                open_logs_folder();
            });

            let handle = app.handle().clone();

            let (mut rx, _child) = Command::new_sidecar("ad4m")
            .expect("Failed to create ad4m command")
            .args([
                "serve",
                "--port", &free_port.to_string(),
                "--reqCredential", &req_credential,
            ])
            .spawn()
            .expect("Failed to spawn ad4m serve");
    
            tauri::async_runtime::spawn(async move {
                while let Some(event) = rx.recv().await {
                    match event.clone() {
                        CommandEvent::Stdout(line) => {
                            log::info!("{}", line);

                            if line.contains("GraphQL server started, Unlock the agent to start holohchain") {
                                let url = app_url();
                                log::info!("Executor started on: {:?}", url);
                                let _ = splashscreen_clone.hide();
                                create_main_window(&handle);
                                let main = handle.get_window("AD4MIN").unwrap();
                                main.emit("ready", Payload { message: "ad4m-executor is ready".into() }).unwrap();
                            }
                        },
                        CommandEvent::Stderr(line) => log::error!("{}", line),
                        CommandEvent::Terminated(line) => {
                            log::info!("Terminated {:?}", line);

                            dialog::message(
                                Some(&splashscreen_clone), 
                                "Error", 
                                "Something went wrong while starting ad4m-executor please check the logs"
                            );
                            log::info!("Terminated {:?}", line);
                        },
                        CommandEvent::Error(line) => log::info!("Error {:?}", line),
                        _ => log::error!("{:?}", event),
                    }
                }
            });

            Ok(())
        })
        .on_system_tray_event(move |app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => {
                handle_system_tray_event(app, id)
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
