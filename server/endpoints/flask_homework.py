from flask import Blueprint, jsonify, request
from database.db_connection import get_db

homework_bp = Blueprint('homework', __name__)


@homework_bp.route('/homework_sections', methods=['GET'])
def get_homework_sections():
    db = get_db()
    rows = db.execute('SELECT * FROM homework_sections').fetchall()
    return jsonify([dict(r) for r in rows])


@homework_bp.route('/homework_sections', methods=['POST'])
def add_homework_section():
    data = request.get_json()
    db = get_db()
    db.execute('INSERT INTO homework_sections (title) VALUES (?)',
               (data['title'],))
    db.commit()
    return jsonify({'result': 'ok'})


@homework_bp.route('/homeworks', methods=['GET'])
def get_homeworks():
    section_id = request.args.get('section_id')
    db = get_db()
    rows = db.execute(
        'SELECT * FROM homeworks WHERE section_id = ?', (section_id,)).fetchall()
    return jsonify([dict(r) for r in rows])


@homework_bp.route('/homeworks', methods=['POST'])
def add_homework():
    data = request.get_json()
    db = get_db()
    db.execute('INSERT INTO homeworks (section_id, title, url) VALUES (?, ?, ?)',
               (data['section_id'], data['title'], data['url']))
    db.commit()
    return jsonify({'result': 'ok'})


@homework_bp.route('/homework_sections/<int:section_id>', methods=['DELETE'])
def delete_homework_section(section_id):
    db = get_db()
    db.execute('DELETE FROM homework_sections WHERE id = ?', (section_id,))
    db.execute('DELETE FROM homeworks WHERE section_id = ?', (section_id,))
    db.commit()
    return jsonify({'result': 'deleted'})


@homework_bp.route('/homeworks/<int:hw_id>', methods=['DELETE'])
def delete_homework(hw_id):
    db = get_db()
    db.execute('DELETE FROM homeworks WHERE id = ?', (hw_id,))
    db.commit()
    return jsonify({'result': 'deleted'})
