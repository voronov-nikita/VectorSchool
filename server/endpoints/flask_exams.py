from flask import Blueprint, request, jsonify
from database.db_connection import get_db
import datetime

exam_bp = Blueprint('exams', __name__)

# Получение списка экзаменов


@exam_bp.route('/exams', methods=['GET'])
def get_exams():
    db = get_db()
    exams = db.execute(
        'SELECT * FROM exams ORDER BY date, start_time').fetchall()
    result = []
    for exam in exams:
        signup = db.execute(
            'SELECT student_login FROM exam_signups WHERE exam_id = ?', (exam['id'],)).fetchone()
        result.append({
            'id': exam['id'],
            'place': exam['place'],
            'date': exam['date'],
            'start': exam['start_time'],
            'end': exam['end_time'],
            'booked_student': signup['student_login'] if signup else None
        })
    return jsonify(result)


@exam_bp.route('/exam/<int:exam_id>/signup', methods=['POST'])
def signup_exam(exam_id):
    login = request.headers.get('login')
    signup = request.get_json().get('signup', True)
    db = get_db()

    if signup:
        # Проверка на занятость слота
        exists = db.execute(
            'SELECT 1 FROM exam_signups WHERE exam_id = ?', (exam_id,)).fetchone()
        if exists:
            return jsonify({'error': 'Slot already booked'}), 409
        # Получаем ФИО пользователя по логину
        user = db.execute(
            'SELECT fio FROM users WHERE login = ?', (login,)).fetchone()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        now = datetime.datetime.now().isoformat()
        db.execute('INSERT INTO exam_signups (exam_id, student_login, signup_time) VALUES (?, ?, ?)',
                   (exam_id, user['fio'], now))
        db.commit()
        return jsonify({'result': 'signed up'})
    else:
        # Отмена записи по ФИО
        user = db.execute(
            'SELECT fio FROM users WHERE login = ?', (login,)).fetchone()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        db.execute(
            'DELETE FROM exam_signups WHERE exam_id = ? AND student_login = ?', (exam_id, user['fio']))
        db.commit()
        return jsonify({'result': 'signup removed'})


@exam_bp.route('/exams', methods=['POST'])
def add_exam():
    data = request.get_json()
    db = get_db()
    db.execute('INSERT INTO exams (place, date, start_time, end_time) VALUES (?, ?, ?, ?)',
               (data['place'], data['date'], data['start'], data['end']))
    db.commit()
    return jsonify({'result': 'ok'})
