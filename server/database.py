from database.db_connection import get_db, close_db, init_db
from server.database.models.user_models import add_user
from database.models.group_models import add_group
from database.models.attendance_models import set_attendance
from database.models.test_models import create_test_tables
from database.models.achievement_models import create_achievement_tables
from database.models.event_models import create_event_tables


if __name__=="__main__":
    init_db()
