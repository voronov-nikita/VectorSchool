import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";

import { URL } from "../config";

export const AddQuestionForm = () => {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctAnswer, setCorrectAnswer] = useState("");

    const handleOptionChange = (text, idx) => {
        const newOpts = [...options];
        newOpts[idx] = text;
        setOptions(newOpts);
    };

    const handleSubmit = async () => {
        if (
            !question.trim() ||
            options.some((opt) => !opt.trim()) ||
            !correctAnswer.trim()
        )
            return;
        if (!options.includes(correctAnswer)) return;

        await fetch(`${URL}/game/questions`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                question,
                options,
                correct_answer: correctAnswer,
            }),
        });
        setQuestion("");
        setOptions(["", "", "", ""]);
        setCorrectAnswer("");
    };

    return (
        <View style={formStyles.formContainer}>
            <Text style={formStyles.title}>Добавить новый вопрос</Text>
            <TextInput
                style={formStyles.input}
                placeholder="Вопрос"
                value={question}
                onChangeText={setQuestion}
            />
            {options.map((opt, idx) => (
                <TextInput
                    key={idx}
                    style={formStyles.input}
                    placeholder={`Вариант ${idx + 1}`}
                    value={opt}
                    onChangeText={(text) => handleOptionChange(text, idx)}
                />
            ))}
            <TextInput
                style={formStyles.input}
                placeholder="Правильный ответ"
                value={correctAnswer}
                onChangeText={setCorrectAnswer}
            />
            <TouchableOpacity style={formStyles.button} onPress={handleSubmit}>
                <Text style={formStyles.buttonText}>Добавить вопрос</Text>
            </TouchableOpacity>
        </View>
    );
};

const formStyles = StyleSheet.create({
    formContainer: {
        backgroundColor: "#f2f2f2",
        borderColor: "#444",
        borderRadius: 40,
        borderWidth: 2,
        paddingVertical: 32,
        paddingHorizontal: 28,
        alignItems: "center",
        width: "85%",
        alignSelf: "center",
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 26,
        textAlign: "center",
    },
    input: {
        width: "93%",
        borderWidth: 1,
        borderColor: "#999",
        borderRadius: 14,
        padding: 10,
        fontSize: 17,
        marginBottom: 12,
        backgroundColor: "#fff",
    },
    button: {
        backgroundColor: "#3498db",
        borderRadius: 18,
        padding: 14,
        alignItems: "center",
        width: "70%",
        marginTop: 10,
    },
    buttonText: { color: "#fff", fontSize: 20, fontWeight: "bold" },
});
