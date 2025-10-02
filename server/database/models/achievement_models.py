from database.db_connection import get_db



def create_achievement_tables(db):
    db.execute('''
        CREATE TABLE IF NOT EXISTS achievements_catalog (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            filename TEXT NOT NULL UNIQUE
        )
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS user_achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_login TEXT NOT NULL,
            achievement_name TEXT NOT NULL,
            date_obtained TEXT,
            FOREIGN KEY(user_login) REFERENCES users(login)
        )
    ''')


def get_user_achievements(login):
    db = get_db()
    
    achievements = db.execute('''
        SELECT achievement_name, date_obtained
        FROM user_achievements
        WHERE user_login = ?
        ORDER BY date_obtained DESC
    ''', (login,)).fetchall()
    return [{
        'name': ach['achievement_name'],
        'date': ach['date_obtained'],
        'url': f"/achievements_images/{ach['achievement_name']}"
    } for ach in achievements]
