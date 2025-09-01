from database import add_user

def add_test_users():
    test_users = [
        {
            'fio': 'Иванов Иван Иванович',
            'login': 'ivanov_ii',
            'password': 'password123',
            'telegram': '@ivanov',
            'email': 'ivanov@example.com',
            'phone': '1234567890',
            'group_name': 'Группа 1',
            'birth_date': '1990-01-01',
            'access_level': 'боец',
            'rating': 28.5,
            'attendance': 14,
            'achievements': '1) Победа на олимпиаде\n2) Лучший студент года'
        },
        {
            'fio': 'Петрова Мария Сергеевна',
            'login': 'petrova_ms',
            'password': 'securepass',
            'telegram': '@petrova',
            'email': 'petrova@example.com',
            'phone': '0987654321',
            'group_name': 'Группа 2',
            'birth_date': '1995-05-12',
            'access_level': 'комисар',
            'rating': 30,
            'attendance': 16,
            'achievements': '1) Отличник учёбы\n2) Лидер студенческого совета'
        }
    ]
    for user in test_users:
        success, error = add_user(user)
        if not success:
            print(f"Ошибка при добавлении {user['login']}: {error}")
        else:
            print(f"Пользователь {user['login']} добавлен успешно.")

# Запуск добавления тестовых пользователей
if __name__ == "__main__":
    add_test_users()
