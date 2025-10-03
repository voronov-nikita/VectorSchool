# database/test_models.py

from database.db_connection import get_db
from werkzeug.utils import secure_filename
import uuid
import os

UPLOAD_FOLDER = "./uploads"
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


def create_test_tables(db):
    db.execute('''
        CREATE TABLE IF NOT EXISTS tests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            max_score INTEGER NOT NULL,
            score_per_question INTEGER NOT NULL,
            image_path TEXT DEFAULT NULL
        );
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS test_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            test_id INTEGER NOT NULL,
            text TEXT NOT NULL,
            type TEXT NOT NULL CHECK(type IN ('single', 'multiple', 'text')),
            score INTEGER DEFAULT 0,
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


def add_test_with_questions(test_data, image_files=None):
    db = get_db()
    cursor = db.cursor()
    cursor.execute('''
        INSERT INTO tests (name, max_score, score_per_question, image_path)
        VALUES (?, ?, ?, NULL)
    ''', (test_data['name'], test_data['max_score'], test_data['score_per_question']))
    test_id = cursor.lastrowid

    # Сохраняем вопросы и ответы
    for idx, question in enumerate(test_data.get('questions', [])):
        cursor.execute('''
            INSERT INTO test_questions (test_id, text, type, score)
            VALUES (?, ?, ?, ?)
        ''', (test_id, question['text'], question['type'], question.get('score', 0)))
        question_id = cursor.lastrowid

        # Сохраняем варианты ответов
        if question['type'] in ('single', 'multiple'):
            correct_indexes = set(question.get('correctIndexes', []))
            for i, ans_text in enumerate(question.get('answers', [])):
                is_correct = 1 if i in correct_indexes else 0
                cursor.execute('''
                    INSERT INTO test_answers (question_id, answer_text, is_correct)
                    VALUES (?, ?, ?)
                ''', (question_id, ans_text, is_correct))
        elif question['type'] == 'text':
            ans_text = question.get('answers', [''])[0]
            cursor.execute('''
                INSERT INTO test_answers (question_id, answer_text, is_correct)
                VALUES (?, ?, 1)
            ''', (question_id, ans_text))

    db.commit()
    return test_id


def save_uploaded_files(test_id, files_dict):
    db = get_db()
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

    for key in files_dict:
        if not key.startswith("files["):
            continue
        file = files_dict[key]
        idx_str = key[key.find("[") + 1:key.find("]")]
        try:
            question_index = int(idx_str)
        except ValueError:
            continue
        if file.content_length > MAX_FILE_SIZE:
            continue
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        file.save(os.path.join(UPLOAD_FOLDER, filename))

        # Свяжем файл с вопросом, можно сохранять в базе (требуется доработка)
        # Например:
        # db.execute('UPDATE test_questions SET image_path = ? WHERE test_id = ? AND id = ?', (filename, test_id, question_id))

    db.commit()


def get_all_tests():
    db = get_db()
    result = db.execute('SELECT * FROM tests').fetchall()
    return [dict(a) for a in result]
