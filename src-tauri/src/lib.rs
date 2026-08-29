mod database;
mod security;
mod commands;

use std::sync::Mutex;
use tauri::Manager;
use commands::AppState;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("could not resolve app data directory");

            let conn = database::open(&app_data_dir).expect("failed to open database");

            app.manage(AppState {
                db: Mutex::new(conn),
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            commands::profile_exists,
            commands::create_profile,
            commands::login,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}