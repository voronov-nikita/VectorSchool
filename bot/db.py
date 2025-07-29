import aiosqlite

async def init_db():
    async with aiosqlite.connect('app.db') as db:
        await db.execute('''CREATE TABLE IF NOT EXISTS users (
            user_id INTEGER PRIMARY KEY,
            username TEXT,
            points INTEGER DEFAULT 0,
            achievements TEXT DEFAULT ''
        )''')
        await db.commit()


async def add_user(user_id:int, username:str):
    async with aiosqlite.connect('app.db') as db:
        await db.execute(
            "INSERT OR IGNORE INTO users (user_id, username) VALUES (?, ?)",
            (user_id, username)
        )
        await db.commit()


async def get_user(user_id:int):
    async with aiosqlite.connect('app.db') as db:
        async with db.execute("SELECT * FROM users WHERE user_id=?", (user_id,)) as cursor:
            return await cursor.fetchone()


async def update_points(user_id:int, points:int):
    async with aiosqlite.connect('app.db') as db:
        await db.execute("UPDATE users SET points=points + ? WHERE user_id=?", (points, user_id))
        await db.commit()


async def get_top_users(limit=10):
    async with aiosqlite.connect('app.db') as db:
        async with db.execute("SELECT * FROM users ORDER BY points DESC LIMIT ?", (limit,)) as cursor:
            return await cursor.fetchall()


async def get_all_users():
    async with aiosqlite.connect('app.db') as db:
        async with db.execute("SELECT * FROM users") as cursor:
            return await cursor.fetchall()
