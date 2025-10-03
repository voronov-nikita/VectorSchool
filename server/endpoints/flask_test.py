# main.py (фрагменты сервера Flask)

from flask import Blueprint, request, jsonify

from database.db_connection import get_db, close_db, init_db
from database.models.test_models import create_test_tables, add_test_with_questions, save_uploaded_files
from werkzeug.utils import secure_filename
import uuid
import os

test_bp = Blueprint("tests", __name__)
MAX_FILE_SIZE = 20 * 1024 * 1024

UPLOAD_FOLDER = "./uploads"

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@test_bp.route('/tests', methods=['POST'])
def add_test_api():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Отсутствуют данные"}), 400

    test_id = add_test_with_questions(data)

    return jsonify({'result': 'Test added', 'id': test_id})


@test_bp.route('/tests/files_upload', methods=['POST'])
def files_upload_api():
    test_id = request.form.get('test_id')
    if not test_id:
        return jsonify({"error": "Отсутствует test_id"}), 400

    if 'files' not in request.files and len(request.files) == 0:
        return jsonify({'result': 'No files uploaded'})

    try:
        save_uploaded_files(test_id, request.files)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    return jsonify({'result': 'Files uploaded'})


@test_bp.route('/api/tests/submit', methods=['POST'])
def submit_test_results():
    user_login = request.headers.get('login')  # Если нужна авторизация
    test_id = request.form.get('test_id')
    if not user_login or not test_id:
        return jsonify({"error": "Отсутствует login или test_id"}), 400

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

        db.execute('''
            INSERT INTO test_results (user_login, test_id, question_index, answer_text, file_path, score, checked)
            VALUES (?, ?, ?, ?, ?, 0, 0)
        ''', (user_login, test_id, idx, str(answer_data), file_path))

    db.commit()
    return jsonify({"result": "Результаты успешно сохранены"})
