from database.db_connection import get_db


def create_homework_tables(db):
    db.execute('''
        CREATE TABLE IF NOT EXISTS homework_sections (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL
        )
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS homeworks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            section_id INTEGER,
            title TEXT NOT NULL,
            url TEXT NOT NULL,
            FOREIGN KEY(section_id) REFERENCES homework_sections(id)
        )
    ''')
