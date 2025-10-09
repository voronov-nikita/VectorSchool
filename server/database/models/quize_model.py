from database.db_connection import get_db


def create_database_quize(db):
    db.execute("""
    CREATE TABLE IF NOT EXISTS quize_questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        options TEXT NOT NULL,
        correct_answer TEXT NOT NULL
    )
    """)


def get_all_questions():
    conn = get_db()
    rows = conn.execute("SELECT * FROM quize_questions").fetchall()
    conn.close()
    questions = []
    for row in rows:
        questions.append({
            "id": row["id"],
            "question": row["question"],
            "options": eval(row["options"]),
            "correct_answer": row["correct_answer"]
        })
    return questions


def add_question_to_db(question, options, correct_answer):
    conn = get_db()
    conn.execute(
        "INSERT INTO quize_questions (question, options, correct_answer) VALUES (?, ?, ?)",
        (question, str(options), correct_answer)
    )
    conn.commit()
    conn.close()
