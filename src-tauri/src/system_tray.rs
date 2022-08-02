use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayMenu, SystemTrayMenuItem, Wry,
};
use crate::util::find_and_kill_processes;
use crate::create_main_window;
use crate::Payload;
use crate::config::executor_port_path;
use std::fs::remove_file;

pub fn build_system_tray() -> SystemTray {
    SystemTray::new()
}