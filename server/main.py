from flask import Flask, jsonify, request
from flask_cors import CORS
from database import *

application = Flask(__name__)
CORS(application)


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


@application.route('/students', methods=['GET'])
def api_get_students():
    group_id = request.args.get('group_id')
    students = get_students(group_id)
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


@application.route('/attendance', methods=['POST'])
def api_set_attendance():
    data = request.get_json()
    set_attendance(data['student_id'], data['lesson_id'], data['status'])
    return jsonify({'result': 'Attendance updated'})


@application.route('/journal', methods=['GET'])
def api_get_journal():
    group_id = request.args.get('group_id')
    journal = get_group_journal(group_id)
    return jsonify(journal)


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


if __name__ == '__main__':
    application.run(host='0.0.0.0', debug=True)
