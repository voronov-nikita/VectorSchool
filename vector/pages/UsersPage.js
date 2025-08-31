import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const UsersScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>
                users
            </Text>
            <Text style={styles.text}>
                Здесь можно разместить любой контент.
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // занимает весь экран
        justifyContent: "center", // выравнивание по вертикали по центру
        alignItems: "center", // выравнивание по горизонтали по центру
        padding: 16,
        backgroundColor: "#fff", // белый фон
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 12,
    },
    text: {
        fontSize: 16,
        color: "#333",
    },
});
