import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from "react-native";

import { useInfoModal } from "../components/InfoModal";

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
    const showModal = useInfoModal();
    const [score, setScore] = useState(0);

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

    // Посчитать результат
    const calculateResult = () => {
        let total = 0;
        test.questions.forEach((q, i) => {
            const correctIndexes = q.correctIndexes || [];
            if (q.type === "text") {
                if (
                    (selectedAnswers[i] || "").trim().toLowerCase() ===
                    (q.answers[0] || "").trim().toLowerCase()
                ) {
                    total += test.score_per_question;
                }
            } else if (q.type === "single") {
                if (
                    selectedAnswers[i] !== null &&
                    correctIndexes.includes(selectedAnswers[i])
                ) {
                    total += test.score_per_question;
                }
            } else if (q.type === "multiple") {
                const selectedSet = new Set(selectedAnswers[i]);
                const correctSet = new Set(correctIndexes);
                if (
                    selectedSet.size === correctSet.size &&
                    [...selectedSet].every((x) => correctSet.has(x))
                ) {
                    total += test.score_per_question;
                }
            }
        });
        // запишем результат
        setScore(total);
        // покажем результат
        // showModal(`Ваш результат: ${score}`);
        // Отправим результат на сервер
        
        // вернем человека обратно
        navigation.goBack();
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
                </View>
            ))}
            <TouchableOpacity
                style={styles.saveButton}
                onPress={calculateResult}
            >
                <Text style={styles.saveButtonText}>Закончить попытку</Text>
            </TouchableOpacity>
            {/* {score !== null && (
                <View style={styles.resultBox}>
                    <Text style={styles.resultText}>
                        Ваш итог: {score}/{test.max_score}
                    </Text>
                </View>
            )} */}
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
    resultBox: {
        backgroundColor: "#227be3",
        borderRadius: 13,
        marginTop: 18,
        alignItems: "center",
        paddingVertical: 14,
        marginHorizontal: 40,
    },
    resultText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "700",
    },
});
