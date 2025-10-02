import sqlite3
from flask import g

DATABASE = "./users.db"


def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DATABASE)
        g.db.row_factory = sqlite3.Row
    return g.db


def close_db():
    db = g.pop('db', None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    # Создание таблиц будет вынесено в отдельные модули
    # Здесь только вызов функций создания таблиц из подключенных модулей
    from database.models.user_models import create_user_tables
    from database.models.group_models import create_group_tables
    from database.models.attendance_models import create_attendance_tables
    from database.models.test_models import create_test_tables
    from database.models.achievement_models import create_achievement_tables
    from database.models.event_models import create_event_tables

    create_user_tables(db)
    create_group_tables(db)
    create_attendance_tables(db)
    create_test_tables(db)
    create_achievement_tables(db)
    create_event_tables(db)

    db.commit()
