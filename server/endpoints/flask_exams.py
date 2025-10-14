from flask import Blueprint, request, jsonify
from database.db_connection import get_db
import datetime

exam_bp = Blueprint('exams', __name__)


@exam_bp.route('/exams', methods=['GET'])
def get_exams():
    db = get_db()
    exams = db.execute(
        'SELECT * FROM exams ORDER BY date, start_time').fetchall()
    result = []
    for exam in exams:
        booked_students = db.execute(
            'SELECT student_login FROM exam_signups WHERE exam_id = ?', (
                exam['id'],)
        ).fetchall()
        booked_logins = [row['student_login'] for row in booked_students]
        result.append({
            'id': exam['id'],
            'place': exam['place'],
            'date': exam['date'],
            'start': exam['start_time'],
            'end': exam['end_time'],
            'capacity': exam['capacity'],
            'booked_count': len(booked_logins),
            'available_seats': exam['capacity'] - len(booked_logins),
            'booked_students': booked_logins,
        })
    return jsonify(result)


@exam_bp.route('/exam/<int:exam_id>/signup', methods=['POST'])
def signup_exam(exam_id):
    login = request.headers.get('login')
    signup = request.get_json().get('signup', True)
    db = get_db()

    # Проверяем, существует ли пользователь
    user = db.execute(
        'SELECT login FROM users WHERE login = ?', (login,)).fetchone()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if signup:
        # Проверка на занятость слота пользователя на этот экзамен
        exists = db.execute(
            'SELECT 1 FROM exam_signups WHERE exam_id = ? AND student_login = ?', (exam_id, login)).fetchone()
        if exists:
            return jsonify({'error': 'Вы уже зарегистрированы на экзамен'}), 409

        # Проверка на общую заполненность экзамена
        booked_count = db.execute(
            'SELECT COUNT(*) AS count FROM exam_signups WHERE exam_id = ?', (exam_id,)).fetchone()['count']
        capacity = db.execute(
            'SELECT capacity FROM exams WHERE id = ?', (exam_id,)).fetchone()
        if not capacity:
            return jsonify({'error': 'Exam not found'}), 404
        if booked_count >= capacity['capacity']:
            return jsonify({'error': 'No available seats'}), 409

        now = datetime.datetime.now().isoformat()
        db.execute('INSERT INTO exam_signups (exam_id, student_login, signup_time) VALUES (?, ?, ?)',
                   (exam_id, login, now))
        db.commit()
        return jsonify({'result': 'signed up'})

    else:
        # Отмена записи по логину пользователя
        db.execute(
            'DELETE FROM exam_signups WHERE exam_id = ? AND student_login = ?', (exam_id, login))
        db.commit()
        return jsonify({'result': 'signup removed'})


@exam_bp.route('/exams', methods=['POST'])
def add_exam():
    data = request.get_json()
    db = get_db()

    # Проверка на наличие capacity, по умолчанию если не указано - 1
    capacity = data.get('capacity', 1)
    db.execute('INSERT INTO exams (place, date, start_time, end_time, capacity) VALUES (?, ?, ?, ?, ?)',
               (data['place'], data['date'], data['start'], data['end'], capacity))
    db.commit()
    return jsonify({'result': 'ok'})
