use std::path::{Path, PathBuf};
use rusqlite::Connection;

const DB_FILE_NAME: &str = "simplefin.db";
const SCHEMA: &str = include_str!("schema.sql");

#[derive(Debug, thiserror::Error)]
pub enum DbError {
    #[error("database error: {0}")]
    Sqlite(#[from] rusqlite::Error),
    #[error("io error: {0}")]
    Io(#[from] std::io::Error),
}

pub fn db_path(app_data_dir: &Path) -> PathBuf {
    app_data_dir.join(DB_FILE_NAME)
}

pub fn open(app_data_dir: &Path) -> Result<Connection, DbError> {
    std::fs::create_dir_all(app_data_dir)?;
    let conn = Connection::open(db_path(app_data_dir))?;
    conn.pragma_update(None, "foreign_keys", "ON")?;
    conn.execute_batch(SCHEMA)?;
    Ok(conn)
}

pub fn has_profile(conn: &Connection) -> Result<bool, DbError> {
    let count: i64 =
        conn.query_row("SELECT COUNT(*) FROM profile", [], |row| row.get(0))?;
    Ok(count > 0)
}

pub fn to_minor_units(amount: f64) -> i64 {
    (amount * 100.0).round() as i64
}

pub fn from_minor_units(amount_minor: i64) -> f64 {
    amount_minor as f64 / 100.0
}