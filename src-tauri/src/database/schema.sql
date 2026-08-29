-- Simple Fin — core schema (MVP)
--
-- Notes:
--   * Single-profile per database file (§5).
--   * Money stored as INTEGER minor units (cents) to avoid float drift.
--   * currency_code follows ISO 4217 (§7.1); no conversion in MVP (§7.3).
--   * At-rest encryption (§6.2) not implemented yet.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS schema_version (
    version     INTEGER NOT NULL
);

-- Profile & settings (§5, §7)
CREATE TABLE IF NOT EXISTS profile (
    id                  INTEGER PRIMARY KEY CHECK (id = 1),
    username            TEXT NOT NULL,
    password_hash       TEXT NOT NULL,       -- Argon2id PHC string (§6.1)
    base_currency       TEXT NOT NULL,       -- ISO 4217, e.g. 'COP' (§7.1)
    locale              TEXT NOT NULL,       -- e.g. 'es-CO' (§7.2)
    auto_lock_minutes   INTEGER,             -- NULL = "Never" (§6.3)
    created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Personal finance (§9)
CREATE TABLE IF NOT EXISTS categories (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    kind        TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
    is_default  INTEGER NOT NULL DEFAULT 0,
    UNIQUE (name, kind)
);

CREATE TABLE IF NOT EXISTS finance_transactions (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    kind            TEXT NOT NULL CHECK (kind IN ('income', 'expense')),
    amount_minor    INTEGER NOT NULL CHECK (amount_minor >= 0),
    currency_code   TEXT NOT NULL,
    occurred_on     TEXT NOT NULL,
    category_id     INTEGER REFERENCES categories(id),
    description     TEXT,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_finance_transactions_date
    ON finance_transactions(occurred_on);

CREATE TABLE IF NOT EXISTS debts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    principal_minor INTEGER NOT NULL,
    currency_code   TEXT NOT NULL,
    due_date        TEXT,
    is_settled      INTEGER NOT NULL DEFAULT 0,
    created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Investment plan — the target/intent (§10, §11)
CREATE TABLE IF NOT EXISTS investment_plan (
    id                              INTEGER PRIMARY KEY CHECK (id = 1),
    initial_investment_minor        INTEGER NOT NULL DEFAULT 0,
    monthly_contribution_minor      INTEGER NOT NULL DEFAULT 0,
    expected_monthly_growth_percent REAL NOT NULL,
    currency_code                   TEXT NOT NULL,
    created_at                      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at                      TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS goals (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    name                 TEXT NOT NULL,
    target_amount_minor  INTEGER NOT NULL,
    currency_code        TEXT NOT NULL,
    is_primary           INTEGER NOT NULL DEFAULT 0,
    created_at           TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Actual investment activity — what really happened (§13–§18)
CREATE TABLE IF NOT EXISTS assets (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    symbol          TEXT,
    asset_type      TEXT NOT NULL CHECK (
                        asset_type IN ('stock', 'etf', 'fund', 'bond', 'crypto', 'other')
                    ),
    currency_code   TEXT NOT NULL,
    UNIQUE (symbol, asset_type)
);

CREATE TABLE IF NOT EXISTS investment_transactions (
    id                    INTEGER PRIMARY KEY AUTOINCREMENT,
    type                  TEXT NOT NULL CHECK (
                              type IN ('DEPOSIT', 'BUY', 'SELL', 'WITHDRAWAL',
                                       'DIVIDEND', 'FEE', 'TAX', 'ADJUSTMENT')
                          ),
    occurred_on           TEXT NOT NULL,
    asset_id              INTEGER REFERENCES assets(id),
    quantity              REAL,
    price_per_unit_minor  INTEGER,
    fees_minor            INTEGER NOT NULL DEFAULT 0,
    total_amount_minor    INTEGER NOT NULL,
    currency_code         TEXT NOT NULL,
    notes                 TEXT,
    created_at            TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_investment_transactions_date
    ON investment_transactions(occurred_on);