from flask import Flask, render_template

import sys

sys.path.append("../")

from main import application

# Пример данных для таблицы
CERTIFICATES = [
    {
        "number": "2025-42-00138",
        "type": "Сертификат о прохождении дневного лагеря в ДТ \"Альтаир\"",
        "fio": "Полянов Дмитрий Мстиславович",
        "school": "ГБОУ школа № 2070",
        "date": "17.07.2025"
    },
    # (добавьте остальные записи аналогично)
]

@application.route("/")
def index():
    return render_template("index.html", certificates=CERTIFICATES)
