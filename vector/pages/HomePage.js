import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ScrollView } from "react-native-web";

const services = [
    { label: "Календарь мероприятий", color: "#7A5FF6", path: "Events" },
    { label: "Инструкция", color: "#FFC142", path: "/instruction" },
    { label: "Мой профиль", color: "#5CD2D0", path: "Profile" },
    { label: "Школа Вектора", color: "#1b4cffff", path: "School" }
        ? AsyncStorage.getItem("access_level") == "админ"
        : null,
    { label: "Получение ПГАС", color: "#b52a12ff", path: "School" },
];

export const HomeScreen = ({ navigation }) => {
    console.log(AsyncStorage.getItem("access_level"));
    return (
        <ScrollView style={styles.container}>
            <View style={styles.grid}>
                {services.map((s, idx) =>
                // Проверяем, что s не равен null
                    s !== null ? ( 
                        <TouchableOpacity
                            key={idx}
                            style={[styles.card, { backgroundColor: s.color }]}
                            onPress={() => navigation.navigate(s.path)}
                        >
                            <Text style={styles.cardText}>{s.label}</Text>
                        </TouchableOpacity>
                    ) : null
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 40,
        paddingHorizontal: 20,
        backgroundColor: "#fafafa",
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        marginBottom: 18,
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 20,
        justifyContent: "center",
    },
    card: {
        width: "28%",
        minWidth: 170,
        height: 100,
        borderRadius: 20,
        margin: 12,
        justifyContent: "flex-end",
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.14,
        shadowOffset: { width: 2, height: 1 },
        elevation: 4,
    },
    cardText: {
        color: "#fff",
        fontSize: 19,
        fontWeight: "500",
    },
});
