from flask import Flask, render_template_string
import asyncio
from ..bot.db import get_all_users

app = Flask(__name__)

TEMPLATE = '''
<h2>Пользователи</h2>
<table border=1>
<tr><th>ID</th><th>Username</th><th>Очки</th><th>Достижения</th></tr>
{% for user in users %}
<tr>
    <td>{{user[0]}}</td>
    <td>{{user[1]}}</td>
    <td>{{user[2]}}</td>
    <td>{{user[3]}}</td>
</tr>
{% endfor %}
</table>
'''

@app.route("/")
def users():
    users = asyncio.run(get_all_users())
    return render_template_string(TEMPLATE, users=users)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
