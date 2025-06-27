from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, InlineKeyboardMarkup, InlineKeyboardButton

def get_main_keyboard() -> ReplyKeyboardMarkup:
    """Основная клавиатура"""
    keyboard = ReplyKeyboardMarkup(resize_keyboard=True)
    keyboard.add(KeyboardButton("Мои достижения 🏆"))
    keyboard.add(KeyboardButton("Мои баллы 💰"))
    keyboard.add(KeyboardButton("Помощь ❓"))
    return keyboard

def get_admin_keyboard() -> ReplyKeyboardMarkup:
    """Клавиатура администратора"""
    keyboard = ReplyKeyboardMarkup(resize_keyboard=True)
    keyboard.add(KeyboardButton("Мои достижения 🏆"))
    keyboard.add(KeyboardButton("Мои баллы 💰"))
    keyboard.add(KeyboardButton("Отправить изображение 🖼️"))
    keyboard.add(KeyboardButton("Помощь ❓"))
    return keyboard

def get_achievements_keyboard(achievements: list) -> InlineKeyboardMarkup:
    """Клавиатура с достижениями"""
    keyboard = InlineKeyboardMarkup()
    for ach in achievements:
        keyboard.add(InlineKeyboardButton(
            text=f"{ach['title']} - {ach['date']}",
            callback_data=f"ach_{ach['title']}"
        ))
    return keyboard