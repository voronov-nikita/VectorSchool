import os
from aiogram import Bot, Dispatcher, types, F
from aiogram.fsm.storage.memory import MemoryStorage
from aiogram.fsm.state import State, StatesGroup
from aiogram.filters import Command
from aiogram.types import Message, CallbackQuery
from aiogram.utils.keyboard import ReplyKeyboardBuilder, InlineKeyboardBuilder

from config import BOT_TOKEN, ADMIN_IDS, DATABASE_NAME
from database import Database
# from keyboards import get_main_keyboard, get_admin_keyboard, get_achievements_keyboard

# Инициализация бота
bot = Bot(token=BOT_TOKEN)
storage = MemoryStorage()
dp = Dispatcher(storage=storage)
db = Database(DATABASE_NAME)

class AdminStates(StatesGroup):
    waiting_for_image = State()
    waiting_for_points = State()

def get_main_keyboard():
    """Основная клавиатура"""
    builder = ReplyKeyboardBuilder()
    builder.button(text="Мои достижения 🏆")
    builder.button(text="Мои баллы 💰")
    builder.button(text="Помощь ❓")
    return builder.as_markup(resize_keyboard=True)

def get_admin_keyboard():
    """Клавиатура администратора"""
    builder = ReplyKeyboardBuilder()
    builder.button(text="Мои достижения 🏆")
    builder.button(text="Мои баллы 💰")
    builder.button(text="Отправить изображение 🖼️")
    builder.button(text="Помощь ❓")
    return builder.as_markup(resize_keyboard=True)

def get_achievements_keyboard(achievements):
    """Клавиатура с достижениями"""
    builder = InlineKeyboardBuilder()
    for ach in achievements:
        builder.button(
            text=f"{ach['title']} - {ach['date']}",
            callback_data=f"ach_{ach['title']}"
        )
    builder.adjust(1)
    return builder.as_markup()

@dp.message(Command('start'))
async def cmd_start(message: Message):
    """Обработка команды /start"""
    user = message.from_user
    db.add_user(user.id, user.username, user.first_name, user.last_name)
    
    welcome_text = (
        f"Привет, {user.first_name}! 👋\n\n"
        "Я бот для учета достижений и баллов. Вот что я умею:\n"
        "🏆 - Показывать твои достижения\n"
        "💰 - Показывать твои баллы\n"
        "❓ - Помощь по командам\n\n"
        "Выбери действие из меню ниже:"
    )
    
    if user.id in ADMIN_IDS:
        await message.answer(welcome_text, reply_markup=get_admin_keyboard())
    else:
        await message.answer(welcome_text, reply_markup=get_main_keyboard())

@dp.message(Command('help'))
async def cmd_help(message: Message):
    """Обработка команды /help"""
    help_text = (
        "📌 Доступные команды:\n\n"
        "/start - Начать работу с ботом\n"
        "/achievement - Показать все достижения\n"
        "/info - Показать количество баллов\n"
        "/help - Получить справку\n\n"
        "Также ты можешь использовать кнопки меню для навигации."
    )
    await message.answer(help_text)

@dp.message(Command('achievement'))
async def cmd_achievement(message: Message):
    """Обработка команды /achievement"""
    achievements = db.get_user_achievements(message.from_user.id)
    
    if not achievements:
        await message.answer("У вас пока нет достижений 😢")
        return
    
    keyboard = get_achievements_keyboard(achievements)
    await message.answer("Ваши достижения:", reply_markup=keyboard)

@dp.message(Command('info'))
async def cmd_info(message: Message):
    """Обработка команды /info"""
    points = db.get_user_points(message.from_user.id)
    await message.answer(f"🎯 У вас {points} баллов!")

@dp.message(F.text == "Мои достижения 🏆")
async def btn_achievements(message: Message):
    """Кнопка 'Мои достижения'"""
    await cmd_achievement(message)

@dp.message(F.text == "Мои баллы 💰")
async def btn_points(message: Message):
    """Кнопка 'Мои баллы'"""
    await cmd_info(message)

@dp.message(F.text == "Помощь ❓")
async def btn_help(message: Message):
    """Кнопка 'Помощь'"""
    await cmd_help(message)

@dp.message(F.text == "Отправить изображение 🖼️", F.from_user.id.in_(ADMIN_IDS))
async def btn_send_image(message: Message, state):
    """Кнопка 'Отправить изображение' (только для админов)"""
    await state.set_state(AdminStates.waiting_for_image)
    await message.answer("Отправьте изображение, которое хотите разослать всем пользователям:")

@dp.message(AdminStates.waiting_for_image, F.photo)
async def process_image(message: Message, state):
    """Обработка изображения от админа"""
    photo = message.photo[-1]
    file_id = photo.file_id
    
    # Рассылаем всем пользователям
    users = db.cursor.execute("SELECT user_id FROM users").fetchall()
    
    for user in users:
        try:
            await bot.send_photo(user[0], file_id, caption="Новое изображение от администратора!")
        except Exception as e:
            print(f"Не удалось отправить сообщение пользователю {user[0]}: {e}")
    
    await state.clear()
    await message.answer("Изображение успешно отправлено всем пользователям!", 
                         reply_markup=get_admin_keyboard())

@dp.callback_query(F.data.startswith('ach_'))
async def process_achievement_callback(callback: CallbackQuery):
    """Обработка нажатия на достижение"""
    achievement_title = callback.data[4:]
    achievements = db.get_user_achievements(callback.from_user.id)
    
    for ach in achievements:
        if ach['title'] == achievement_title:
            response = (
                f"🏆 <b>{ach['title']}</b>\n\n"
                f"📝 <i>{ach['description']}</i>\n\n"
                f"📅 Дата получения: {ach['date']}"
            )
            await callback.message.answer(
                response,
                parse_mode="HTML"
            )
            break
    
    await callback.answer()

async def main():
    # Создаем папку для базы данных, если ее нет
    os.makedirs(os.path.dirname(DATABASE_NAME), exist_ok=True)
    
    # Запуск бота
    await dp.start_polling(bot)

if __name__ == '__main__':
    import asyncio
    asyncio.run(main())