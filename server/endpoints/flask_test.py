# main.py (фрагменты сервера Flask)

from flask import Blueprint, request, jsonify

from database.db_connection import get_db, close_db, init_db
from database.models.user_models import get
from database.models.test_models import create_test_tables, add_test_with_questions, save_uploaded_files
from werkzeug.utils import secure_filename
import uuid
import os

test_bp = Blueprint("tests", __name__)
MAX_FILE_SIZE = 20 * 1024 * 1024

UPLOAD_FOLDER = "./uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@test_bp.route('/tests', methods=['GET'])
def get_tests_api():
    tests = get_all_tests()
    return jsonify({'tests': tests})


@test_bp.route('/tests', methods=['POST'])
def add_test_api():
    data = request.get_json()
    test_id = add_test_with_questions(data)
    return jsonify({'result': 'Test added', 'id': test_id})


@test_bp.route('/api/tests/submit', methods=['POST'])
def submit_test_results():
    user_login = request.headers.get('login')  # или из токена/данных сессии
    test_id = request.form.get('test_id')
    if not user_login or not test_id:
        return jsonify({"error": "Отсутствует login или test_id"}), 400

    # Получаем ответы и файлы
    answers_raw = {}
    for key, value in request.form.items():
        if key.startswith("answers["):
            idx = int(key[8:-1])
            answers_raw[idx] = value

    files = request.files

    db = get_db()

    for idx, answer_json in answers_raw.items():
        answer_data = None
        try:
            import json
            answer_data = json.loads(answer_json)
        except Exception:
            answer_data = answer_json

        file_path = None
        file_key = f"files[{idx}]"
        if file_key in files:
            file = files[file_key]
            if file.content_length > MAX_FILE_SIZE:
                return jsonify({"error": f"Файл для вопроса {idx} превышает 20 МБ"}), 400
            filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
            file.save(os.path.join(UPLOAD_FOLDER, filename))
            file_path = filename

        # По каждому вопросу записываем в БД
        db.execute('''
            INSERT INTO test_results (user_login, test_id, question_index, answer_text, file_path, score, checked)
            VALUES (?, ?, ?, ?, ?, 0, 0)
        ''', (user_login, test_id, idx, str(answer_data), file_path))

    db.commit()
    return jsonify({"result": "Результаты успешно сохранены"})


@test_bp.route('/tests/files_upload', methods=['POST'])
def upload_test_files():
    if 'test_id' not in request.form:
        return jsonify({"error": "Отсутствует test_id"}), 400

    test_id = request.form['test_id']
    files = request.files

    db = get_db()

    for key in files:
        # Ожидаем ключи вида files[0], files[1] и т.д.
        file = files[key]
        idx_str = key[key.find('[')+1:key.find(']')]
        try:
            question_index = int(idx_str)
        except ValueError:
            continue

        if file.content_length > MAX_FILE_SIZE:
            return jsonify({"error": f"Файл для вопроса {question_index} превышает 20 МБ"}), 400

        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        file.save(os.path.join(UPLOAD_FOLDER, filename))

        # Сохраняем путь к файлу в базе, если нужно (или связываем с вопросом)
        # Пока что просто выводим в лог или делаем нужный запрос

        # Например, можно связать файл с вопросом или тестом,
        # но так как вопросы уже в базе, нужна дополнительная логика

    return jsonify({"result": "Файлы успешно загружены"})


@test_bp.route('/api/tests/results/<int:test_id>/<user_login>', methods=['GET'])
def get_test_results(test_id, user_login):
    # Проверка прав доступа должна быть здесь
    db = get_db()
    rows = db.execute('''
        SELECT question_index, answer_text, file_path, score, checked
        FROM test_results
        WHERE test_id = ? AND user_login = ?
        ORDER BY question_index
    ''', (test_id, user_login)).fetchall()

    results = []
    for r in rows:
        results.append({
            "question_index": r['question_index'],
            "answer_text": r['answer_text'],
            "file_url": f"/uploads/{r['file_path']}" if r['file_path'] else None,
            "score": r['score'],
            "checked": bool(r['checked']),
        })
    return jsonify({"results": results})
