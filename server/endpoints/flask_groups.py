#
# Вынесенные эндпоинты, касающихся групп пользователей
# Например эндпоинт /groups
#

# расширяем пространство имен
import sys
sys.path.append("../")

from flask import jsonify, request, Blueprint
from database.db_connection import get_db
from server.database.models.group_models import get_groups, add_group

groups_bp = Blueprint('groups', __name__)

# Дополнительные эндпоинты для групп, студентов, занятий и посещаемости
# Все это для школы Вектора


@groups_bp.route('/groups', methods=['GET'])
def api_get_groups():
    return jsonify(get_groups())


@groups_bp.route('/groups', methods=['POST'])
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


@groups_bp.route('/groups_with_users', methods=['GET'])
def get_groups_with_users():
    db = get_db()
    rows = db.execute('''
        SELECT g.name AS group_name, g.curator, u.login, u.fio
        FROM groups g
        LEFT JOIN users u ON u.group_name = g.name
        ORDER BY g.name, u.fio;
    ''').fetchall()

    groups = {}
    for row in rows:
        gn = row['group_name']
        if gn not in groups:
            groups[gn] = {
                'curator': row['curator'],
                'users': []
            }
        if row['login']:
            groups[gn]['users'].append(
                {'login': row['login'], 'fio': row['fio']})
    result = []
    for group_name, info in groups.items():
        result.append({
            'title': f"{group_name} (Куратор: {info['curator']})",
            'data': info['users']
        })

    return jsonify(result)