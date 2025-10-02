#
# Вынесенные эндпоинты, касающихся групп пользователей
# Например эндпоинт /groups
#

# расширяем пространство имен
import sys
sys.path.append("../")

from flask import jsonify, request, Blueprint
from database import get_groups, add_group, get_db

attandance_bp = Blueprint('attendance', __name__)

# Дополнительные эндпоинты для групп, студентов, занятий и посещаемости
# Все это для школы Вектора
