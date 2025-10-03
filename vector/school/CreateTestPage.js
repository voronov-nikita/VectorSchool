import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Platform,
} from "react-native";

import { QuestionFormCard } from "./QuestionFormCard"; // компонент вопроса из предыдущего ответа
import { URL } from "../config";

export const CreateTestScreen = ({ navigation }) => {
    const [name, setName] = useState("");
    const [maxScore, setMaxScore] = useState("");
    const [scorePerQuestion, setScorePerQuestion] = useState("");
    const [questions, setQuestions] = useState([
        {
            text: "",
            type: "single",
            options: [""],
            required: false,
            score: 0,
            file: null,
        },
    ]);

    // Управление вопросами
    const handleChangeQuestion = (index, q) => {
        setQuestions((prev) => prev.map((item, i) => (i === index ? q : item)));
    };

    const handleDeleteQuestion = (index) => {
        setQuestions((prev) => prev.filter((_, i) => i !== index));
    };

    // Прикрепление файлов к вопросу (только React Native Web)
    const fileInputRefs = useRef([]);

    const triggerFileSelect = (index) => {
        if (fileInputRefs.current[index]) {
            fileInputRefs.current[index].click();
        }
    };

    const onFileChange = (event, index) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) {
            alert("Файл превышает 20МБ");
            return;
        }
        handleChangeQuestion(index, { ...questions[index], file });
    };

    // Добавить новый вопрос пустой
    const addQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                text: "",
                type: "single",
                options: [""],
                required: false,
                score: 0,
                file: null,
            },
        ]);
    };

    // Проверка и сохранение теста
    const saveTest = async () => {
        if (!name.trim()) {
            alert("Название теста обязательно");
            return;
        }
        const maxScoreNum = Number(maxScore);
        const scorePerQNum = Number(scorePerQuestion);
        if (
            !maxScoreNum ||
            !scorePerQNum ||
            maxScoreNum < 1 ||
            scorePerQNum < 1
        ) {
            alert(
                "Максимальные баллы и баллы за вопрос должны быть положительными числами"
            );
            return;
        }
        if (questions.length === 0) {
            alert("Добавьте хотя бы один вопрос");
            return;
        }
        const sumScores = questions.reduce((acc, q) => acc + (q.score || 0), 0);
        if (sumScores !== maxScoreNum) {
            alert(
                "Сумма баллов вопросов должна быть равна максимальному баллу"
            );
            return;
        }

        // Формируем вопрос с нужным форматом для сервера
        const questionsToSend = questions.map((q) => ({
            text: q.text,
            type: q.type,
            answers: q.options || (q.type === "text" ? [""] : []),
            correctIndexes: [], // Можно расширить, добавить управление correctIndexes
            score: q.score || 0,
        }));

        // Отправляем основной тест без файлов
        try {
            const resp = await fetch(`${URL}/tests`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    max_score: maxScoreNum,
                    score_per_question: scorePerQNum,
                    questions: questionsToSend,
                }),
            });
            const data = await resp.json();
            if (!resp.ok || !data.id)
                throw new Error(data.error || "Ошибка сохранения теста");

            // Отправляем файлы для каждого вопроса, если есть
            const formData = new FormData();
            formData.append("test_id", data.id);

            questions.forEach((q, idx) => {
                if (q.file) {
                    formData.append(`files[${idx}]`, q.file, q.file.name);
                }
            });

            const fileResp = await fetch(`${URL}/tests/files_upload`, {
                method: "POST",
                body: formData,
            });
            const fileData = await fileResp.json();
            if (!fileResp.ok)
                throw new Error(fileData.error || "Ошибка загрузки файлов");

            alert("Тест успешно сохранён");
            navigation.goBack();
        } catch (e) {
            alert("Ошибка: " + e.message);
        }
    };

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: "#181A22" }}>
            <ScrollView>
                <Text
                    style={{ fontSize: 28, color: "#eebbc3", marginBottom: 12 }}
                >
                    Создание теста
                </Text>
                <TextInput
                    placeholder="Название теста"
                    placeholderTextColor="#666"
                    value={name}
                    onChangeText={setName}
                    style={{
                        backgroundColor: "#222436",
                        color: "#fff",
                        padding: 10,
                        fontSize: 18,
                        borderRadius: 6,
                        marginBottom: 10,
                    }}
                />
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 10,
                    }}
                >
                    <TextInput
                        placeholder="Максимальный балл"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        value={maxScore}
                        onChangeText={setMaxScore}
                        style={{
                            flex: 1,
                            backgroundColor: "#222436",
                            color: "#fff",
                            padding: 10,
                            fontSize: 18,
                            borderRadius: 6,
                            marginRight: 6,
                        }}
                    />
                    <TextInput
                        placeholder="Балл за вопрос"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                        value={scorePerQuestion}
                        onChangeText={setScorePerQuestion}
                        style={{
                            flex: 1,
                            backgroundColor: "#222436",
                            color: "#fff",
                            padding: 10,
                            fontSize: 18,
                            borderRadius: 6,
                            marginLeft: 6,
                        }}
                    />
                </View>

                {/* Список вопросов */}
                {questions.map((q, i) => (
                    <View key={i} style={{ marginBottom: 16 }}>
                        <QuestionFormCard
                            question={q}
                            index={i}
                            onChange={handleChangeQuestion}
                            onDelete={() => handleDeleteQuestion(i)}
                            onAttachFile={triggerFileSelect}
                        />
                        {/* Скрытый input для загрузки файла */}
                        {Platform.OS === "web" && (
                            <input
                                type="file"
                                style={{ display: "none" }}
                                ref={(el) => (fileInputRefs.current[i] = el)}
                                onChange={(e) => onFileChange(e, i)}
                            />
                        )}
                        <TextInput
                            placeholder="Баллы за вопрос"
                            placeholderTextColor="#666"
                            keyboardType="numeric"
                            value={q.score ? q.score.toString() : ""}
                            style={{
                                backgroundColor: "#222436",
                                color: "#fff",
                                padding: 8,
                                fontSize: 16,
                                borderRadius: 6,
                                marginTop: 6,
                            }}
                            onChangeText={(text) => {
                                const val = parseInt(text) || 0;
                                handleChangeQuestion(i, { ...q, score: val });
                            }}
                        />
                    </View>
                ))}

                <TouchableOpacity
                    onPress={addQuestion}
                    style={{
                        backgroundColor: "#eebbc3",
                        alignItems: "center",
                        padding: 14,
                        borderRadius: 10,
                        marginBottom: 24,
                    }}
                >
                    <Text
                        style={{
                            fontWeight: "700",
                            fontSize: 16,
                            color: "#181A22",
                        }}
                    >
                        Добавить вопрос
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={saveTest}
                    style={{
                        backgroundColor: "tomato",
                        padding: 16,
                        borderRadius: 10,
                        alignItems: "center",
                        marginBottom: 36,
                    }}
                >
                    <Text
                        style={{
                            color: "white",
                            fontSize: 18,
                            fontWeight: "700",
                        }}
                    >
                        Сохранить тест
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
};
