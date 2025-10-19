#
# Модуль обработки эндпоинтов для журнала отметки пользователей
# 
# Журнал на платформе Вектора - это система отметки тех людей, 
# кто пришел на созданное мероприятие, чтобы иметь какой-то учет
# 
# К примеру на Школе Вектора 2025 использовалась система для оценки участников 
# и их активность, чтобы это повлияло на их баллы на экзамене
#

# расширяем пространство видимости нашего файла
import sys
sys.path.append("../")

from database.models.attendance_models import set_attendance
from flask import jsonify, request, Blueprint
from database.db_connection import get_db


attandance_bp = Blueprint('attendance', __name__)

# Дополнительные эндпоинты для групп, студентов, занятий и посещаемости
# Все это для школы Вектора


@attandance_bp.route('/attendance/bulk', methods=['POST'])
def save_attendance_bulk():
    data = request.get_json()
    lesson_id = data.get('lesson_id')
    # [{student_id: ..., status: '+' или 'Н'}]
    attendances = data.get('attendances')
    if not lesson_id or not isinstance(attendances, list):
        return jsonify({'error': 'Недостаточно данных'}), 400
    for rec in attendances:
        set_attendance(rec['student_id'], lesson_id, rec['status'])
    return jsonify({'result': 'ok'})
