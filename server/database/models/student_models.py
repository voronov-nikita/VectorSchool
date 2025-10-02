from database.db_connection import get_db

def create_student_tables(db):
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

def add_student(fio, group_id, birth_date='', telegram_id=''):
    db = get_db()
    
    db.execute(
        "INSERT INTO students (fio, group_id, birth_date, telegram_id) VALUES (?, ?, ?, ?)",
        (fio, group_id, birth_date, telegram_id)
    )
    db.commit()
