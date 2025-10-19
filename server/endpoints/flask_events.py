# 
# Модуль эндпоинтов для обработки запросов по меропритиям
# 
# 
# 

from flask import Blueprint, request, jsonify, make_response

from database.models.event_models import get_events, get_db, add_event
from database.models.user_models import get_user_by_login

# модульная модель приложения flask
event_bp = Blueprint('event_bp', __name__)


@event_bp.route('/events', methods=['GET'])
def api_get_events():
    date = request.args.get('date')
    events = get_events(date)
    return jsonify({'events': events})


@event_bp.route('/events/create', methods=['POST'])
def api_create_event():
    login = request.headers.get('login')
    data = request.json
    title = data.get('title')
    date = data.get('date')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    auditorium = data.get('auditorium', '-')

    if not all([title, date, start_time, end_time]):
        return jsonify({"error": "Все поля обязательны"}), 400

    add_event(title, date, start_time, end_time, auditorium, created_by=login)
    return jsonify({'result': 'ok'})


@event_bp.route('/events/<int:event_id>', methods=['DELETE'])
def delete_event(event_id):
    login = request.headers.get('login')
    user = get_user_by_login(login)
    if not user or user['access_level'] not in ('админ', 'куратор'):
        return jsonify({'error': 'Access denied'}), 403

    db = get_db()
    db.execute('DELETE FROM events WHERE id=?', (event_id,))
    db.commit()
    return jsonify({'result': 'deleted'})


@event_bp.route('/events/<int:event_id>', methods=['PATCH'])
def edit_event(event_id):
    login = request.headers.get('login')
    user = get_user_by_login(login)
    if not user or user['access_level'] not in ('админ', 'куратор'):
        return jsonify({'error': 'Access denied'}), 403

    data = request.json
    fields, values = [], []
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


@event_bp.route('/events/<int:event_id>', methods=['GET'])
def get_event_info(event_id):
    db = get_db()
    ev = db.execute(
        'SELECT id, title, date, start_time, end_time, created_by FROM events WHERE id=?',
        (event_id,)
    ).fetchone()
    if ev is None:
        return jsonify({'error': 'Событие не найдено'}), 404
    return jsonify(dict(ev))


@event_bp.route('/event/<int:event_id>/participants', methods=['GET'])
def get_event_participants(event_id):
    db = get_db()
    participant_logins = db.execute('SELECT login FROM users').fetchall()
    logins = [row['login'] for row in participant_logins]

    if not logins:
        return jsonify({'participants': []})

    placeholders = ','.join('?' for _ in logins)
    attendance_rows = db.execute(
        f'SELECT user_login, attended FROM event_attendance WHERE event_id = ? AND user_login IN ({placeholders})',
        (event_id, *logins)
    ).fetchall()

    attendance_dict = {row['user_login']: bool(row['attended']) for row in attendance_rows}

    participants = [
        {'login': login, 'attended': attendance_dict.get(login, False)}
        for login in logins
    ]

    return jsonify({'participants': participants})


@event_bp.route('/event/<int:event_id>/participants/<login>/attendance', methods=['POST', 'OPTIONS'])
def set_event_attendance(event_id, login):
    if request.method == 'OPTIONS':
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, login")
        return response

    status = request.json.get('attended')
    db = get_db()
    db.execute(
        'INSERT OR REPLACE INTO event_attendance (event_id, user_login, attended) VALUES (?, ?, ?)',
        (event_id, login, int(bool(status)))
    )

    db.commit()
    return jsonify({'result': 'ok'})
