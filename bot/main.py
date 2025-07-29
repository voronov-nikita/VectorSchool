import asyncio
from aiogram import Bot, Dispatcher, types
from db import init_db, add_user, get_user, update_points, get_top_users
from apscheduler.schedulers.asyncio import AsyncIOScheduler

TOKEN = ""
bot = Bot(token=TOKEN)
dp = Dispatcher(bot)
scheduler = AsyncIOScheduler()

WELCOME_MSG = "Добро пожаловать в бота! Для регистрации нажмите кнопку ниже."

@dp.message_handler(commands=["start"])
async def start(msg: types.Message):
    await add_user(msg.from_user.id, msg.from_user.username or "")
    kb = types.InlineKeyboardMarkup().add(
        types.InlineKeyboardButton("Зарегистрироваться", callback_data="register")
    )
    await msg.answer(WELCOME_MSG, reply_markup=kb)

@dp.callback_query_handler(text="register")
async def register(cb: types.CallbackQuery):
    await add_user(cb.from_user.id, cb.from_user.username or "")
    await cb.message.answer("Вы успешно зарегистрированы!")

@dp.message_handler(commands=["profile"])
async def profile(msg: types.Message):
    user = await get_user(msg.from_user.id)
    if user:
        text = f"Ваши очки: {user[2]}\nДостижения: {user[3]}"
        await msg.answer(text)
    else:
        await msg.answer("Вы ещё не зарегистрированы. Используйте /start.")

@dp.message_handler(commands=["stats"])
async def stats(msg: types.Message):
    users = await get_top_users()
    text = "🏆 Топ 10 участников:\n"
    for i, user in enumerate(users, 1):
        text += f"{i}. {user[1]} — {user[2]} очков\n"
    await msg.answer(text)

async def send_reminders():
    users = await get_top_users(100)
    for user in users:
        # пример: напоминание, если не заходил N дней, можно добавить поле last_activity
        await bot.send_message(user[0], "Это напоминание!")

async def send_achievements():
    users = await get_top_users(100)
    for user in users:
        # простая логика: если набрал 100 очков и achievement не выдан
        if user[2] >= 100 and '100pts' not in user[3].split(','):
            await update_points(user[0], 0)  # опционально, не меняем очки
            # Добавить ачивку
            # (Напишите отдельный апдейт achieve)
            await bot.send_message(user[0], "Поздравляем! Вы получили достижение 100 очков!")
            # Здесь надо обновить достижения пользователя в БД

async def on_startup(_):
    await init_db()
    scheduler.start()
    scheduler.add_job(send_reminders, "interval", hours=24)
    scheduler.add_job(send_achievements, "interval", hours=1)

if __name__ == "__main__":
    dp.start_polling(dp)
