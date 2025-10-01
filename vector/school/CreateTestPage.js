import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    StyleSheet,
    ScrollView,
    Platform,
} from "react-native";

import { useInfoModal } from "../components/InfoModal";
import { URL } from "../config";

export const CreateTestScreen = ({ navigation }) => {
    const [name, setName] = useState("");
    const [maxScore, setMaxScore] = useState("");
    const [scorePerQuestion, setScorePerQuestion] = useState("");
    const [questions, setQuestions] = useState([]);
    const [showForm, setShowForm] = useState(false);

    const [questionText, setQuestionText] = useState("");
    const [answers, setAnswers] = useState([""]);
    const [correctIndexes, setCorrectIndexes] = useState([]);
    const [questionType, setQuestionType] = useState("single"); // "single", "multiple", "text"
    const [textAnswer, setTextAnswer] = useState("");

    // Файлы, прикреплённые к создаваемому вопросу
    const [attachedFiles, setAttachedFiles] = useState([]);
    const fileInputRefs = useRef([]);

    const showModal = useInfoModal();

    // Добавить вариант ответа
    function addAnswer() {
        setAnswers((a) => [...a, ""]);
    }

    // Изменить текст варианта ответа
    function setAnswerText(text, index) {
        const newAnswers = [...answers];
        newAnswers[index] = text;
        setAnswers(newAnswers);
    }

    // Выбор правильных ответов (чекбоксы)
    function toggleCorrectIndex(index) {
        if (questionType === "single") {
            setCorrectIndexes([index]);
        } else if (questionType === "multiple") {
            if (correctIndexes.includes(index)) {
                setCorrectIndexes(correctIndexes.filter((i) => i !== index));
            } else {
                setCorrectIndexes([...correctIndexes, index]);
            }
        }
    }

    // Открыть диалог выбора файла (web)
    const triggerFileSelect = (qIdx) => {
        if (fileInputRefs.current[qIdx]) {
            fileInputRefs.current[qIdx].click();
        }
    };

    // Обработка выбора файла
    const onFileChange = (event, qIdx) => {
        const file = event.target.files[0];
        if (!file) return;
        if (file.size > 20 * 1024 * 1024) {
            showModal("Файл не должен превышать 20 МБ");
            return;
        }
        const newFiles = [...attachedFiles];
        newFiles[qIdx] = file;
        setAttachedFiles(newFiles);
    };

    // Добавить вопрос в список
    function addQuestion() {
        if (!questionText.trim()) {
            showModal("Введите текст вопроса");
            return;
        }
        if (questionType === "text") {
            if (!textAnswer.trim()) {
                showModal("Введите правильный ответ");
                return;
            }
            const question = {
                text: questionText,
                type: "text",
                answers: [textAnswer],
                correctIndexes: [],
                file: attachedFiles[questions.length] || null,
            };
            setQuestions((qs) => [...qs, question]);
        } else {
            if (answers.some((a) => a.trim() === "")) {
                showModal("Все варианты ответа должны быть заполнены");
                return;
            }
            if (correctIndexes.length === 0) {
                showModal("Выберите хотя бы один правильный ответ");
                return;
            }
            const copiedAnswers = [...answers];
            const copiedCorrectIndexes = [...correctIndexes];
            const question = {
                text: questionText,
                answers: copiedAnswers,
                correctIndexes: copiedCorrectIndexes,
                type: questionType,
                file: attachedFiles[questions.length] || null,
            };
            setQuestions((qs) => [...qs, question]);
        }

        // Сброс полей формы и файла
        setQuestionText("");
        setAnswers([""]);
        setCorrectIndexes([]);
        setTextAnswer("");
        setQuestionType("single");
        setAttachedFiles((files) => {
            const newFiles = [...files];
            newFiles[questions.length] = null;
            return newFiles;
        });
        setShowForm(false);
    }

    // Сохранение теста на сервер (файлы нужно отправлять отдельно по серверной логике)
    function saveTest() {
        if (
            name.trim() === "" ||
            maxScore.trim() === "" ||
            scorePerQuestion.trim() === "" ||
            questions.length !==
                Math.floor(Number(maxScore) / Number(scorePerQuestion))
        ) {
            showModal(
                "Проверьте, что все обязательные поля заполнены и количество вопросов совпадает с рассчитанным."
            );
            return;
        }

        // Убираем из вопросов объекты file перед отправкой JSON
        const questionsToSend = questions.map(({ file, ...q }) => q);

        const payload = {
            name,
            max_score: Number(maxScore),
            score_per_question: Number(scorePerQuestion),
            questions: questionsToSend,
        };

        fetch(`${URL}/tests`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then((res) => res.json())
            .then(() => {
                // Тут можно добавить логику для загрузки файлов если нужно
                navigation.goBack();
            })
            .catch(() => showModal("Ошибка при сохранении теста"));
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Создание теста</Text>
                <TextInput
                    style={styles.input}
                    placeholder="* Название теста"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="* Максимальный балл"
                    value={maxScore}
                    onChangeText={setMaxScore}
                    keyboardType="numeric"
                />
                <TextInput
                    style={styles.input}
                    placeholder="* Балл за каждое задание"
                    value={scorePerQuestion}
                    onChangeText={setScorePerQuestion}
                    keyboardType="numeric"
                />

                <Text style={styles.subTitle}>Вопросы</Text>
                <FlatList
                    data={questions}
                    keyExtractor={(_, idx) => String(idx)}
                    renderItem={({ item, index }) => (
                        <View style={styles.questionCard}>
                            <Text style={styles.questionText}>
                                {index + 1}. {item.text}
                            </Text>
                            {item.type === "text" ? (
                                <Text
                                    style={{ color: "#eebbc3", marginLeft: 14 }}
                                >
                                    Правильный ответ: {item.answers[0]}
                                </Text>
                            ) : (
                                item.answers.map((ans, i) => (
                                    <Text
                                        key={i}
                                        style={{
                                            color: item.correctIndexes.includes(
                                                i
                                            )
                                                ? "#eebbc3"
                                                : "#ccc",
                                            fontWeight:
                                                item.correctIndexes.includes(i)
                                                    ? "700"
                                                    : "400",
                                            marginLeft: 14,
                                            marginVertical: 2,
                                        }}
                                    >
                                        - {ans}
                                    </Text>
                                ))
                            )}
                            <Text
                                style={{
                                    marginTop: 2,
                                    fontSize: 12,
                                    color: "#aaa",
                                }}
                            >
                                Тип:{" "}
                                {item.type === "single"
                                    ? "Одиночный выбор"
                                    : item.type === "multiple"
                                    ? "Множественный выбор"
                                    : "Текстовый ответ"}
                            </Text>
                            {item.file && (
                                <Text
                                    style={{
                                        marginTop: 6,
                                        fontStyle: "italic",
                                        color: "#555",
                                    }}
                                >
                                    Прикреплен файл: {item.file.name}
                                </Text>
                            )}
                        </View>
                    )}
                />

                {showForm ? (
                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder="Вопрос"
                            value={questionText}
                            onChangeText={setQuestionText}
                        />

                        {questionType === "text" ? (
                            <TextInput
                                style={[styles.input, { marginTop: 10 }]}
                                placeholder="Правильный ответ (текст)"
                                value={textAnswer}
                                onChangeText={setTextAnswer}
                            />
                        ) : (
                            <>
                                <View>
                                    {answers.map((ans, idx) => (
                                        <View
                                            key={idx}
                                            style={styles.answerRow}
                                        >
                                            <TouchableOpacity
                                                style={[
                                                    styles.checkbox,
                                                    correctIndexes.includes(
                                                        idx
                                                    ) && styles.checkedBox,
                                                ]}
                                                onPress={() =>
                                                    toggleCorrectIndex(idx)
                                                }
                                            />
                                            <TextInput
                                                style={[
                                                    styles.input,
                                                    { flex: 1, marginLeft: 10 },
                                                ]}
                                                placeholder={`Ответ ${idx + 1}`}
                                                value={ans}
                                                onChangeText={(text) =>
                                                    setAnswerText(text, idx)
                                                }
                                            />
                                        </View>
                                    ))}
                                </View>
                                <TouchableOpacity
                                    style={styles.addAnswerBtn}
                                    onPress={addAnswer}
                                >
                                    <Text style={styles.addAnswerText}>
                                        Добавить вариант ответа
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}

                        <Text style={styles.selectLabel}>Тип вопроса:</Text>
                        <View style={styles.radioButtons}>
                            <TouchableOpacity
                                style={[
                                    styles.radioOption,
                                    questionType === "single" &&
                                        styles.radioSelected,
                                ]}
                                onPress={() => setQuestionType("single")}
                            >
                                <Text
                                    style={[
                                        styles.radioText,
                                        questionType === "single" &&
                                            styles.radioTextSelected,
                                    ]}
                                >
                                    Одиночный
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.radioOption,
                                    questionType === "multiple" &&
                                        styles.radioSelected,
                                ]}
                                onPress={() => setQuestionType("multiple")}
                            >
                                <Text
                                    style={[
                                        styles.radioText,
                                        questionType === "multiple" &&
                                            styles.radioTextSelected,
                                    ]}
                                >
                                    Множественный
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.radioOption,
                                    questionType === "text" &&
                                        styles.radioSelected,
                                ]}
                                onPress={() => setQuestionType("text")}
                            >
                                <Text
                                    style={[
                                        styles.radioText,
                                        questionType === "text" &&
                                            styles.radioTextSelected,
                                    ]}
                                >
                                    Текстовый
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.attachButton, { marginTop: 10 }]}
                            onPress={() => triggerFileSelect(questions.length)}
                        >
                            <Text style={styles.attachButtonText}>
                                Прикрепить файл к вопросу (до 20 МБ)
                            </Text>
                        </TouchableOpacity>

                        {attachedFiles[questions.length] && (
                            <Text style={styles.fileName}>
                                {attachedFiles[questions.length].name}
                            </Text>
                        )}

                        {/* Скрытый input для web */}
                        {Platform.OS === "web" && (
                            <input
                                type="file"
                                style={{ display: "none" }}
                                ref={(el) =>
                                    (fileInputRefs.current[questions.length] =
                                        el)
                                }
                                onChange={(e) =>
                                    onFileChange(e, questions.length)
                                }
                            />
                        )}

                        <TouchableOpacity
                            style={styles.formButton}
                            onPress={addQuestion}
                        >
                            <Text>Добавить вопрос</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => setShowForm(true)}
                    >
                        <Text style={styles.addButtonText}>
                            Добавить вопрос
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>

            <TouchableOpacity style={styles.saveButton} onPress={saveTest}>
                <Text style={styles.saveButtonText}>Сохранить тест</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#232946",
        marginBottom: 20,
        marginLeft: 4,
    },
    input: {
        backgroundColor: "#f1f1f1",
        color: "#232946",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontSize: 16,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    questionCard: {
        backgroundColor: "#f1f1f1",
        padding: 14,
        borderRadius: 9,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#ddd",
    },
    questionText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#232946",
        marginBottom: 8,
    },
    form: {
        backgroundColor: "#f9f9f9",
        padding: 15,
        borderRadius: 12,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        marginBottom: "10%",
    },
    formButton: {
        marginTop: 14,
        backgroundColor: "#227be3",
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: "center",
    },
    saveButton: {
        backgroundColor: "#227be3",
        borderRadius: 20,
        paddingVertical: 15,
        marginHorizontal: 20,
        marginBottom: 22,
        alignItems: "center",
        justifyContent: "center",
        elevation: 4,
    },
    saveButtonText: {
        fontWeight: "700",
        fontSize: 18,
        color: "#fff",
    },
    addButton: {
        backgroundColor: "#f1f1f1",
        borderRadius: 20,
        paddingVertical: 14,
        marginTop: 8,
        marginBottom: 22,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ddd",
    },
    addButtonText: {
        color: "#555",
        fontWeight: "700",
        fontSize: 16,
    },
    answerRow: {
        justifyContent: "center",
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: "#227be3",
        borderRadius: 6,
    },
    checkedBox: {
        backgroundColor: "#227be3",
    },
    addAnswerBtn: {
        backgroundColor: "#e6e6e6",
        padding: 11,
        borderRadius: 11,
        marginBottom: 18,
        alignItems: "center",
    },
    addAnswerText: {
        color: "#227be3",
        fontWeight: "700",
        fontSize: 15,
    },
    selectLabel: {
        color: "#227be3",
        fontWeight: "700",
        fontSize: 16,
        marginBottom: 10,
    },
    radioButtons: {
        marginBottom: 11,
        flexDirection: "row",
    },
    radioOption: {
        borderWidth: 1,
        borderColor: "#227be3",
        paddingVertical: 9,
        paddingHorizontal: 28,
        marginRight: 12,
        marginTop: 14,
        borderRadius: 14,
    },
    radioSelected: {
        backgroundColor: "#227be3",
    },
    radioText: {
        color: "#227be3",
        fontWeight: "700",
        fontSize: 15,
    },
    radioTextSelected: {
        color: "#fff",
    },
    attachButton: {
        backgroundColor: "#ddd",
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignSelf: "flex-start",
    },
    attachButtonText: {
        color: "#333",
        fontSize: 14,
    },
    fileName: {
        marginTop: 6,
        fontSize: 13,
        fontStyle: "italic",
        color: "#555",
    },
});
