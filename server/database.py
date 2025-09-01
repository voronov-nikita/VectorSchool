from werkzeug.security import generate_password_hash, check_password_hash
from flask import g
import sqlite3

DATABASE = 'users.db'

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def close_db(e=None):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    db = get_db()
    db.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fio TEXT NOT NULL,
            login TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            telegram TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            group_name TEXT,
            birth_date TEXT,
            access_level TEXT NOT NULL CHECK(access_level IN ('боец','комисар','админ','куратор')),
            rating REAL DEFAULT 0,
            attendance INTEGER DEFAULT 0,
            achievements TEXT DEFAULT ''
        )
    ''')
    db.commit()
    db.close()


def add_user(data):
    hashed_password = generate_password_hash(data['password'])
    db = get_db()
    try:
        db.execute('''
            INSERT INTO users (fio, login, password, telegram, email, phone, group_name, birth_date, access_level, rating, attendance, achievements)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['fio'], data['login'], hashed_password, data['telegram'],
            data.get('email'), data.get('phone'), data.get('group_name'),
            data.get('birth_date'), data['access_level'],
            data.get('rating', 0), data.get('attendance', 0), data.get('achievements', '')
        ))
        db.commit()
        return True, None
    except sqlite3.IntegrityError as e:
        return False, f"Ошибка целостности данных: {str(e)}"
    except Exception as e:
        return False, f"Неизвестная ошибка: {str(e)}"
    finally:
        db.close()


def get_user_by_login(login):
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE login = ?', (login,)).fetchone()
    db.close()
    return user

def verify_password(stored_password_hash, provided_password):
    return check_password_hash(stored_password_hash, provided_password)

def get_profile_by_login(login):
    db = get_db()
    user = db.execute('SELECT login, fio, rating, attendance, achievements FROM users WHERE login = ?', (login,)).fetchone()
    db.close()
    return user


if __name__=="__main__":
    init_db()