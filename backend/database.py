import sqlite3
from datetime import datetime
from typing import List, Dict

DB_NAME = "uptime_monitor.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS site_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT NOT NULL,
            status TEXT NOT NULL,
            response_time REAL NOT NULL,
            ssl_days_left INTEGER,
            checked_at TIMESTAMP NOT NULL
        )
    ''')
    
    # Target URLs configuration table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS targets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            url TEXT UNIQUE NOT NULL
        )
    ''')
    
    # Insert default targets if empty
    cursor.execute("SELECT COUNT(*) FROM targets")
    if cursor.fetchone()[0] == 0:
        default_targets = [
            ("https://google.com",),
            ("https://github.com",),
            ("https://fastapi.tiangolo.com",)
        ]
        cursor.executemany("INSERT INTO targets (url) VALUES (?)", default_targets)
        
    conn.commit()
    conn.close()

def log_check_result(url: str, status: str, response_time: float, ssl_days_left: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO site_logs (url, status, response_time, ssl_days_left, checked_at)
        VALUES (?, ?, ?, ?, ?)
    ''', (url, status, response_time, ssl_days_left, datetime.now()))
    conn.commit()
    conn.close()

def get_latest_status() -> List[Dict]:
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get the most recent log for each URL
    cursor.execute('''
        SELECT s1.*
        FROM site_logs s1
        INNER JOIN (
            SELECT url, MAX(checked_at) as max_date
            FROM site_logs
            GROUP BY url
        ) s2 ON s1.url = s2.url AND s1.checked_at = s2.max_date
    ''')
    
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_history(url: str, limit: int = 50) -> List[Dict]:
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('''
        SELECT * FROM site_logs
        WHERE url = ?
        ORDER BY checked_at ASC
        LIMIT ?
    ''', (url, limit))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]

def get_targets() -> List[str]:
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT url FROM targets')
    rows = cursor.fetchall()
    conn.close()
    return [row[0] for row in rows]
