"""
database.py
=============
Simple SQLite-based user accounts, sessions, and per-user history
for MediGuide AI.

Tables:
    users    - id, username, email, password_hash, created_at
    sessions - token, user_id, created_at   (simple token-based auth)
    history  - id, user_id, patient_name, age, gender, symptoms,
               predicted_disease, confidence, risk_level, health_score,
               created_at

This is a student-project-grade auth system (hashed passwords, random
tokens) — good enough for a demo, not meant for production-scale security.
"""

import sqlite3
import secrets
import datetime
from werkzeug.security import generate_password_hash, check_password_hash

DB_PATH = "mediguide.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            token TEXT PRIMARY KEY,
            user_id INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    cur.execute("""
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            patient_name TEXT,
            age INTEGER,
            gender TEXT,
            symptoms TEXT,
            predicted_disease TEXT,
            confidence REAL,
            risk_level TEXT,
            health_score INTEGER,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()
    conn.close()


# =========================================================
# Users
# =========================================================

def create_user(username, email, password):
    conn = get_connection()
    cur = conn.cursor()

    password_hash = generate_password_hash(password)
    created_at = datetime.datetime.utcnow().isoformat()

    try:
        cur.execute(
            "INSERT INTO users (username, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (username, email, password_hash, created_at)
        )
        conn.commit()
        user_id = cur.lastrowid
        conn.close()
        return {"success": True, "user_id": user_id}
    except sqlite3.IntegrityError:
        conn.close()
        return {"success": False, "error": "Username or email already exists."}


def verify_user(username_or_email, password):
    conn = get_connection()
    cur = conn.cursor()

    cur.execute(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        (username_or_email, username_or_email)
    )
    user = cur.fetchone()
    conn.close()

    if user is None:
        return None

    if check_password_hash(user["password_hash"], password):
        return dict(user)

    return None


def get_user_by_id(user_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, username, email, created_at FROM users WHERE id = ?", (user_id,))
    user = cur.fetchone()
    conn.close()
    return dict(user) if user else None


# =========================================================
# Sessions (simple token-based auth)
# =========================================================

def create_session(user_id):
    token = secrets.token_hex(32)
    created_at = datetime.datetime.utcnow().isoformat()

    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)",
        (token, user_id, created_at)
    )
    conn.commit()
    conn.close()

    return token


def get_user_from_token(token):
    if not token:
        return None

    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT users.id, users.username, users.email
        FROM sessions
        JOIN users ON sessions.user_id = users.id
        WHERE sessions.token = ?
    """, (token,))
    row = cur.fetchone()
    conn.close()

    return dict(row) if row else None


def delete_session(token):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM sessions WHERE token = ?", (token,))
    conn.commit()
    conn.close()


# =========================================================
# History
# =========================================================

def add_history_entry(user_id, patient_name, age, gender, symptoms,
                       predicted_disease, confidence, risk_level, health_score):
    conn = get_connection()
    cur = conn.cursor()
    created_at = datetime.datetime.utcnow().isoformat()

    cur.execute("""
        INSERT INTO history
        (user_id, patient_name, age, gender, symptoms, predicted_disease,
         confidence, risk_level, health_score, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (user_id, patient_name, age, gender, symptoms, predicted_disease,
          confidence, risk_level, health_score, created_at))

    conn.commit()
    conn.close()


def get_history_for_user(user_id, limit=20):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT * FROM history
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ?
    """, (user_id, limit))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]