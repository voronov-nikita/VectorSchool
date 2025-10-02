from database.db_connection import get_db

def create_attendance_tables(db):
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


def set_attendance(student_id, lesson_id, status):
    db = get_db()
    
    rec = db.execute("SELECT id FROM attendance WHERE student_id = ? AND lesson_id = ?",
                     (student_id, lesson_id)).fetchone()
    if rec:
        db.execute("UPDATE attendance SET status = ? WHERE id = ?",
                   (status, rec['id']))
    else:
        db.execute("INSERT INTO attendance (student_id, lesson_id, status) VALUES (?, ?, ?)",
                   (student_id, lesson_id, status))
    db.commit()


def get_attendance(student_id, lesson_id):
    db = get_db()
    
    res = db.execute("SELECT status FROM attendance WHERE student_id = ? AND lesson_id = ?",
                     (student_id, lesson_id)).fetchone()
    return res['status'] if res else 'Н'


def get_group_journal(group_id):
    db = get_db()
    
    students = db.execute(
        "SELECT * FROM students WHERE group_id = ?", (group_id,)).fetchall()
    lessons = db.execute(
        "SELECT * FROM lessons WHERE group_id = ? ORDER BY date ASC", (group_id,)).fetchall()
    attendance = db.execute("SELECT * FROM attendance").fetchall()
    return {
        'students': [dict(r) for r in students],
        'lessons': [dict(r) for r in lessons],
        'attendance': [dict(r) for r in attendance]
    }
