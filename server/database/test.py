from server.database import add_user
from main import application

def add_test_users():
    test_users = [
        {
            'fio': 'Воронов Никита Рустамович',
            'login': 'voronovnr',
            'password': 'qwerty1234',
            'telegram': '@voronovnr',
            'email': 'voronovnr_1@mail.ru',
            'phone': '1234567890',
            'group_name': 'Группа 1',
            'birth_date': '1990-01-01',
            'access_level': 'боец',
            'rating': 28.5,
            'attendance': 14,
            'achievements': '1) Победа на олимпиаде\n2) Лучший студент года'
        },
  {
    "fio": "Иванов Сергей Петрович",
    "login": "ivanovsp",
    "password": "pass12345",
    "telegram": "@ivanovsp",
    "email": "ivanovsp@mail.ru",
    "phone": "1234567890",
    "group_name": "Группа 1",
    "birth_date": "1991-02-03",
    "access_level": "боец",
    "rating": 28.5,
    "attendance": 14,
    "achievements": "1) Победа на олимпиаде\n2) Лучший студент года"
  },
  {
    "fio": "Сидоров Алексей Викторович",
    "login": "sidorovav",
    "password": "alex2025",
    "telegram": "@sidorovav",
    "email": "sidorovav@mail.ru",
    "phone": "1234567890",
    "group_name": "Группа 1",
    "birth_date": "1992-05-14",
    "access_level": "боец",
    "rating": 28.5,
    "attendance": 14,
    "achievements": "1) Победа на олимпиаде\n2) Лучший студент года"
  },
  {
    "fio": "Михайлов Денис Андреевич",
    "login": "mikhailovda",
    "password": "denis4321",
    "telegram": "@mikhailovda",
    "email": "mikhailovda@mail.ru",
    "phone": "1234567890",
    "group_name": "Группа 1",
    "birth_date": "1993-07-21",
    "access_level": "боец",
    "rating": 28.5,
    "attendance": 14,
    "achievements": "1) Победа на олимпиаде\n2) Лучший студент года"
  },
  {
    "fio": "Кузнецов Дмитрий Игоревич",
    "login": "kuznetsovdi",
    "password": "dmitry000",
    "telegram": "@kuznetsovdi",
    "email": "kuznetsovdi@mail.ru",
    "phone": "1234567890",
    "group_name": "Группа 1",
    "birth_date": "1994-09-10",
    "access_level": "боец",
    "rating": 28.5,
    "attendance": 14,
    "achievements": "1) Победа на олимпиаде\n2) Лучший студент года"
  },
  {
    "fio": "Андреев Николай Сергеевич",
    "login": "andreevns",
    "password": "nick555",
    "telegram": "@andreevns",
    "email": "andreevns@mail.ru",
    "phone": "1234567890",
    "group_name": "Группа 1",
    "birth_date": "1995-11-29",
    "access_level": "боец",
    "rating": 28.5,
    "attendance": 14,
    "achievements": "1) Победа на олимпиаде\n2) Лучший студент года"
  },
  {
    "fio": "Павлов Артём Олегович",
    "login": "pavlovao",
    "password": "artem987",
    "telegram": "@pavlovao",
    "email": "pavlovao@mail.ru",
    "phone": "1234567890",
    "group_name": "Группа 1",
    "birth_date": "1996-04-15",
    "access_level": "боец",
    "rating": 28.5,
    "attendance": 14,
    "achievements": "1) Победа на олимпиаде\n2) Лучший студент года"
  },
  {
    "fio": "Фёдоров Виктор Максимович",
    "login": "fedorovvm",
    "password": "viktor333",
    "telegram": "@fedorovvm",
    "email": "fedorovvm@mail.ru",
    "phone": "1234567890",
    "group_name": "Группа 1",
    "birth_date": "1997-06-17",
    "access_level": "боец",
    "rating": 28.5,
    "attendance": 14,
    "achievements": "1) Победа на олимпиаде\n2) Лучший студент года"
  },
  {
    "fio": "Яковлев Роман Владимирович",
    "login": "yakovlevrv",
    "password": "roman2021",
    "telegram": "@yakovlevrv",
    "email": "yakovlevrv@mail.ru",
    "phone": "1234567890",
    "group_name": "Группа 1",
    "birth_date": "1998-08-08",
    "access_level": "боец",
    "rating": 28.5,
    "attendance": 14,
    "achievements": "1) Победа на олимпиаде\n2) Лучший студент года"
  },
  {
    "fio": "Горбунов Константин Романович",
    "login": "gorbunovkr",
    "password": "kostya123",
    "telegram": "@gorbunovkr",
    "email": "gorbunovkr@mail.ru",
    "phone": "1234567890",
    "group_name": "Группа 1",
    "birth_date": "1999-12-01",
    "access_level": "боец",
    "rating": 28.5,
    "attendance": 14,
    "achievements": "1) Победа на олимпиаде\n2) Лучший студент года"
  },
  {
    "fio": "Киселёв Антон Евгеньевич",
    "login": "kiselevae",
    "password": "anton444",
    "telegram": "@kiselevae",
    "email": "kiselevae@mail.ru",
    "phone": "1234567890",
    "group_name": "Группа 1",
    "birth_date": "2000-03-25",
    "access_level": "боец",
    "rating": 28.5,
    "attendance": 14,
    "achievements": "1) Победа на олимпиаде\n2) Лучший студент года"
  }

    ]
    for user in test_users:
        success, error = add_user(user)
        if not success:
            print(f"Ошибка при добавлении {user['login']}: {error}")
        else:
            print(f"Пользователь {user['login']} добавлен успешно.")

def add_admin():
  admin = {
    "fio": "Администратор",
    "login": "admin",
    "password": "96a9HJkT!",
    "telegram": "-",
    "email": "-",
    "phone": "00000000",
    "group_name": "Группа 1",
    "birth_date": "2000-03-25",
    "access_level": "админ",
    "rating": 0,
    "attendance": 0,
    "achievements": "**"
  }
  
  success, error = add_user(admin)
  if not success:
      print(f"Ошибка при добавлении {admin['login']}: {error}")
  else:
      print(f"Пользователь {admin['login']} добавлен успешно.")
  return 

import sqlite3

DATABASE = "users.db"

def fill_demo_data():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row

    # Добавить группу
    db.execute("INSERT INTO groups (name) VALUES ('КББО-31-24')")

    group_id = db.execute("SELECT id FROM groups WHERE name = 'КББО-31-24'").fetchone()["id"]

    # Добавить студентов
    students = [
        ("Абаджян А. Г.", group_id),
        ("Бальхинов Б. М.", group_id),
        ("Васильева К. Р.", group_id)
    ]
    for fio, gid in students:
        db.execute("INSERT INTO students (fio, group_id) VALUES (?, ?)", (fio, gid))

    stud_ids = [r["id"] for r in db.execute("SELECT id FROM students WHERE group_id = ?", (group_id,)).fetchall()]

    # Добавить занятия
    lessons = [
        (group_id, "01.09", "ПР"),
        (group_id, "08.09", "ПР"),
        (group_id, "11.09", "ЛК")
    ]
    for gid, date, typ in lessons:
        db.execute("INSERT INTO lessons (group_id, date, lesson_type) VALUES (?, ?, ?)", (gid, date, typ))

    lesson_ids = [r["id"] for r in db.execute("SELECT id FROM lessons WHERE group_id = ?", (group_id,)).fetchall()]

    # Добавить посещаемость: студент 1 и 2 — '+', студент 3 — 'Н'
    for i, stud_id in enumerate(stud_ids):
        for j, lesson_id in enumerate(lesson_ids):
            status = '+' if i != 2 else 'Н'
            db.execute(
                "INSERT INTO attendance (student_id, lesson_id, status) VALUES (?, ?, ?)",
                (stud_id, lesson_id, status)
            )

    db.commit()
    db.close()
    print("Demo data inserted.")

def insert_test_achievements():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    # Тестовые ачивки для каталога (название, описание, имя файла)
    test_achievements = [
        ("Fast Learner", "Признание за быстрое обучение", "fast_learner.png"),
        ("Coding Master", "Высокие навыки программирования", "coding_master.png"),
        ("Bug Hunter", "Обнаружение и исправление багов", "bug_hunter.png")
    ]

    # Вставляем в achievements_catalog
    for name, desc, filename in test_achievements:
        try:
            cursor.execute(
                "INSERT INTO achievements_catalog (name, description, filename) VALUES (?, ?, ?)",
                (name, desc, filename)
            )
        except sqlite3.IntegrityError:
            # Если запись уже существует - игнорируем
            pass

    # Тестовые связи достижений с пользователями (логин, имя ачивки, дата)
    test_user_achievements = [
        ("user1", "Fast Learner", "2025-01-10"),
        ("user1", "Coding Master", "2025-02-15"),
        ("user2", "Bug Hunter", "2025-03-20"),
        ("user3", "Fast Learner", "2025-04-05"),
    ]

    for user_login, ach_name, date_obtained in test_user_achievements:
        try:
            cursor.execute(
                "INSERT INTO user_achievements (user_login, achievement_name, date_obtained) VALUES (?, ?, ?)",
                (user_login, ach_name, date_obtained)
            )
        except sqlite3.IntegrityError:
            pass

    conn.commit()
    conn.close()
    
    
# Запуск добавления тестовых пользователей
if __name__ == "__main__":
    with application.app_context():
      add_test_users()
      add_admin()
      fill_demo_data()
      insert_test_achievements()
