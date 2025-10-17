import sys
sys.path.append("../")

from flask import request, jsonify, Blueprint
from database.models.quize_model import get_all_questions, add_question_to_db

quize_bp = Blueprint('quize', __name__)


@quize_bp.route("/game/questions", methods=["GET"])
def get_questions():
    questions = get_all_questions()
    return jsonify(questions)


@quize_bp.route("/game/questions", methods=["POST"])
def add_question():
    data = request.get_json()
    question = data.get("question")
    options = data.get("options")
    correct_answer = data.get("correct_answer")

    if not question or not options or not correct_answer:
        return jsonify({"message": "Не все поля заполнены"}), 400
    if len(options) != 4:
        return jsonify({"message": "Должно быть ровно 4 варианта ответа"}), 400
    if correct_answer not in options:
        return jsonify({"message": "Правильный ответ должен быть одним из вариантов"}), 400

    add_question_to_db(question, options, correct_answer)
    return jsonify({"message": "Вопрос добавлен"}), 201

