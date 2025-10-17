
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from database.models.achievement_models import *
from database.models.attendance_models import *
from database.models.event_models import *
from database.models.group_models import *
from database.models.test_models import *
from database.models.user_models import *
from database.db_connection import *

from werkzeug.utils import secure_filename
from endpoints.flask_users import user_bp
from endpoints.flask_groups import groups_bp
from endpoints.flask_attendance import attandance_bp
from endpoints.flask_students import students_bp
from endpoints.flask_test import test_bp
from endpoints.flask_quize import quize_bp
from endpoints.flask_exams import exam_bp
from endpoints.flask_homework import homework_bp
import os

# <---------------- Определение основного КОНСТАНТ и зависимостей ---------------->

application = Flask(__name__)

UPLOAD_FOLDER = "./uploads"
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

application.register_blueprint(exam_bp)
application.register_blueprint(test_bp)
application.register_blueprint(user_bp)
application.register_blueprint(quize_bp)
application.register_blueprint(groups_bp)
application.register_blueprint(students_bp)
application.register_blueprint(homework_bp)
application.register_blueprint(attandance_bp)


CORS(application, origins=["*"], methods=["GET", "POST",
     "PATCH", "DELETE", "OPTIONS"], supports_credentials=True)

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
