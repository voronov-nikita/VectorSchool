from flask import Flask, render_template, render_template_string, request, redirect, url_for, session, flash
from flask_session import Session
from models import db, User
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
import os

app = Flask(__name__)
app.secret_key = 'super-secret-key-Vector2025'
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# SQLite, файл базы - local SQLite в папке проекта
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///users.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)

# Меню кнопок для ролей
menu_buttons = {
    "admin": [
        ("База знаний", "knowledge_base"),
        ("Мероприятия", "events"),
        ("Банк сертификатов", "certificates"),
        ("Кнопки на главной странице", "main_buttons"),
        ("Создать пользователя", "create_user"),
    ],
    "curator": [
        ("База знаний", "knowledge_base"),
        ("Мероприятия", "events"),
    ],
}

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "username" not in session:
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function

@app.before_request
def create_tables():
    db.create_all()

    # Инициализация пользователями, только если их еще нет
    if not User.query.filter_by(username='admin').first():
        admin = User(username='admin', password=generate_password_hash('qsc[;.'), role='admin')
        curator = User(username='curator', password=generate_password_hash('123$%zxcv'), role='curator')
        db.session.add(admin)
        db.session.add(curator)
        db.session.commit()

@app.route("/")
def index():
    if "username" in session:
        return redirect(url_for("dashboard"))
    else:
        return redirect(url_for("login"))

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form.get("username").strip()
        password = request.form.get("password")
        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password, password):
            session["username"] = user.username
            session["role"] = user.role
            return redirect(url_for("dashboard"))
        else:
            return render_template("login.html", error="Неверное имя пользователя или пароль")
    return render_template("login.html", error=None)

@app.route("/logout", methods=["POST"])
@login_required
def logout():
    session.clear()
    return redirect(url_for("login"))

@app.route("/dashboard")
@login_required
def dashboard():
    role = session.get("role")
    buttons = menu_buttons.get(role, [])
    content = f"<p>Добро пожаловать, {session.get('username')}!</p>"
    return render_template("base.html",
                           buttons=buttons,
                           title="Панель администрирования",
                           subtitle="Управление заявками абитуриентов",
                           content=content,
                           current_user=session.get("username"))

@app.route("/create_user", methods=["GET", "POST"])
@login_required
def create_user():
    if session.get("role") != "admin":
        flash("Доступ запрещён.", "error")
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        new_username = request.form.get("username", "").strip()
        new_password = request.form.get("password", "")
        new_role = request.form.get("role", "")

        if not new_username or not new_password or new_role not in ["admin", "curator"]:
            flash("Заполните все поля правильно.", "error")
        elif User.query.filter_by(username=new_username).first():
            flash("Пользователь с таким именем уже существует.", "error")
        else:
            hashed_password = generate_password_hash(new_password)
            new_user = User(username=new_username, password=hashed_password, role=new_role)
            db.session.add(new_user)
            db.session.commit()
            flash(f"Пользователь '{new_username}' успешно создан!", "success")

    buttons = menu_buttons.get("admin")
    form_html = """
    <form method="post" style="max-width: 350px;">
        <label for="username">Имя пользователя</label>
        <input type="text" name="username" id="username" required autocomplete="off" style="width:100%; padding:8px; margin-bottom:10px;"/>
        <label for="password">Пароль</label>
        <input type="password" name="password" id="password" required style="width:100%; padding:8px; margin-bottom:10px;"/>
        <label for="role">Роль</label>
        <select name="role" id="role" required style="width:100%; padding:8px; margin-bottom:15px;">
            <option value="curator">Curator</option>
            <option value="admin">Admin</option>
        </select>
        <button type="submit" style="padding: 10px 15px; cursor:pointer;">Создать пользователя</button>
    </form>
    """
    return render_template("base.html",
                           buttons=buttons,
                           title="Создание нового пользователя",
                           subtitle="",
                           content=form_html,
                           current_user=session.get("username"))

@app.route("/knowledge_base")
@login_required
def knowledge_base():
    buttons = menu_buttons.get(session.get("role"))
    content = "<p>Здесь база знаний...</p>"
    return render_template("base.html",
                           buttons=buttons,
                           title="База знаний",
                           subtitle="",
                           content=content,
                           current_user=session.get("username"))

@app.route("/events")
@login_required
def events():
    buttons = menu_buttons.get(session.get("role"))
    content = "<p>Информация о мероприятиях...</p>"
    return render_template("base.html",
                           buttons=buttons,
                           title="Мероприятия",
                           subtitle="",
                           content=content,
                           current_user=session.get("username"))

@app.route("/certificates")
@login_required
def certificates():
    if session.get("role") != "admin":
        flash("Доступ запрещён.", "error")
        return redirect(url_for("dashboard"))
    buttons = menu_buttons.get("admin")
    content = "<p>Здесь банк сертификатов...</p>"
    return render_template("base.html",
                           buttons=buttons,
                           title="Банк сертификатов",
                           subtitle="",
                           content=content,
                           current_user=session.get("username"))

@app.route("/main_buttons")
@login_required
def main_buttons():
    if session.get("role") != "admin":
        flash("Доступ запрещён.", "error")
        return redirect(url_for("dashboard"))
    buttons = menu_buttons.get("admin")
    content = "<p>Управление кнопками главной страницы...</p>"
    return render_template("base.html",
                           buttons=buttons,
                           title="Кнопки на главной странице",
                           subtitle="",
                           content=content,
                           current_user=session.get("username"))

if __name__ == "__main__":
    # При запуске убедитесь, что SQLite файл создан и таблицы есть
    app.run(debug=True)
