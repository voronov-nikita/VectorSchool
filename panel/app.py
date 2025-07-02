from flask import Flask, render_template, request, jsonify, redirect, url_for
import sqlite3
from datetime import datetime

app = Flask(__name__)
DATABASE = "../achievements.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/')
def index():
    """Главная страница админ-панели"""
    return render_template('index.html')

@app.route('/groups')
def groups():
    """Страница с группами"""
    conn = get_db_connection()
    groups = conn.execute('SELECT * FROM groups').fetchall()
    conn.close()
    return render_template('groups.html', groups=groups)

@app.route('/users')
def users():
    """Страница с пользователями"""
    conn = get_db_connection()
    users = conn.execute('SELECT * FROM users ORDER BY points DESC').fetchall()
    groups = conn.execute('SELECT * FROM groups WHERE is_active = 1').fetchall()
    conn.close()
    return render_template('users.html', users=users, groups=groups)

@app.route('/update_points', methods=['POST'])
def update_points():
    """Обновление баллов пользователя"""
    data = request.get_json()
    user_id = data['user_id']
    points = data['points']
    
    conn = get_db_connection()
    conn.execute('UPDATE users SET points = ? WHERE user_id = ?', (points, user_id))
    conn.commit()
    conn.close()
    
    return jsonify({'status': 'success'})

@app.route('/add_achievement', methods=['POST'])
def add_achievement():
    """Добавление достижения"""
    user_id = request.form['user_id']
    title = request.form['title']
    description = request.form['description']
    date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # В реальном приложении нужно обработать загрузку изображения
    image_path = "achievement.png"  # Заглушка
    
    conn = get_db_connection()
    conn.execute(
        'INSERT INTO achievements (user_id, title, description, image_path, date) VALUES (?, ?, ?, ?, ?)',
        (user_id, title, description, image_path, date)
    )
    conn.commit()
    conn.close()
    
    return redirect(url_for('users'))

if __name__ == '__main__':
    app.run(debug=True)