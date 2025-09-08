from database import add_user

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

# Запуск добавления тестовых пользователей
if __name__ == "__main__":
    # add_test_users()
    add_admin()
