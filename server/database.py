import sqlite3
from flask import g
from werkzeug.security import generate_password_hash, check_password_hash

# DATABASE = 'journal.db'
DATABASE = "users.db"

# ---- DB connection and setup ----

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db

def close_db():
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
    db.execute('''
        CREATE TABLE IF NOT EXISTS groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE
        )
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fio TEXT NOT NULL,
            group_id INTEGER,
            FOREIGN KEY(group_id) REFERENCES groups(id)
        )
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER,
            date TEXT NOT NULL,
            lesson_type TEXT NOT NULL,
            FOREIGN KEY(group_id) REFERENCES groups(id)
        )
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER,
            lesson_id INTEGER,
            status TEXT NOT NULL CHECK(status IN ('+', 'Н')),
            FOREIGN KEY(student_id) REFERENCES students(id),
            FOREIGN KEY(lesson_id) REFERENCES lessons(id)
        )
    ''')
    db.commit()

# ---- User funcs ----

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

def get_user_by_login(login):
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE login = ?', (login,)).fetchone()
    return user

def verify_password(stored_password_hash, provided_password):
    return check_password_hash(stored_password_hash, provided_password)

def get_profile_by_login(login):
    db = get_db()
    user = db.execute('SELECT login, fio, rating, attendance, achievements FROM users WHERE login = ?', (login,)).fetchone()
    return user

def get_fighters(sort='fio', search=None):
    db = get_db()
    base_query = """
        SELECT login, fio, rating, attendance, achievements
        FROM users
        WHERE access_level = 'боец'
    """
    args = []
    if sort == 'fio' and search:
        parts = search.strip().split()[:3]
        for part in parts:
            base_query += " AND fio LIKE ?"
            args.append(f"{part}%")
        base_query += " ORDER BY fio ASC"
    else:
        if search:
            base_query += " AND fio LIKE ?"
            args.append(f"%{search}%")
        if sort == "rating":
            base_query += " ORDER BY rating DESC"
        elif sort == "attendance":
            base_query += " ORDER BY attendance DESC"
        else:
            base_query += " ORDER BY fio ASC"
    users = db.execute(base_query, args).fetchall()
    return [dict(u) for u in users]

def group_top_users(users, max_line=3, top_n=10):
    ranked = []
    current_rank = 1
    current_score = None
    line = []
    for u in users:
        if current_score is None or u['rating'] != current_score:
            if line:
                ranked.append({'rank': current_rank, 'users': line})
            line = []
            current_score = u['rating']
            current_rank = len(ranked) + 1
        line.append(u)
        if len(line) == max_line:
            ranked.append({'rank': current_rank, 'users': line})
            line = []
            current_rank = len(ranked) + 1
    if line:
        ranked.append({'rank': current_rank, 'users': line})
    return ranked[:top_n]

# ---- Groups ----

def add_group(name):
    db = get_db()
    try:
        db.execute("INSERT INTO groups (name) VALUES (?)", (name,))
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

# ---- Students ----

def add_student(fio, group_id):
    db = get_db()
    db.execute("INSERT INTO students (fio, group_id) VALUES (?, ?)", (fio, group_id))
    db.commit()

def get_students(group_id):
    db = get_db()
    res = db.execute("SELECT * FROM students WHERE group_id = ?", (group_id,)).fetchall()
    return [dict(r) for r in res]

def delete_student(student_id):
    db = get_db()
    db.execute("DELETE FROM students WHERE id = ?", (student_id,))
    db.commit()

# ---- Lessons ----

def add_lesson(group_id, date, lesson_type):
    db = get_db()
    db.execute(
        "INSERT INTO lessons (group_id, date, lesson_type) VALUES (?, ?, ?)",
        (group_id, date, lesson_type)
    )
    db.commit()

def get_lessons(group_id):
    db = get_db()
    res = db.execute(
        "SELECT * FROM lessons WHERE group_id = ? ORDER BY date ASC",
        (group_id,)
    ).fetchall()
    return [dict(r) for r in res]

def delete_lesson(lesson_id):
    db = get_db()
    db.execute("DELETE FROM lessons WHERE id = ?", (lesson_id,))
    db.commit()

# ---- Attendance ----

def set_attendance(student_id, lesson_id, status):
    db = get_db()
    rec = db.execute(
        "SELECT id FROM attendance WHERE student_id = ? AND lesson_id = ?",
        (student_id, lesson_id)
    ).fetchone()
    if rec:
        db.execute(
            "UPDATE attendance SET status = ? WHERE id = ?",
            (status, rec['id'])
        )
    else:
        db.execute(
            "INSERT INTO attendance (student_id, lesson_id, status) VALUES (?, ?, ?)",
            (student_id, lesson_id, status)
        )
    db.commit()

def get_attendance(student_id, lesson_id):
    db = get_db()
    res = db.execute(
        "SELECT status FROM attendance WHERE student_id = ? AND lesson_id = ?",
        (student_id, lesson_id)
    ).fetchone()
    return res['status'] if res else 'Н'

def get_group_journal(group_id):
    db = get_db()
    students = db.execute(
        "SELECT * FROM students WHERE group_id = ?", (group_id,)
    ).fetchall()
    lessons = db.execute(
        "SELECT * FROM lessons WHERE group_id = ? ORDER BY date ASC", (group_id,)
    ).fetchall()
    attendance = db.execute(
        "SELECT * FROM attendance"
    ).fetchall()
    return {
        'students': [dict(r) for r in students],
        'lessons': [dict(r) for r in lessons],
        'attendance': [dict(r) for r in attendance]
    }

def can_edit_journal(user):
    return user['access_level'] in ('куратор', 'админ')


if __name__=="__main__":
    init_db()