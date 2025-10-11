import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

import { URL } from "../config";

const BUTTON_COLOR_DEFAULT = "#e4e4e4";
const BUTTON_COLOR_CORRECT = "#4CD964";
const BUTTON_COLOR_WRONG = "#FF3B30";

export const GameScreen = () => {
    const navigation = useNavigation();

    const [isStartGame, setStartGame] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [index, setIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5);
    const [selectedIdx, setSelectedIdx] = useState(null);
    const [buttonColors, setButtonColors] = useState([
        BUTTON_COLOR_DEFAULT,
        BUTTON_COLOR_DEFAULT,
        BUTTON_COLOR_DEFAULT,
        BUTTON_COLOR_DEFAULT,
    ]);
    const [score, setScore] = useState(0);
    const [showModal, setShowModal] = useState(false);

    useFocusEffect(() => {
        setStartGame(true);
    });

    useEffect(() => {
        fetchQuestions();
    }, [isStartGame]);

    useEffect(() => {
        setIndex(0);
        setScore(0);
        setTimeLeft(5);
        setShowModal(false);
        setSelectedIdx(null);
        setButtonColors([
            BUTTON_COLOR_DEFAULT,
            BUTTON_COLOR_DEFAULT,
            BUTTON_COLOR_DEFAULT,
            BUTTON_COLOR_DEFAULT,
        ]);
        fetchQuestions();
    }, []);

    useEffect(() => {
        if (isStartGame) {
            if (questions.length === 0 || showModal) return;

            if (timeLeft === 0) {
                setShowModal(true);
            }
            const timer = setTimeout(
                () => setTimeLeft(timeLeft > 0 ? timeLeft - 1 : 0),
                1000
            );
            return () => clearTimeout(timer);
        }
    }, [timeLeft, questions, showModal]);

    const fetchQuestions = async () => {
        try {
            const res = await fetch(`${URL}/game/questions`);
            const json = await res.json();
            setQuestions(json);
        } catch (e) {
            // обработка ошибки
        }
    };

    const handleAnswer = (idx) => {
        if (selectedIdx !== null) return; // предотвратить многократный клик
        setSelectedIdx(idx);

        const correctIdx = questions[index].options.findIndex(
            (opt) => opt === questions[index].correct_answer
        );
        if (idx === correctIdx) {
            let newColors = [...buttonColors];
            newColors[idx] = BUTTON_COLOR_CORRECT;
            setButtonColors(newColors);

            setScore(score + 1);
            nextQuestion();
        } else {
            let newColors = [...buttonColors];
            newColors[idx] = BUTTON_COLOR_WRONG;
            setButtonColors(newColors);
            setShowModal(true);
        }
    };

    const nextQuestion = () => {
        if (isStartGame) {
            setSelectedIdx(null);
            setButtonColors([
                BUTTON_COLOR_DEFAULT,
                BUTTON_COLOR_DEFAULT,
                BUTTON_COLOR_DEFAULT,
                BUTTON_COLOR_DEFAULT,
            ]);
            setTimeLeft(5);

            if (index < questions.length - 1) {
                setIndex(index + 1);
            } else {
                setShowModal(true);
            }
        }
    };

    const restartGame = () => {
        setStartGame(true);
        setIndex(0);
        setScore(0);
        setTimeLeft(5);
        setShowModal(false);
        setSelectedIdx(null);
        setButtonColors([
            BUTTON_COLOR_DEFAULT,
            BUTTON_COLOR_DEFAULT,
            BUTTON_COLOR_DEFAULT,
            BUTTON_COLOR_DEFAULT,
        ]);
        fetchQuestions();
    };

    const exitQuize = () => {
        setStartGame(false);
        setIndex(0);
        setScore(0);
        setTimeLeft(5);
        setShowModal(false);
        setSelectedIdx(null);
        setButtonColors([
            BUTTON_COLOR_DEFAULT,
            BUTTON_COLOR_DEFAULT,
            BUTTON_COLOR_DEFAULT,
            BUTTON_COLOR_DEFAULT,
        ]);
        setShowModal(false);
        navigation.navigate("SchoolMain");
    };

    if (!questions.length) {
        return (
            <View style={styles.main}>
                <Text>Загрузка...</Text>
            </View>
        );
    }

    return (
        <View style={styles.main}>
            <View style={styles.quizContainer}>
                <Text style={styles.timerText}>ВРЕМЯ: {timeLeft}</Text>
                <Text style={styles.questionText}>
                    {questions[index].question}
                </Text>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[
                            styles.answerButton,
                            { backgroundColor: buttonColors[0] },
                        ]}
                        onPress={() => handleAnswer(0)}
                        disabled={selectedIdx !== null}
                    >
                        <Text style={styles.buttonText}>
                            {questions[index].options[0]}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.answerButton,
                            { backgroundColor: buttonColors[1] },
                        ]}
                        onPress={() => handleAnswer(1)}
                        disabled={selectedIdx !== null}
                    >
                        <Text style={styles.buttonText}>
                            {questions[index].options[1]}
                        </Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[
                            styles.answerButton,
                            { backgroundColor: buttonColors[2] },
                        ]}
                        onPress={() => handleAnswer(2)}
                        disabled={selectedIdx !== null}
                    >
                        <Text style={styles.buttonText}>
                            {questions[index].options[2]}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.answerButton,
                            { backgroundColor: buttonColors[3] },
                        ]}
                        onPress={() => handleAnswer(3)}
                        disabled={selectedIdx !== null}
                    >
                        <Text style={styles.buttonText}>
                            {questions[index].options[3]}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <Modal animationType="fade" transparent={true} visible={showModal}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalScoreText}>
                            Ваш счет: {score}/{questions.length}
                        </Text>
                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={restartGame}
                            >
                                <Text style={styles.modalButtonText}>
                                    Начать заново
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={exitQuize}
                            >
                                <Text style={styles.modalButtonText}>
                                    Завершить
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    quizContainer: {
        width: "80%",
        backgroundColor: "#f2f2f2",
        borderRadius: 40,
        borderWidth: 2,
        borderColor: "#444",
        paddingVertical: 32,
        alignItems: "center",
    },
    timerText: {
        fontSize: 42,
        fontWeight: "bold",
        marginBottom: 30,
        textAlign: "center",
    },
    questionText: {
        fontSize: 52,
        fontWeight: "bold",
        marginBottom: 32,
        textAlign: "center",
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 24,
    },
    answerButton: {
        width: 160,
        height: 70,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: "#444",
        marginHorizontal: 12,
        backgroundColor: BUTTON_COLOR_DEFAULT,
        justifyContent: "center",
        alignItems: "center",
    },
    buttonText: {
        fontSize: 20,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    modalContainer: {
        backgroundColor: "#fff",
        borderRadius: 20,
        padding: 32,
        minWidth: 320,
        alignItems: "center",
        borderWidth: 2,
        borderColor: "#444",
    },
    modalScoreText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 30,
    },
    modalButtonsRow: {
        flexDirection: "row",
        justifyContent: "space-evenly",
        width: "100%",
    },
    modalButton: {
        backgroundColor: "#3498db",
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginHorizontal: 7,
        alignItems: "center",
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
});
