"""SQLite storage: schema init and simple helpers."""
import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.getenv("DB_PATH", "firewall.db")


@contextmanager
def get_conn():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    """Create tables if they don't exist."""
    with get_conn() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS rules (
                id        INTEGER PRIMARY KEY AUTOINCREMENT,
                name      TEXT NOT NULL,
                pattern   TEXT NOT NULL,
                severity  TEXT DEFAULT 'medium',
                is_active INTEGER DEFAULT 1
            );

            CREATE TABLE IF NOT EXISTS prompts (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                prompt      TEXT NOT NULL,
                model       TEXT,
                decision    TEXT,          -- 'blocked' or 'allowed'
                matched_rule TEXT,         -- rule name, if any
                response    TEXT,          -- LLM response, if allowed
                created_at  TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS logs (
                id         INTEGER PRIMARY KEY AUTOINCREMENT,
                event      TEXT,
                detail     TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
            """
        )


def seed_rules():
    """Insert the 5 baseline rule categories if the table is empty."""
    defaults = [
        ("Instruction override", r"(?i)ignore (all |previous )?instructions", "high"),
        ("System prompt leak", r"(?i)(system prompt|reveal your (prompt|instructions))", "high"),
        ("Roleplay jailbreak", r"(?i)(pretend to be|act as|you are now) .*(DAN|unrestricted)", "medium"),
        ("Secret exfiltration", r"(?i)(password|api[ _-]?key|secret|token)", "high"),
        ("Delimiter evasion", r"(?i)(base64|rot13|decode the following)", "medium"),
    ]
    with get_conn() as conn:
        count = conn.execute("SELECT COUNT(*) AS c FROM rules").fetchone()["c"]
        if count == 0:
            conn.executemany(
                "INSERT INTO rules (name, pattern, severity) VALUES (?, ?, ?)",
                defaults,
            )
