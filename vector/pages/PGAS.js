import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

// путь к файлу иллюстрации
const LazyDog = require("./lazy-dog.png"); 

export const PGASScreen = () => {
    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Image
                    source={LazyDog}
                    style={styles.dog}
                    resizeMode="contain"
                />
                <Text style={styles.title}>Выходной</Text>
                <Text style={styles.subtitle}>Пар в этот день нет!</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        alignItems: "center",
        padding: 32,
        borderRadius: 24,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.12,
        shadowRadius: 16,
        elevation: 8,
    },
    dog: {
        width: 180,
        height: 180,
        marginBottom: 8,
        // Для SVG можно использовать react-native-svg.
    },
    title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#222",
        marginTop: 10,
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 18,
        color: "#555",
        textAlign: "center",
    },
});
