from flask import Flask, render_template_string, request, redirect, url_for, session, flash
from flask_session import Session

app = Flask(__name__)
app.secret_key = 'super-secret-key'
app.config["SESSION_PERMANENT"] = False
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Пользователи: username: {password, role}
users = {
    "admin": {"password": "qsc[;.", "role": "admin"},
    "curator": {"password": "123$%zxcv", "role": "curator"},
}

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

# Шаблон с боковым меню и кнопкой выхода, принимает список кнопок
base_template = """
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Приёмная комиссия РТУ МИРЭА</title>
    <style>
        body { margin:0; font-family: Arial, sans-serif; background:#eceff1; }
        .sidebar { width: 220px; background: #212121; color:white; height: 100vh; position: fixed; padding: 20px; box-sizing: border-box; }
        .sidebar h2 { margin-top: 0; margin-bottom: 20px; font-weight: bold; font-size: 19px;}
        .sidebar a { display: block; color: white; text-decoration:none; margin: 10px 0; font-size: 16px;}
        .sidebar a:hover { text-decoration: underline; }
        .content { margin-left: 240px; padding: 30px; background: #eceff1; min-height: 100vh; }
        .logout-btn { position: absolute; bottom: 20px; left: 20px; background: #444; border:none; color:white; padding: 10px 15px; cursor: pointer; font-size: 14px;}
        .logout-btn:hover { background: #666; }
        .header-box { background:white; padding:15px 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 25px; }
    </style>
</head>
<body>
    <div class="sidebar">
        <h2>Приёмная <br><b>комиссия<br>РТУ МИРЭА</b></h2>
        {% for name, endpoint in buttons %}
            <a href="{{ url_for(endpoint) }}">{{ name }}</a>
        {% endfor %}
        <form action="{{ url_for('logout') }}" method="post" style="margin-top:40px;">
            <button type="submit" class="logout-btn">Выход из аккаунта</button>
        </form>
    </div>
    <div class="content">
        <div class="header-box"><h3>{{ title }}</h3>{% if subtitle %}<div style="font-size: 12px; color: #666;">{{ subtitle }}</div>{% endif %}</div>
        {% with messages = get_flashed_messages(with_categories=true) %}
          {% if messages %}
            {% for category, message in messages %}
              <div style="color: {% if category == 'error' %}red{% else %}green{% endif %}; margin-bottom: 10px;">
                {{ message }}
              </div>
            {% endfor %}
          {% endif %}
        {% endwith %}
        {{ content|safe }}
    </div>
</body>
</html>
"""

login_template = """
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Авторизация</title>
    <style>
        body { font-family: Arial, sans-serif; background:#eceff1; display:flex; justify-content:center; align-items:center; height:100vh; }
        .login-box { background:white; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1); border-radius:5px; }
        label { display:block; margin-bottom: 8px; font-weight: bold; }
        input { width: 250px; margin-bottom: 15px; padding: 8px; border: 1px solid #ccc; border-radius: 3px; }
        button { padding: 10px 20px; background: #212121; color:white; border:none; cursor:pointer; border-radius: 3px; }
        button:hover { background: #444; }
        .error { color:red; margin-bottom: 10px; }
    </style>
</head>
<body>
    <div class="login-box">
        <h2>Вход в систему</h2>
        {% if error %}
            <div class="error">{{ error }}</div>
        {% endif %}
        <form method="post">
            <label for="username">Имя пользователя</label>
            <input type="text" name="username" id="username" autocomplete="off" required autofocus>
            <label for="password">Пароль</label>
            <input type="password" name="password" id="password" required>
            <button type="submit">Войти</button>
        </form>
    </div>
</body>
</html>
"""

def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "username" not in session:
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated_function

@app.route("/", methods=["GET"])
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
        user = users.get(username)

        if user and user["password"] == password:
            session["username"] = username
            session["role"] = user["role"]
            return redirect(url_for("dashboard"))
        else:
            return render_template_string(login_template, error="Неверное имя пользователя или пароль")
    return render_template_string(login_template, error=None)

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
    return render_template_string(base_template,
                                  buttons=buttons,
                                  title="Панель администрирования",
                                  subtitle="Управление заявками абитуриентов",
                                  content="<p>Добро пожаловать, {}!</p>".format(session["username"]))

# Создание нового пользователя (только для админа)
@app.route("/create_user", methods=["GET", "POST"])
@login_required
def create_user():
    if session.get("role") != "admin":
        flash("Доступ запрещён.", "error")
        return redirect(url_for("dashboard"))

    if request.method == "POST":
        new_username = request.form.get("username").strip()
        new_password = request.form.get("password")
        new_role = request.form.get("role")

        if not new_username or not new_password or new_role not in ["admin", "curator"]:
            flash("Заполните все поля правильно.", "error")
        elif new_username in users:
            flash("Пользователь с таким именем уже существует.", "error")
        else:
            users[new_username] = {"password": new_password, "role": new_role}
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
    return render_template_string(base_template,
                                  buttons=buttons,
                                  title="Создание нового пользователя",
                                  subtitle="",
                                  content=form_html)

# Остальные страницы - просто заглушки для примера
@app.route("/knowledge_base")
@login_required
def knowledge_base():
    buttons = menu_buttons.get(session.get("role"))
    return render_template_string(base_template, buttons=buttons, title="База знаний", subtitle="", content="<p>Здесь база знаний...</p>")

@app.route("/events")
@login_required
def events():
    buttons = menu_buttons.get(session.get("role"))
    return render_template_string(base_template, buttons=buttons, title="Мероприятия", subtitle="", content="<p>Информация о мероприятиях...</p>")

@app.route("/certificates")
@login_required
def certificates():
    if session.get("role") != "admin":
        flash("Доступ запрещён.", "error")
        return redirect(url_for("dashboard"))
    buttons = menu_buttons.get("admin")
    return render_template_string(base_template, buttons=buttons, title="Банк сертификатов", subtitle="", content="<p>Здесь банк сертификатов...</p>")

@app.route("/main_buttons")
@login_required
def main_buttons():
    if session.get("role") != "admin":
        flash("Доступ запрещён.", "error")
        return redirect(url_for("dashboard"))
    buttons = menu_buttons.get("admin")
    return render_template_string(base_template, buttons=buttons, title="Кнопки на главной странице", subtitle="", content="<p>Управление кнопками главной страницы...</p>")

if __name__ == "__main__":
    app.run(debug=True)
