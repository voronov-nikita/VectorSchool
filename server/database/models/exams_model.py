def create_exam_tables(db):
    db.execute('''
        CREATE TABLE IF NOT EXISTS exams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            place TEXT NOT NULL,
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL
        )
    ''')

    db.execute('''
        CREATE TABLE IF NOT EXISTS exam_signups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            exam_id INTEGER UNIQUE,
            student_login TEXT,
            signup_time TEXT,
            UNIQUE(exam_id, student_login),
            FOREIGN KEY(exam_id) REFERENCES exams(id)
        )
    ''')
