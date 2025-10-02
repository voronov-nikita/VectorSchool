from database.db_connection import get_db


def create_event_tables(db):
    db.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            date TEXT NOT NULL,
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            auditorium TEXT DEFAULT '-',
            created_by TEXT NOT NULL,
            FOREIGN KEY(created_by) REFERENCES users(login)
        )
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS event_participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER,
            user_login TEXT,
            FOREIGN KEY(event_id) REFERENCES events(id),
            FOREIGN KEY(user_login) REFERENCES users(login)
        )
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS event_attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER,
            user_login TEXT,
            attended INTEGER DEFAULT 0,
            UNIQUE(event_id, user_login),
            FOREIGN KEY(event_id) REFERENCES events(id),
            FOREIGN KEY(user_login) REFERENCES users(login)
        );
    ''')


def add_event(title, date, start_time, end_time, auditorium, created_by):
    db = get_db()

    db.execute('''
        INSERT INTO events (title, date, start_time, end_time, auditorium, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (title, date, start_time, end_time, auditorium, created_by))
    db.commit()
    return True


def get_events(date=None):
    db = get_db()

    if date:
        rows = db.execute(
            'SELECT * FROM events WHERE date = ? ORDER BY start_time', (date,)).fetchall()
    else:
        rows = db.execute(
            'SELECT * FROM events ORDER BY date, start_time').fetchall()
    return [dict(r) for r in rows]


def edit_event(event_id, title=None, start_time=None, end_time=None, auditorium=None, date=None):
    db = get_db()

    fields = []
    values = []

    if title is not None:
        fields.append("title=?")
        values.append(title)
    if start_time is not None:
        fields.append("start_time=?")
        values.append(start_time)
    if end_time is not None:
        fields.append("end_time=?")
        values.append(end_time)
    if auditorium is not None:
        fields.append("auditorium=?")
        values.append(auditorium)
    if date is not None:
        fields.append("date=?")
        values.append(date)

    values.append(event_id)

    if fields:
        db.execute(f'UPDATE events SET {", ".join(fields)} WHERE id=?', values)
        db.commit()
        return True
    return False
