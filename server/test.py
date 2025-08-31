from database import add_user

def add_test_users():
    users = [
        {
            "fio": "Иванов Иван Иванович",
            "login": "ivanov_ii",
            "password": "password1",
            "telegram": "@ivanov_ii",
            "email": "ivanov@example.com",
            "phone": "+79001234567",
            "group_name": "БПИ234",
            "birth_date": "1998-03-12",
            "access_level": "боец"
        },
        {
            "fio": "Петров Пётр Петрович",
            "login": "petrov_pp",
            "password": "myp@ssw0rd",
            "telegram": "@petrov_pp",
            "email": "petrov@example.com",
            "phone": "+79007654321",
            "group_name": None,
            "birth_date": None,
            "access_level": "админ"
        },
        {
            "fio": "Смирнова Дарья Сергеевна",
            "login": "smirnova_ds",
            "password": "dariapass",
            "telegram": "@smirnova_ds",
            "email": None,
            "phone": None,
            "group_name": "ФИТ-101",
            "birth_date": "2000-07-22",
            "access_level": "куратор"
        }
    ]

    for user in users:
        success, error = add_user(user)
        if success:
            print(f"Пользователь {user['fio']} успешно добавлен.")
        else:
            print(f"Ошибка при добавлении {user['fio']}: {error}")

# Запуск добавления тестовых пользователей
if __name__ == "__main__":
    add_test_users()
