import sqlite3
from database.db_connection import get_db

def create_group_tables(db):
    db.execute('''
        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            curator TEXT
        )
    ''')


def add_group(name, curator):
    db = get_db()
    
    try:
        db.execute(
            "INSERT INTO groups (name, curator) VALUES (?, ?)", (name, curator))
        db.commit()
        return True, None
    except sqlite3.IntegrityError as e:
        return False, f"Группа уже существует: {str(e)}"


def get_groups():
    db = get_db()
    
    res = db.execute("SELECT * FROM groups").fetchall()
    return [dict(r) for r in res]


def delete_group(group_id):
    db = get_db()
    
    db.execute("DELETE FROM groups WHERE id = ?", (group_id,))
    db.commit()
