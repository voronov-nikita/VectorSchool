// Страница авторизации пользователей
//

import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    SafeAreaView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// импорт констант из файла с конфигурациями
import { URL } from "../config";

// Экспортируемый экран авторизации
export const AuthScreen = ({ navigation }) => {
    const { width } = Dimensions.get("window");
    // Ширина основного блока в зависимости от ширины экрана
    const mainBlockWidth = width < 400 ? "85%" : "34%";

    // Состояния для управления вводом и авторизацией
    const [message, setMessage] = useState("ВВЕДИТЕ ЛОГИН И ПАРОЛЬ");
    const [login, setLogin] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Проверка сохранённой сессии при монтировании
    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const expiresAt = localStorage.getItem("expiresAt");

        if (token && expiresAt && Date.now() < expiresAt) {
            setIsAuthenticated(true);
            navigation.navigate("Home"); // Перенаправляем на главную страницу
        } else {
            localStorage.removeItem("authToken");
            localStorage.removeItem("expiresAt");
        }
    }, []);

    // Авторизация пользователя
    const sendDataToServerAuth = async () => {
        if (!login || !password) {
            setError("Введите логин и пароль");
            return;
        }
        try {
            const response = await fetch(`${URL}/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login, password }),
            });
            const data = await response.json();
            if (response.ok) {
                setMessage("Введите логин и пароль");
				navigation.navigate("Home");
            } else {
                setMessage("Поля логина и пароля не могут быть пустыми");
            }
        } catch (e) {
			console.log(e);
            setMessage("Ошибка соединения с сервером");
        }
    };

    // Интерфейс страницы
    return (
        <SafeAreaView style={styles.container}>
            <View style={[styles.mainBlock, { width: mainBlockWidth }]}>
                <Text style={styles.topText}>{message}</Text>

                <View style={styles.blockTextInput}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Логин или почта:"
                        autoFocus={true}
                        onChangeText={(login) => setLogin(login)}
                        value={login}
                    />
                </View>

                <View style={styles.blockTextInput}>
                    <TextInput
                        secureTextEntry={!showPassword}
                        style={styles.textInput}
                        placeholder="Пароль:"
                        onChangeText={(passw) => setPassword(passw)}
                        value={password}
                    />

                    <MaterialCommunityIcons
                        name={showPassword ? "eye-off" : "eye"}
                        size={28}
                        color="#aaa"
                        style={styles.icon}
                        onPress={() => setShowPassword(!showPassword)}
                    />
                </View>

                <TouchableOpacity
                    style={styles.button.active}
                    onPressOut={sendDataToServerAuth}
                >
                    <Text style={styles.buttonText}>Войти</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Конструктор стилей для экрана авторизации
const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        alignContent: "center",
        justifyContent: "center",
        flex: 1,
        backgroundColor: "#21292c",
    },

    mainBlock: {
        flex: 1,
        alignContent: "center",
        justifyContent: "center",
    },

    blockTextInput: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f3f3",

        borderWidth: 0.5,
    },

    textInput: {
        justifyContent: "center",
        margin: "auto",
        padding: "7%",
        backgroundColor: "#f3f3f3",
        color: "black",
        width: "100%",

        fontFamily: "Arial",
    },

    icon: {
        marginRight: "5%",
    },

    button: {
        active: {
            width: "100%",
            height: "10%",
            backgroundColor: "#007bb7",
        },

        inactive: {
            width: "100%",
            height: "10%",
            backgroundColor: "#374e59",
        },
    },

    buttonText: {
        display: "flex",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: "Arial",
        fontWeight: "bold",
        margin: "auto",

        color: "#e2e8e9",
        fontSize: "1.25rem",
    },

    topText: {
        textAlign: "center",
        justifyContent: "center",

        fontSize: "1.05rem",
        color: "#e2e8e9",
        margin: "5%",
        padding: "auto",
        fontFamily: "Arial",
    },
});
