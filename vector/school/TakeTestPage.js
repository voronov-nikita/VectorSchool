import React, { useState, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Platform,
} from "react-native";

import { useInfoModal } from "../components/InfoModal";
import { URL } from "../config";

export const TakeTestScreen = ({ route, navigation }) => {
    const { test } = route.params;

    const [selectedAnswers, setSelectedAnswers] = useState(
        test.questions.map((q) => {
            if (q.type === "multiple") return [];
            if (q.type === "single") return null;
            if (q.type === "text") return "";
            return null;
        })
    );
    const [attachedFiles, setAttachedFiles] = useState(
        test.questions.map(() => null)
    );
    const fileInputRefs = useRef([]);

    const showModal = useInfoModal();

    const setAnswer = (val, qIdx, ansIdx = null) => {
        const newSelected = [...selectedAnswers];
        if (test.questions[qIdx].type === "multiple") {
            let arr = newSelected[qIdx] || [];
            if (arr.includes(ansIdx)) {
                arr = arr.filter((i) => i !== ansIdx);
            } else {
                arr = [...arr, ansIdx];
            }
            newSelected[qIdx] = arr;
        } else if (test.questions[qIdx].type === "single") {
            newSelected[qIdx] = ansIdx;
        } else if (test.questions[qIdx].type === "text") {
            newSelected[qIdx] = val;
        }
        setSelectedAnswers(newSelected);
    };

    // Открыть диалог выбора файла
    const triggerFileSelect = (qIdx) => {
        if (fileInputRefs.current[qIdx]) {
            fileInputRefs.current[qIdx].click();
        }
    };

    // Обработчик выбора файла для веб
    const onFileChange = (event, qIdx) => {
        const file = event.target.files[0];
        if (!file) {
            return;
        }
        if (file.size > 20 * 1024 * 1024) {
            showModal("Файл не должен превышать 20 МБ");
            return;
        }
        const newFiles = [...attachedFiles];
        newFiles[qIdx] = file;
        setAttachedFiles(newFiles);
    };

    const calculateResult = async () => {
        try {
            const formData = new FormData();
            formData.append("test_id", test.id);

            selectedAnswers.forEach((ans, idx) => {
                if (
                    Array.isArray(ans) ||
                    typeof ans === "number" ||
                    typeof ans === "string"
                ) {
                    formData.append(`answers[${idx}]`, JSON.stringify(ans));
                }
                if (attachedFiles[idx]) {
                    // В web файл приходит из input как File-объект
                    formData.append(`files[${idx}]`, attachedFiles[idx]);
                }
            });

            const response = await fetch(`${URL}/api/tests/submit`, {
                method: "POST",
                body: formData,
                // При web multipart/form-data Content-Type ставится автоматически, не указывайте явно!
                // headers: { "Content-Type": "multipart/form-data" }
            });

            if (response.ok) {
                showModal("Результаты успешно отправлены");
                navigation.goBack();
            } else {
                const errorData = await response.json();
                showModal(
                    "Ошибка при отправке результатов: " +
                        (errorData.error || "Неизвестная ошибка")
                );
            }
        } catch (error) {
            showModal("Ошибка при отправке: " + error.message);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>{test.name}</Text>
            <Text style={styles.subtitle}>
                Максимальный балл: {test.max_score}
            </Text>
            {test.questions.map((q, idx) => (
                <View key={idx} style={styles.questionCard}>
                    <Text style={styles.questionText}>
                        {idx + 1}. {q.text}
                    </Text>
                    {q.type === "text" ? (
                        <TextInput
                            style={styles.input}
                            placeholder="Введите ответ"
                            value={selectedAnswers[idx]}
                            onChangeText={(val) => setAnswer(val, idx)}
                        />
                    ) : (
                        q.answers.map((ans, aIdx) => (
                            <TouchableOpacity
                                key={aIdx}
                                style={styles.answerRow}
                                onPress={() => setAnswer(null, idx, aIdx)}
                            >
                                <View
                                    style={[
                                        styles.checkbox,
                                        (q.type === "multiple"
                                            ? (
                                                  selectedAnswers[idx] || []
                                              ).includes(aIdx)
                                            : selectedAnswers[idx] === aIdx) &&
                                            styles.checkedBox,
                                    ]}
                                />
                                <Text
                                    style={[
                                        styles.answerText,
                                        (q.type === "multiple"
                                            ? (
                                                  selectedAnswers[idx] || []
                                              ).includes(aIdx)
                                            : selectedAnswers[idx] ===
                                              aIdx) && { fontWeight: "700" },
                                    ]}
                                >
                                    {ans}
                                </Text>
                            </TouchableOpacity>
                        ))
                    )}
                    <TouchableOpacity
                        onPress={() => triggerFileSelect(idx)}
                        style={styles.attachButton}
                    >
                        <Text style={styles.attachButtonText}>
                            Прикрепить файл (до 20 МБ)
                        </Text>
                    </TouchableOpacity>

                    {/* Скрытый input для выбора файла (только для web) */}
                    {Platform.OS === "web" && (
                        <input
                            type="file"
                            style={{ display: "none" }}
                            ref={(el) => (fileInputRefs.current[idx] = el)}
                            onChange={(e) => onFileChange(e, idx)}
                        />
                    )}

                    {attachedFiles[idx] && (
                        <Text style={styles.fileName}>
                            {attachedFiles[idx].name}
                        </Text>
                    )}
                </View>
            ))}
            <TouchableOpacity
                style={styles.saveButton}
                onPress={calculateResult}
            >
                <Text style={styles.saveButtonText}>Закончить попытку</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 0,
    },
    title: {
        fontSize: 19,
        fontWeight: "700",
        color: "#232946",
        marginTop: 20,
        marginLeft: 15,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#666",
        marginBottom: 10,
        marginLeft: 15,
    },
    questionCard: {
        backgroundColor: "#f3f3f3",
        borderRadius: 8,
        marginHorizontal: 12,
        marginTop: 20,
        padding: 16,
        minHeight: 60,
    },
    questionText: {
        color: "#232946",
        fontWeight: "600",
        fontSize: 16,
        marginBottom: 9,
    },
    input: {
        backgroundColor: "#fff",
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 8,
        color: "#232946",
        fontSize: 16,
        borderColor: "#eee",
        borderWidth: 1,
        marginTop: 3,
    },
    answerRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 11,
    },
    checkbox: {
        width: 21,
        height: 21,
        borderWidth: 2,
        borderColor: "#227be3",
        borderRadius: 6,
        marginRight: 10,
    },
    checkedBox: {
        backgroundColor: "#227be3",
    },
    answerText: {
        color: "#222",
        fontSize: 16,
    },
    attachButton: {
        marginTop: 8,
        backgroundColor: "#ddd",
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 6,
        alignSelf: "flex-start",
    },
    attachButtonText: {
        color: "#333",
        fontSize: 14,
    },
    fileName: {
        marginTop: 4,
        fontSize: 12,
        color: "#555",
        fontStyle: "italic",
    },
    saveButton: {
        backgroundColor: "#227be3",
        borderRadius: 13,
        alignItems: "center",
        paddingVertical: 13,
        marginTop: 18,
        marginHorizontal: 40,
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 17,
    },
});
