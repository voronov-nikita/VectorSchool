from flask import Flask, jsonify, request
from flask_cors import CORS
from database import *

app = Flask(__name__)
CORS(app)


@app.before_request
def before_request():
    get_db()

@app.teardown_appcontext
def teardown_db(exception):
    close_db()

# Инициализация базы при запуске
with app.app_context():
    init_db()

# ----- API ENDPOINTS -----

@app.route('/profile', methods=['GET'])
def get_profile():
    login = request.args.get('login')
    if not login:
        return jsonify({"error": "Логин обязателен"}), 400
    user = get_user_by_login(login)
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404
    return jsonify({"fio": user['fio'], "email": user['email']})

@app.route('/login', methods=['POST'])
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

@app.route('/profile/<login>', methods=['GET'])
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

@app.route('/users', methods=['GET'])
def fighters_api():
    search = request.args.get('search', '')
    sort = request.args.get('sort', 'fio')
    fighters = get_fighters(sort=sort, search=search)
    return jsonify({'fighters': fighters})

@app.route('/rating', methods=['GET'])
def rating_api():
    fighters = get_fighters(sort='rating')
    top_10 = group_top_users(fighters, max_line=3, top_n=10)
    return jsonify({'top_10': top_10})

# Дополнительные эндпоинты для групп, студентов, занятий и посещаемости

@app.route('/groups', methods=['GET'])
def api_get_groups():
    return jsonify(get_groups())

@app.route('/groups', methods=['POST'])
def api_add_group():
    data = request.get_json()
    ok, err = add_group(data['name'])
    if not ok:
        return jsonify({'error': err}), 400
    return jsonify({'result': 'Group added'})

@app.route('/groups/<int:group_id>', methods=['DELETE'])
def api_delete_group(group_id):
    delete_group(group_id)
    return jsonify({'result': 'Group deleted'})

@app.route('/students', methods=['GET'])
def api_get_students():
    group_id = request.args.get('group_id')
    students = get_students(group_id)
    return jsonify(students)

@app.route('/students', methods=['POST'])
def api_add_student():
    data = request.get_json()
    add_student(data['fio'], data['group_id'])
    return jsonify({'result': 'Student added'})

@app.route('/students/<int:student_id>', methods=['DELETE'])
def api_delete_student(student_id):
    delete_student(student_id)
    return jsonify({'result': 'Student deleted'})

@app.route('/lessons', methods=['GET'])
def api_get_lessons():
    group_id = request.args.get('group_id')
    lessons = get_lessons(group_id)
    return jsonify(lessons)

@app.route('/lessons', methods=['POST'])
def api_add_lesson():
    data = request.get_json()
    add_lesson(data['group_id'], data['date'], data['lesson_type'])
    return jsonify({'result': 'Lesson added'})

@app.route('/lessons/<int:lesson_id>', methods=['DELETE'])
def api_delete_lesson(lesson_id):
    delete_lesson(lesson_id)
    return jsonify({'result': 'Lesson deleted'})

@app.route('/attendance', methods=['POST'])
def api_set_attendance():
    data = request.get_json()
    set_attendance(data['student_id'], data['lesson_id'], data['status'])
    return jsonify({'result': 'Attendance updated'})

@app.route('/journal', methods=['GET'])
def api_get_journal():
    group_id = request.args.get('group_id')
    journal = get_group_journal(group_id)
    return jsonify(journal)

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
