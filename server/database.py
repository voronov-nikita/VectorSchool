import sqlite3
from flask import g
from werkzeug.security import generate_password_hash, check_password_hash


# DATABASE = 'journal.db'
DATABASE = "./users.db"

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
            name TEXT NOT NULL UNIQUE,
            curator TEXT
        )
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            fio TEXT NOT NULL,
            group_id INTEGER,
            attendance INTEGER DEFAULT 0,
            birth_date TEXT,
            telegram_id TEXT,
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

    db.execute('''
        CREATE TABLE IF NOT EXISTS tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            max_score INTEGER NOT NULL,
            score_per_question INTEGER NOT NULL
        );
    ''')

    db.execute('''
        CREATE TABLE IF NOT EXISTS test_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_id INTEGER NOT NULL,
            text TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('single', 'multiple', 'text')),
            FOREIGN KEY(test_id) REFERENCES tests(id)
        );
    ''')

    db.execute('''
        CREATE TABLE IF NOT EXISTS test_answers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER NOT NULL,
            answer_text TEXT,
            is_correct INTEGER DEFAULT 0,
            FOREIGN KEY(question_id) REFERENCES test_questions(id)
        );
    ''')

    db.execute('''
        CREATE TABLE IF NOT EXISTS test_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_id INTEGER NOT NULL,
            text TEXT,
            answer TEXT,
            FOREIGN KEY(test_id) REFERENCES tests(id)
        )
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS achievements_catalog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            filename TEXT NOT NULL UNIQUE
        )
    ''')

    # Сохраняем всю эту хрень
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
            data.get('rating', 0), data.get(
                'attendance', 0), data.get('achievements', '')
        ))
        db.commit()
        return True, None
    except sqlite3.IntegrityError as e:
        return False, f"Ошибка целостности данных: {str(e)}"
    except Exception as e:
        return False, f"Неизвестная ошибка: {str(e)}"


def get_user_by_login(login):
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE login = ?',
                      (login,)).fetchone()
    return user


def get_user_access_level_from_db(login):
    db = get_db()
    user = db.execute(
        "SELECT access_level FROM users WHERE login = ?", (login,)).fetchone()
    if user:
        return user['access_level']
    return None


def verify_password(stored_password_hash, provided_password):
    return check_password_hash(stored_password_hash, provided_password)


def get_profile_by_login(login):
    db = get_db()
    user = db.execute(
        'SELECT login, fio, rating, attendance, achievements FROM users WHERE login = ?', (login,)).fetchone()
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

# ---- Students ----


def add_student(fio, group_id, birth_date='', telegram_id=''):
    db = get_db()
    db.execute(
        "INSERT INTO students (fio, group_id, birth_date, telegram_id) VALUES (?, ?, ?, ?)",
        (fio, group_id, birth_date, telegram_id)
    )
    db.commit()


def get_students(group_id):
    db = get_db()
    res = db.execute("SELECT * FROM students WHERE group_id = ?",
                     (group_id,)).fetchall()
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
        "SELECT * FROM lessons WHERE group_id = ? ORDER BY date ASC", (
            group_id,)
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


# Tests

def add_test_with_questions(test_data):
    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        INSERT INTO tests (name, max_score, score_per_question)
        VALUES (?, ?, ?)
    ''', (test_data['name'], test_data['max_score'], test_data['score_per_question']))
    test_id = cursor.lastrowid

    for q in test_data['questions']:
        cursor.execute('''
            INSERT INTO test_questions (test_id, text, type)
            VALUES (?, ?, ?)
        ''', (test_id, q['text'], q['type']))
        q_id = cursor.lastrowid

        if q['type'] in ('single', 'multiple'):
            for idx, ans_text in enumerate(q['answers']):
                is_correct = 1 if idx in q['correctIndexes'] else 0
                cursor.execute('''
                    INSERT INTO test_answers (question_id, answer_text, is_correct)
                    VALUES (?, ?, ?)
                ''', (q_id, ans_text, is_correct))
        elif q['type'] == 'text':
            correct_answer = q['answers'][0] if q['answers'] else ""
            cursor.execute('''
                INSERT INTO test_answers (question_id, answer_text, is_correct)
                VALUES (?, ?, 1)
            ''', (q_id, correct_answer))
    db.commit()
    return test_id


def get_all_tests():
    db = get_db()
    tests = db.execute('SELECT * FROM tests').fetchall()
    result = []
    for t in tests:
        test = dict(t)
        questions = db.execute(
            'SELECT id, text, type FROM test_questions WHERE test_id=?', (t['id'],)).fetchall()
        test_questions = []
        for q in questions:
            question = dict(q)
            if question['type'] in ('single', 'multiple'):
                answers = db.execute(
                    'SELECT answer_text, is_correct FROM test_answers WHERE question_id = ?', (q['id'],)).fetchall()
                question['answers'] = [a['answer_text'] for a in answers]
                question['correctIndexes'] = [
                    i for i, a in enumerate(answers) if a['is_correct'] == 1]
            elif question['type'] == 'text':
                ans = db.execute(
                    'SELECT answer_text FROM test_answers WHERE question_id = ? AND is_correct=1', (q['id'],)).fetchone()
                question['answers'] = [ans['answer_text']] if ans else []
                question['correctIndexes'] = []
            test_questions.append(question)
        test['questions'] = test_questions
        result.append(test)
    return result


def get_user_achievements(login):
    db = get_db()
    achievements = db.execute('''
        SELECT achievement_name, date_obtained
        FROM user_achievements
        WHERE user_login = ?
        ORDER BY date_obtained DESC
    ''', (login,)).fetchall()
    return [{
        'name': ach['achievement_name'],
        'date': ach['date_obtained'],
        'url': f"/achievements_images/{ach['achievement_name']}"
    } for ach in achievements]


if __name__ == "__main__":
    init_db()
