from database.db_connection import get_db

def create_test_tables(db):
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
        CREATE TABLE IF NOT EXISTS test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_login TEXT NOT NULL,
            test_id INTEGER NOT NULL,
            question_index INTEGER NOT NULL,
            answer_text TEXT,
            file_path TEXT,
            score INTEGER DEFAULT 0,
            checked INTEGER DEFAULT 0,
            FOREIGN KEY(test_id) REFERENCES tests(id),
            FOREIGN KEY(user_login) REFERENCES users(login)
        );
    ''')


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
