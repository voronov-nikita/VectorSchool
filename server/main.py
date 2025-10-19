#
# Основной файл серверной логики.
#
# Изначально, при разработке, шла речь про модульность всего сервера
# чтобы можно было быстро и безопасно для сервера отключать некоторые функции
# На данный момент базовые файлы имеют общий вид структуры, 
# где каждый файл отвечает исключительно за свои эндпоинты, но они могут
# затрагивать другие модули, 
# чтобы не прописывать двойных запросов и не использовать идин и тот же код 
# по несколько раз
# 

from flask import Flask, jsonify, request
from flask_cors import CORS

from database.models.achievement_models import *
from database.models.attendance_models import *
from database.models.event_models import *
from database.models.group_models import *
from database.models.test_models import *
from database.models.user_models import *
from database.db_connection import *

from endpoints.flask_attendance import attandance_bp
from endpoints.flask_students import students_bp
from endpoints.flask_homework import homework_bp
from endpoints.flask_groups import groups_bp
from endpoints.flask_events import event_bp
from endpoints.flask_quize import quize_bp
from endpoints.flask_exams import exam_bp
from endpoints.flask_users import user_bp
from endpoints.flask_test import test_bp

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
