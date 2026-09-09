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

#[derive(Debug, Serialize)]
pub struct ProfileSettings {
    pub base_currency: String,
    pub locale: String,
}

#[tauri::command]
pub fn get_profile_settings(state: State<AppState>) -> Result<ProfileSettings, String> {
    let conn = state.db.lock().map_err(|_| "database lock poisoned")?;
    conn.query_row(
        "SELECT base_currency, locale FROM profile WHERE id = 1",
        [],
        |row| {
            Ok(ProfileSettings {
                base_currency: row.get(0)?,
                locale: row.get(1)?,
            })
        },
    )
    .map_err(|e| e.to_string())
}

#[derive(Debug, Serialize)]
pub struct Category {
    pub id: i64,
    pub name: String,
    pub kind: String,
}

#[tauri::command]
pub fn list_categories(state: State<AppState>) -> Result<Vec<Category>, String> {
    let conn = state.db.lock().map_err(|_| "database lock poisoned")?;
    let mut stmt = conn
        .prepare("SELECT id, name, kind FROM categories ORDER BY kind, name")
        .map_err(|e| e.to_string())?;
    let rows = stmt
        .query_map([], |row| {
            Ok(Category {
                id: row.get(0)?,
                name: row.get(1)?,
                kind: row.get(2)?,
            })
        })
        .map_err(|e| e.to_string())?;
    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[derive(Debug, Deserialize)]
pub struct NewTransaction {
    pub kind: String, // "income" | "expense"
    pub amount: f64,
    pub currency_code: String,
    pub occurred_on: String, // YYYY-MM-DD
    pub category_id: Option<i64>,
    pub description: Option<String>,
}

#[tauri::command]
pub fn create_transaction(
    state: State<AppState>,
    transaction: NewTransaction,
) -> Result<i64, String> {
    let conn = state.db.lock().map_err(|_| "database lock poisoned")?;
    let amount_minor = database::to_minor_units(transaction.amount);

    conn.execute(
        "INSERT INTO finance_transactions (kind, amount_minor, currency_code, occurred_on, category_id, description)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        rusqlite::params![
            transaction.kind,
            amount_minor,
            transaction.currency_code,
            transaction.occurred_on,
            transaction.category_id,
            transaction.description,
        ],
    )
    .map_err(|e| e.to_string())?;

    Ok(conn.last_insert_rowid())
}

#[derive(Debug, Serialize)]
pub struct TransactionRow {
    pub id: i64,
    pub kind: String,
    pub amount: f64,
    pub currency_code: String,
    pub occurred_on: String,
    pub category_name: Option<String>,
    pub description: Option<String>,
}

#[tauri::command]
pub fn list_transactions_for_month(
    state: State<AppState>,
    year: i32,
    month: u32,
) -> Result<Vec<TransactionRow>, String> {
    let conn = state.db.lock().map_err(|_| "database lock poisoned")?;
    let month_prefix = format!("{:04}-{:02}%", year, month);

    let mut stmt = conn
        .prepare(
            "SELECT ft.id, ft.kind, ft.amount_minor, ft.currency_code, ft.occurred_on,
                    c.name, ft.description
             FROM finance_transactions ft
             LEFT JOIN categories c ON c.id = ft.category_id
             WHERE ft.occurred_on LIKE ?1
             ORDER BY ft.occurred_on DESC, ft.id DESC",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map(rusqlite::params![month_prefix], |row| {
            let amount_minor: i64 = row.get(2)?;
            Ok(TransactionRow {
                id: row.get(0)?,
                kind: row.get(1)?,
                amount: database::from_minor_units(amount_minor),
                currency_code: row.get(3)?,
                occurred_on: row.get(4)?,
                category_name: row.get(5)?,
                description: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    rows.collect::<Result<Vec<_>, _>>().map_err(|e| e.to_string())
}

#[derive(Debug, Serialize)]
pub struct MonthlySummary {
    pub income: f64,
    pub expenses: f64,
    pub available: f64,
}

#[tauri::command]
pub fn monthly_summary(
    state: State<AppState>,
    year: i32,
    month: u32,
) -> Result<MonthlySummary, String> {
    let conn = state.db.lock().map_err(|_| "database lock poisoned")?;
    let month_prefix = format!("{:04}-{:02}%", year, month);

    let income_minor: i64 = conn
        .query_row(
            "SELECT COALESCE(SUM(amount_minor), 0) FROM finance_transactions WHERE kind = 'income' AND occurred_on LIKE ?1",
            rusqlite::params![month_prefix],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    let expenses_minor: i64 = conn
        .query_row(
            "SELECT COALESCE(SUM(amount_minor), 0) FROM finance_transactions WHERE kind = 'expense' AND occurred_on LIKE ?1",
            rusqlite::params![month_prefix],
            |row| row.get(0),
        )
        .map_err(|e| e.to_string())?;

    Ok(MonthlySummary {
        income: database::from_minor_units(income_minor),
        expenses: database::from_minor_units(expenses_minor),
        available: database::from_minor_units(income_minor - expenses_minor),
    })
}