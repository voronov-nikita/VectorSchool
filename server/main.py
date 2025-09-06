from flask import Flask, jsonify, request
from flask_cors import CORS
from database import *

app = Flask(__name__)
# разрешаем использование подтверждающих токенов CORS
CORS(app)

@app.before_request
def before_request():
    get_db()

@app.teardown_appcontext
def teardown_db(exception):
    close_db()

# Инициализация базы при старте
init_db()  


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
    print(user)
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

# @app.route('/profile/login', methods=['POST'])
# def post_profile():
#     data = request.json
#     login = data.get('login')
#     fio = data.get('fio')
#     email = data.get('email')

#     if not login or not fio:
#         return jsonify({"error": "Логин и ФИО обязательны"}), 400

#     success, error = update_profile(login, fio, email)
#     if success:
#         return jsonify({"message": "Профиль успешно обновлен"})
#     else:
#         return jsonify({"error": f"Ошибка обновления: {error}"}), 500
@app.route('/users', methods=['GET'])
def fighters_api():
    search = request.args.get('search', '')
    sort = request.args.get('sort', 'fio')
    fighters = get_fighters(sort=sort, search=search)
    fighters.__getindex__
    return jsonify({'fighters': fighters})

@app.route('/rating', methods=['GET'])
def rating_api():
    fighters = get_fighters(sort='rating')
    top_10 = group_top_users(fighters, max_line=3, top_n=10)
    return jsonify({'top_10': top_10})

if __name__ == '__main__':
    app.run(host="0.0.0.0", debug=True)
