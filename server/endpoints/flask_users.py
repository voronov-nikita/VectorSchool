#
# Вынесенные эндпоинты, касающихся базовых компонентов
# 
# Например эндпоинт /profile для получения информации 
# или /users для получения все пользователей на платформе
#

# расширяем пространство видимости для импортов
import sys
sys.path.append("../")

from database.models.user_models import get_user_by_login, verify_password, get_user_access_level_from_db, get_fighters, group_top_users, add_user, get_db
from werkzeug.security import generate_password_hash, check_password_hash
from flask import Blueprint, jsonify, request


user_bp = Blueprint('users', __name__)


@user_bp.route('/profile', methods=['GET'])
def get_profile():
    login = request.args.get('login')
    if not login:
        return jsonify({"error": "Логин обязателен"}), 400
    user = get_user_by_login(login)
    if not user:
        return jsonify({"error": "Пользователь не найден"}), 404
    return jsonify({"fio": user['fio'], "email": user['email']})


@user_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    login_ = data.get('login')
    print(f"THE LOGIN: {login_}")
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


@user_bp.route('/profile/<login>/rating', methods=['PUT'])
def update_user_rating(login):
    data = request.get_json()
    if not data or 'rating' not in data:
        return jsonify({'error': 'Отсутствует параметр rating'}), 400

    try:
        rating = float(data['rating'])
    except ValueError:
        return jsonify({'error': 'Некорректный формат rating'}), 400

    db = get_db()
    try:
        result = db.execute(
            'UPDATE users SET rating = ? WHERE login = ?', (rating, login))
        db.commit()
        if result.rowcount == 0:
            return jsonify({'error': 'Пользователь не найден'}), 404
        return jsonify({'message': 'Рейтинг обновлен'})
    except Exception as e:
        return jsonify({'error': f'Ошибка при обновлении рейтинга: {str(e)}'}), 500


@user_bp.route('/user/access_level', methods=['GET'])
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


@user_bp.route('/profile/<login>', methods=['GET'])
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


@user_bp.route('/users', methods=['GET'])
def fighters_api():
    search = request.args.get('search', '')
    sort = request.args.get('sort', 'fio')
    fighters = get_fighters(sort=sort, search=search)
    return jsonify({'fighters': fighters})


@user_bp.route('/users', methods=['POST'])
def create_user():
    data = request.get_json()
    required_fields = ['login', 'fio', 'password', 'access_level']
    missing = [
        field for field in required_fields if field not in data or not data[field]]
    if missing:
        return jsonify({'error': f'Отсутствуют обязательные поля: {", ".join(missing)}'}), 400

    # Проверяем уровень доступа на допустимые значения
    if data['access_level'] not in ['боец', 'комисар', 'админ', 'куратор']:
        return jsonify({'error': 'Неверный access_level'}), 400

    success, error = add_user(data)
    if success:
        return jsonify({'message': 'Пользователь добавлен'}), 201
    else:
        return jsonify({'error': error}), 400


@user_bp.route('/rating', methods=['GET'])
def rating_api():
    fighters = get_fighters(sort='rating')
    top_10 = group_top_users(fighters, max_line=3, top_n=10)
    return jsonify({'top_10': top_10})


@user_bp.route('/profile/<login>/change_password', methods=['POST'])
def change_password(login):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'Отсутствуют данные'}), 400

    old_password = data.get('old_password')
    new_password = data.get('new_password')

    if not old_password or not new_password:
        return jsonify({'error': 'Укажите старый и новый пароли'}), 400

    db = get_db()

    user = db.execute('SELECT * FROM users WHERE login = ?',
                      (login,)).fetchone()
    if not user:
        return jsonify({'error': 'Пользователь не найден'}), 404

    if not check_password_hash(user['password'], old_password):
        return jsonify({'error': 'Старый пароль неверный'}), 401

    new_hashed = generate_password_hash(new_password)

    try:
        db.execute('UPDATE users SET password = ? WHERE login = ?',
                   (new_hashed, login))
        db.commit()
        return jsonify({'message': 'Пароль успешно изменён'})
    except Exception as e:
        return jsonify({'error': f'Ошибка при обновлении пароля: {str(e)}'}), 500
