from os import getenv
from dotenv import load_dotenv

load_dotenv()

BOT_TOKEN = getenv("BOT_TOKEN")
ADMIN_IDS = list(map(int, getenv("ADMIN_IDS", "").split(',')))
DATABASE_NAME = "achievements.db"