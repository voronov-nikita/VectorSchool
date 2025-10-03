import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Image,
    Alert,
} from "react-native";
import { URL } from "../config";

export const TakeTestScreen = ({ route, navigation }) => {
    const { testId } = route.params;
    const [testData, setTestData] = useState(null);
    const [answers, setAnswers] = useState({});
    const [currentQuestion, setCurrentQuestion] = useState(0);

    useEffect(() => {
        fetch(`${URL}/tests`)
            .then((res) => res.json())
            .then((data) => {
                const test = data.tests.find((t) => t.id === testId);
                if (test) {
                    setTestData(test);
                } else {
                    Alert.alert("Ошибка", "Тест не найден");
                    navigation.goBack();
                }
            })
            .catch(() => {
                Alert.alert("Ошибка сети");
                navigation.goBack();
            });
    }, [testId]);

    if (!testData) return <Text>Загрузка...</Text>;

    const question = testData.questions[currentQuestion];

    const onSelectAnswer = (index) => {
        if (question.type === "single") {
            setAnswers({ ...answers, [currentQuestion]: [index] });
        } else if (question.type === "multiple") {
            const current = answers[currentQuestion] || [];
            if (current.includes(index)) {
                setAnswers({
                    ...answers,
                    [currentQuestion]: current.filter((i) => i !== index),
                });
            } else {
                setAnswers({
                    ...answers,
                    [currentQuestion]: [...current, index],
                });
            }
        }
    };

    const onTextAnswerChange = (text) => {
        setAnswers({ ...answers, [currentQuestion]: text });
    };

    const goNext = () => {
        if (currentQuestion < testData.questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    const goPrev = () => {
        if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
    };

    const submitAnswers = () => {
        const formData = new FormData();
        formData.append("test_id", testData.id);
        Object.entries(answers).forEach(([qIdx, ans]) => {
            formData.append(`answers[${qIdx}]`, JSON.stringify(ans));
        });

        fetch(`${URL}/api/tests/submit`, {
            method: "POST",
            headers: {
                // Добавьте login или токен, если нужно
            },
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.result) {
                    Alert.alert("Успешно", "Тест отправлен на проверку");
                    navigation.goBack();
                } else {
                    Alert.alert("Ошибка", "Не удалось отправить тест");
                }
            })
            .catch(() => Alert.alert("Ошибка сети"));
    };

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                Вопрос {currentQuestion + 1} из {testData.questions.length}
            </Text>
            <ScrollView style={{ marginVertical: 16 }}>
                <Text style={{ fontSize: 18 }}>{question.text}</Text>
                {question.image_path && (
                    <Image
                        source={{
                            uri: `${URL}/uploads/${question.image_path}`,
                        }}
                        style={{ width: "100%", height: 200, marginTop: 8 }}
                        resizeMode="contain"
                    />
                )}
                {question.type === "text" ? (
                    <TextInput
                        style={{
                            borderWidth: 1,
                            borderColor: "#ccc",
                            marginTop: 12,
                            padding: 8,
                            borderRadius: 4,
                        }}
                        value={answers[currentQuestion] || ""}
                        onChangeText={onTextAnswerChange}
                        placeholder="Введите ответ"
                    />
                ) : (
                    question.answers.map((ans, idx) => {
                        const selected = (
                            answers[currentQuestion] || []
                        ).includes(idx);
                        return (
                            <TouchableOpacity
                                key={idx}
                                onPress={() => onSelectAnswer(idx)}
                                style={{
                                    padding: 10,
                                    marginTop: 8,
                                    backgroundColor: selected
                                        ? "#88ccee"
                                        : "#eee",
                                    borderRadius: 4,
                                }}
                            >
                                <Text>{ans}</Text>
                            </TouchableOpacity>
                        );
                    })
                )}
            </ScrollView>

            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                }}
            >
                <TouchableOpacity
                    onPress={goPrev}
                    disabled={currentQuestion === 0}
                    style={{
                        opacity: currentQuestion === 0 ? 0.5 : 1,
                        padding: 10,
                        backgroundColor: "#ccc",
                        borderRadius: 4,
                    }}
                >
                    <Text>Назад</Text>
                </TouchableOpacity>
                {currentQuestion < testData.questions.length - 1 ? (
                    <TouchableOpacity
                        onPress={goNext}
                        style={{
                            padding: 10,
                            backgroundColor: "#4caf50",
                            borderRadius: 4,
                        }}
                    >
                        <Text style={{ color: "white" }}>Вперед</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={submitAnswers}
                        style={{
                            padding: 10,
                            backgroundColor: "tomato",
                            borderRadius: 4,
                        }}
                    >
                        <Text style={{ color: "white" }}>
                            Закончить попытку
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
};
