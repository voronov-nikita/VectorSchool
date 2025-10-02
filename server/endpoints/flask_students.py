#
# Вынесенные эндпоинты, касающихся групп пользователей
# Например эндпоинт /groups
#

# расширяем пространство имен
import sys
sys.path.append("../")

from flask import jsonify, request, Blueprint
from database.db_connection import get_db
from server.database.models.student_models import *

students_bp = Blueprint('students', __name__)


@students_bp.route('/students', methods=['GET'])
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


@students_bp.route('/students', methods=['POST'])
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
