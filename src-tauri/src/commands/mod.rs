use std::sync::Mutex;
use rusqlite::Connection;
use serde::{Deserialize, Serialize};
use tauri::State;

use crate::database;
use crate::security;

pub struct AppState {
    pub db: Mutex<Connection>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct NewProfile {
    pub username: String,
    pub password: String,
    pub base_currency: String,
    pub locale: String,
    pub auto_lock_minutes: Option<i64>,
}

#[tauri::command]
pub fn profile_exists(state: State<AppState>) -> Result<bool, String> {
    let conn = state.db.lock().map_err(|_| "database lock poisoned")?;
    database::has_profile(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn create_profile(state: State<AppState>, profile: NewProfile) -> Result<(), String> {
    let conn = state.db.lock().map_err(|_| "database lock poisoned")?;

    if database::has_profile(&conn).map_err(|e| e.to_string())? {
        return Err("a profile already exists".into());
    }

    let password_hash = security::hash_password(&profile.password).map_err(|e| e.to_string())?;

    conn.execute(
        "INSERT INTO profile (id, username, password_hash, base_currency, locale, auto_lock_minutes)
         VALUES (1, ?1, ?2, ?3, ?4, ?5)",
        rusqlite::params![
            profile.username,
            password_hash,
            profile.base_currency,
            profile.locale,
            profile.auto_lock_minutes,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn login(state: State<AppState>, password: String) -> Result<bool, String> {
    let conn = state.db.lock().map_err(|_| "database lock poisoned")?;

    let stored_hash: String = conn
        .query_row("SELECT password_hash FROM profile WHERE id = 1", [], |row| {
            row.get(0)
        })
        .map_err(|e| e.to_string())?;

    security::verify_password(&password, &stored_hash).map_err(|e| e.to_string())
}