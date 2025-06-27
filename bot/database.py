import sqlite3
from typing import List, Dict, Optional, Tuple

class Database:
    def __init__(self, db_name: str):
        self.conn = sqlite3.connect(db_name)
        self.cursor = self.conn.cursor()
        self._create_tables()

    def _create_tables(self):
        """Создание таблиц в базе данных"""
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                last_name TEXT,
                points INTEGER DEFAULT 0
            )
        """)
        
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS achievements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER,
                title TEXT,
                description TEXT,
                image_path TEXT,
                date TEXT,
                FOREIGN KEY (user_id) REFERENCES users (user_id)
            )
        """)
        
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS groups (
                group_id INTEGER PRIMARY KEY,
                title TEXT,
                is_active INTEGER DEFAULT 1
            )
        """)
        
        self.conn.commit()

    def add_user(self, user_id: int, username: str, first_name: str, last_name: str):
        """Добавление нового пользователя"""
        self.cursor.execute(
            "INSERT OR IGNORE INTO users (user_id, username, first_name, last_name) VALUES (?, ?, ?, ?)",
            (user_id, username, first_name, last_name)
        )
        self.conn.commit()

    def get_user_points(self, user_id: int) -> int:
        """Получение баллов пользователя"""
        self.cursor.execute("SELECT points FROM users WHERE user_id = ?", (user_id,))
        result = self.cursor.fetchone()
        return result[0] if result else 0

    def update_user_points(self, user_id: int, points: int):
        """Обновление баллов пользователя"""
        self.cursor.execute(
            "UPDATE users SET points = ? WHERE user_id = ?",
            (points, user_id)
        )
        self.conn.commit()

    def add_achievement(self, user_id: int, title: str, description: str, image_path: str):
        """Добавление достижения"""
        from datetime import datetime
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        self.cursor.execute(
            "INSERT INTO achievements (user_id, title, description, image_path, date) VALUES (?, ?, ?, ?, ?)",
            (user_id, title, description, image_path, date)
        )
        self.conn.commit()

    def get_user_achievements(self, user_id: int) -> List[Dict]:
        """Получение всех достижений пользователя"""
        self.cursor.execute(
            "SELECT title, description, image_path, date FROM achievements WHERE user_id = ?",
            (user_id,)
        )
        achievements = self.cursor.fetchall()
        return [{
            "title": ach[0],
            "description": ach[1],
            "image_path": ach[2],
            "date": ach[3]
        } for ach in achievements]

    def add_group(self, group_id: int, title: str):
        """Добавление группы"""
        self.cursor.execute(
            "INSERT OR IGNORE INTO groups (group_id, title) VALUES (?, ?)",
            (group_id, title)
        )
        self.conn.commit()

    def get_active_groups(self) -> List[Dict]:
        """Получение активных групп"""
        self.cursor.execute("SELECT group_id, title FROM groups WHERE is_active = 1")
        return [{"group_id": row[0], "title": row[1]} for row in self.cursor.fetchall()]

    def close(self):
        """Закрытие соединения с базой данных"""
        self.conn.close()