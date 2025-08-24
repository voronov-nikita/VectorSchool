import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
} from "react-native";
import { useAuth } from "./Auth";

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [text, setText] = useState("Введите логин и пароль");
    const { signIn } = useAuth();

    const handleLogin = async () => {
        const success = await signIn(email, password);
        if (!success) {
            setText("Неверный логин или пароль");
        } else {
            setText("");
        }
    };

    return (
        <View style={styles.container}>
            {/* Надпись об ошибке или не ошибке */}
            {text ? <Text style={styles.text}>{text}</Text> : null}

            <View>
                <TextInput
                    style={styles.input}
                    value={email}
                    autoCapitalize="none"
                    onChangeText={setEmail}
                    placeholder="Email"
                    keyboardType="email-address"
                />
                <TextInput
                    style={styles.input}
                    value={password}
                    autoCapitalize="none"
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <TouchableOpacity style={styles.button} onPress={handleLogin}>
                    <Text style={styles.buttonText}>Войти</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#eceeef",
        paddingTop: 40,
    },
    header: {
        fontSize: 34,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
    },
    form: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 24,
        minWidth: 340,
        elevation: 3,
        alignItems: "stretch",
    },
    title: { fontSize: 24, fontWeight: "600", marginBottom: 16 },
    label: { fontWeight: "600", marginTop: 10, marginBottom: 3 },
    input: {
        borderWidth: 1,
        borderRadius: 6,
        borderColor: "#ccc",
        padding: 10,
        marginBottom: 6,
        fontSize: 16,
    },
    passwordContainer: { flexDirection: "row", alignItems: "center" },
    eyeButton: { marginLeft: -35, padding: 4 },
    checkboxContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
        marginBottom: 10,
    },
    checkboxLabel: { marginLeft: 8, fontSize: 16 },
    
    text: { marginBottom: 10, textAlign: "center", fontSize: 20 },
    button: {
        backgroundColor: "#f7f8fa",
        padding: 12,
        borderRadius: 5,
        alignItems: "center",
        marginTop: 10,
        width: "100%",
    },
    buttonText: {
        fontSize: 18,
        color: "#222",
        fontWeight: "600",
    },
});
