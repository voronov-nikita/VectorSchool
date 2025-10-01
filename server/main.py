import uuid
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from database import *
from werkzeug.utils import secure_filename
import os
# from admin.app import index

# <---------------- Определение основного КОНСТАНТ и зависимостей ---------------->

application = Flask(__name__)
CORS(application, origins=["*"], methods=["GET", "POST",
     "PATCH", "DELETE", "OPTIONS"], supports_credentials=True)

UPLOAD_FOLDER = "./uploads"
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# <---------------- Определение основного кода ---------------->


@application.before_request
def before_request():
    get_db()


@application.teardown_appcontext
def teardown_db(exception):
    close_db()


# Инициализация базы при запуске
with application.app_context():
    init_db()

# ----- API ENDPOINTS -----


@application.route('/profile', methods=['GET'])
def get_profile():
    login = request.args.get('login')
    if not login:
        return jsonify({"error": "Логин обязателен"}), 400
    user = get_user_by_login(login)
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404
    return jsonify({"fio": user['fio'], "email": user['email']})


@application.route('/login', methods=['POST'])
def login():
    data = request.json
    login_ = data.get('login')
    password_ = data.get('password')
    if not login_ or not password_:
        return jsonify({"error": "Укажите логин и пароль"}), 400

    user = get_user_by_login(login_)
    if user is None or not verify_password(user['password'], password_):
        return jsonify({"error": "Неверный логин или пароль"}), 401

    return jsonify({
        "fio": user['fio'],
        "login": user['login'],
        "telegram": user['telegram'],
        "email": user['email'],
        "phone": user['phone'],
        "group_name": user['group_name'],
        "birth_date": user['birth_date'],
        "access_level": user['access_level'],
    })


# def allowed_file(filename):
#     return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@application.route('/user/access_level', methods=['GET'])
def get_user_access_level():
    login = request.args.get('login')
    if not login:
        return jsonify({"error": "Missing 'login' parameter"}), 400

    access_level = get_user_access_level_from_db(login)
    if access_level:
        return jsonify({"access_level": access_level})
    else:
        print("SERVISE OK")
        return jsonify({"error": "User not found"}), 404


@application.route('/profile/<login>', methods=['GET'])
def profile(login):
    user = get_user_by_login(login)
    if user is None:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({
        'login': user['login'],
        'fio': user['fio'],
        'rating': user['rating'],
        'telegram': user['telegram'],
        'phone': user['phone'],
        'group_name': user['group_name'],
        'birth_date': user['birth_date'],
        'access_level': user['access_level'],
        'attendance': user['attendance'],
        'achievements': user['achievements'].split('\n') if user['achievements'] else []
    })


@application.route('/users', methods=['GET'])
def fighters_api():
    search = request.args.get('search', '')
    sort = request.args.get('sort', 'fio')
    fighters = get_fighters(sort=sort, search=search)
    return jsonify({'fighters': fighters})


@application.route('/rating', methods=['GET'])
def rating_api():
    fighters = get_fighters(sort='rating')
    top_10 = group_top_users(fighters, max_line=3, top_n=10)
    return jsonify({'top_10': top_10})

# Дополнительные эндпоинты для групп, студентов, занятий и посещаемости
# Все это для школы Вектора


@application.route('/groups', methods=['GET'])
def api_get_groups():
    return jsonify(get_groups())


@application.route('/groups', methods=['POST'])
def api_add_group():
    data = request.get_json()
    name = data.get('name')
    curator = data.get('curator')
    if not name or not curator:
        return jsonify({'error': 'Укажите имя группы и куратора'}), 400
    ok, err = add_group(name, curator)
    if not ok:
        return jsonify({'error': err}), 400
    return jsonify({'result': 'Group added'})


@application.route('/groups_with_users', methods=['GET'])
def get_groups_with_users():
    db = get_db()
    rows = db.execute('''
        SELECT g.name AS group_name, g.curator, u.login, u.fio
        FROM groups g
        LEFT JOIN users u ON u.group_name = g.name
        ORDER BY g.name, u.fio;
    ''').fetchall()

    groups = {}
    for row in rows:
        gn = row['group_name']
        if gn not in groups:
            groups[gn] = {
                'curator': row['curator'],
                'users': []
            }
        if row['login']:
            groups[gn]['users'].append(
                {'login': row['login'], 'fio': row['fio']})
    result = []
    for group_name, info in groups.items():
        result.append({
            'title': f"{group_name} (Куратор: {info['curator']})",
            'data': info['users'] 
        })

    return jsonify(result)


@application.route('/students', methods=['GET'])
def api_get_students():
    group_id = request.args.get('group_id')
    db = get_db()
    rows = db.execute('''
        SELECT s.id, s.fio, s.group_id, s.attendance, s.birth_date, s.telegram_id,
               u.login
        FROM students s
        LEFT JOIN users u ON s.fio = u.fio
        WHERE s.group_id = ?
    ''', (group_id,)).fetchall()

    students = [dict(row) for row in rows]
    return jsonify(students)


@application.route('/students', methods=['POST'])
def api_add_student():
    data = request.get_json()
    fio = data.get('fio')
    group_id = data.get('group_id')
    birth_date = data.get('birth_date', '')
    telegram_id = data.get('telegram_id', '')

    if not fio or not group_id:
        return jsonify({'error': 'ФИО и ID группы обязательны'}), 400

    add_student(fio, group_id, birth_date, telegram_id)
    return jsonify({'result': 'Student added'})


@application.route('/students/<int:student_id>', methods=['DELETE'])
def api_delete_student(student_id):
    db = get_db()
    db.execute("DELETE FROM students WHERE id=?", (student_id,))
    db.commit()
    return jsonify({"result": "deleted"})


@application.route('/students/<int:student_id>/attendance', methods=['POST'])
def api_update_attendance(student_id):
    data = request.get_json()
    delta = data.get('delta')
    if delta not in [1, -1]:
        return jsonify({'error': 'Некорректное изменение'}), 400
    db = get_db()
    student = db.execute(
        "SELECT attendance FROM students WHERE id=?", (student_id,)).fetchone()
    if not student:
        return jsonify({"error": "Студент не найден"}), 404
    new_value = max((student['attendance'] or 0) + delta, 0)
    db.execute("UPDATE students SET attendance=? WHERE id=?",
               (new_value, student_id))
    db.commit()
    return jsonify({'attendance': new_value})


@application.route('/lessons', methods=['GET'])
def api_get_lessons():
    group_id = request.args.get('group_id')
    lessons = get_lessons(group_id)
    return jsonify(lessons)


@application.route('/lessons', methods=['POST'])
def api_add_lesson():
    data = request.get_json()
    add_lesson(data['group_id'], data['date'], data['lesson_type'])
    return jsonify({'result': 'Lesson added'})


@application.route('/journal', methods=['GET'])
def api_get_journal():
    group_id = request.args.get('group_id')
    journal = get_group_journal(group_id)
    return jsonify(journal)


@application.route('/attendance/bulk', methods=['POST'])
def save_attendance_bulk():
    data = request.get_json()
    lesson_id = data.get('lesson_id')
    # [{student_id: ..., status: '+' или 'Н'}]
    attendances = data.get('attendances')
    if not lesson_id or not isinstance(attendances, list):
        return jsonify({'error': 'Недостаточно данных'}), 400
    for rec in attendances:
        set_attendance(rec['student_id'], lesson_id, rec['status'])
    return jsonify({'result': 'ok'})


@application.route('/lessons/<int:lesson_id>', methods=['DELETE'])
def api_delete_lesson(lesson_id):
    delete_lesson(lesson_id)
    return jsonify({'result': 'Lesson deleted'})


@application.route('/tests', methods=['GET'])
def get_tests_api():
    tests = get_all_tests()
    return jsonify({'tests': tests})


@application.route('/tests', methods=['POST'])
def add_test_api():
    data = request.get_json()
    test_id = add_test_with_questions(data)
    return jsonify({'result': 'Test added', 'id': test_id})


@application.route('/api/tests/submit', methods=['POST'])
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


@application.route('/tests/files_upload', methods=['POST'])
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


@application.route('/api/tests/results/<int:test_id>/<user_login>', methods=['GET'])
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


def is_admin(login):
    user = get_user_by_login(login)
    return user and user["access_level"] == "админ"


@application.route('/events', methods=['GET'])
def api_get_events():
    # ?date=YYYY-MM-DD (необязательный)
    date = request.args.get('date')
    events = get_events(date)
    return jsonify({'events': events})


@application.route('/events/create', methods=['POST'])
def api_create_event():
    login = request.headers.get('login')
    # ...проверка доступа
    data = request.json
    title = data.get('title')
    date = data.get('date')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    auditorium = data.get('auditorium', '-')   # по умолчанию '-'

    if not all([title, date, start_time, end_time]):
        return jsonify({"error": "Все поля обязательны"}), 400
    add_event(title, date, start_time, end_time, auditorium, created_by=login)
    return jsonify({'result': 'ok'})


@application.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    login = request.headers.get('login')
    # Проверка уровня доступа
    user = get_user_by_login(login)
    if not user or user['access_level'] not in ('админ', 'куратор'):
        return jsonify({'error': 'Access denied'}), 403
    db = get_db()
    db.execute('DELETE FROM events WHERE id=?', (event_id,))
    db.commit()
    return jsonify({'result': 'deleted'})


@application.route('/events/<int:event_id>', methods=['PATCH'])
def edit_event(event_id):
    login = request.headers.get('login')
    user = get_user_by_login(login)
    if not user or user['access_level'] not in ('админ', 'куратор'):
        return jsonify({'error': 'Access denied'}), 403
    data = request.json
    fields = []
    values = []
    for k in ['title', 'start_time', 'end_time', 'date', 'auditorium']:
        if k in data:
            fields.append(f"{k}=?")
            values.append(data[k])

    values.append(event_id)
    if fields:
        db = get_db()
        db.execute(f'UPDATE events SET {", ".join(fields)} WHERE id=?', values)
        db.commit()
        return jsonify({'result': 'updated'})
    return jsonify({'error': 'No data'}), 400


@application.route('/events/<int:event_id>', methods=['GET'])
def get_event_info(event_id):
    db = get_db()
    ev = db.execute(
        'SELECT id, title, date, start_time, end_time, created_by FROM events WHERE id=?',
        (event_id,)
    ).fetchone()
    if ev is None:
        return jsonify({'error': 'Событие не найдено'}), 404
    return jsonify(dict(ev))


@application.route('/event/<int:event_id>/participants', methods=['GET'])
def get_event_participants(event_id):
    db = get_db()
    # Получаем всех логинов участников события
    participant_logins = db.execute('''
        SELECT login FROM users
    ''').fetchall()
    logins = [row['login'] for row in participant_logins]

    if not logins:
        # Нет участников - вернуть пустой список
        return jsonify({'participants': []})

    # Получаем посещаемость для участников данного event_id
    attendance_rows = db.execute(f'''
        SELECT user_login, attended FROM event_attendance WHERE event_id = ? AND user_login IN ({','.join('?' for _ in logins)})
    ''', (event_id, *logins)).fetchall()

    # Собираем словарь посещаемости user_login -> attended
    attendance_dict = {row['user_login']: bool(
        row['attended']) for row in attendance_rows}

    # Собираем итоговый список участников с посещаемостью (если нет отметки - False)
    participants = [{'login': login, 'attended': attendance_dict.get(
        login, False)} for login in logins]

    return jsonify({'participants': participants})


@application.route(
    '/event/<int:event_id>/participants/<login>/attendance', methods=['POST', 'OPTIONS'])
def set_event_attendance(event_id, login):
    # Обработка OPTIONS preflight
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add(
            "Access-Control-Allow-Headers", "Content-Type, login")
        return response

    status = request.json.get('attended')
    print(f"\n\n{status}\n\n")
    db = get_db()
    # Вставка или обновление записи посещения
    db.execute(
        'INSERT OR REPLACE INTO event_attendance (event_id, user_login, attended) VALUES (?, ?, ?)',
        (event_id, login, int(bool(status)))
    )

    db.commit()

    return jsonify({'result': 'ok'})


@application.route('/achievements', methods=['GET'])
def achievements_api():
    login = request.headers.get('login')
    if not login:
        return jsonify({'error': 'Login header is required'}), 400
    achievements = get_user_achievements(login)
    return jsonify(achievements)


@application.route('/achievements/add', methods=['POST'])
def add_achievement_api():
    # логин администратора, добавляющего достижение
    admin_login = request.headers.get('login')
    if not admin_login:
        return jsonify({'error': 'Login header is required'}), 400

    data = request.json
    user_login = data.get('user_login')
    achievement_name = data.get('achievement_name')
    if not user_login or not achievement_name:
        return jsonify({'error': 'user_login and achievement_name are required'}), 400

    db = get_db()

    # Проверяем, что достижение еще не установлено у пользователя
    exists = db.execute('''
        SELECT 1 FROM user_achievements WHERE user_login = ? AND achievement_name = ?
    ''', (user_login, achievement_name)).fetchone()
    if exists:
        return jsonify({'message': 'Достижение уже у пользователя'}), 200

    import datetime
    date_obtained = datetime.datetime.now().isoformat()

    db.execute('''
        INSERT INTO user_achievements (user_login, achievement_name, date_obtained)
        VALUES (?, ?, ?)
    ''', (user_login, achievement_name, date_obtained))
    db.commit()
    return jsonify({'message': 'Достижение добавлено'}), 201


def get_user_achievements(login):
    db = get_db()
    achievements = db.execute('''
        SELECT achievement_name AS name, date_obtained AS date
        FROM user_achievements
        WHERE user_login = ?
        ORDER BY date_obtained DESC
    ''', (login,)).fetchall()
    return [dict(a) for a in achievements]


if __name__ == '__main__':
    application.run(host='0.0.0.0', debug=True)
