import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ScrollView } from "react-native-web";

const services = [
    { access_level: '*', label: "Календарь мероприятий", color: "#7A5FF6", path: "Events" },
    { access_level: '*', label: "Инструкция", color: "#FFC142", path: "Instruction" },
    { access_level: '*', label: "Мой профиль", color: "#5CD2D0", path: "Profile" },
    { access_level: 'admin', label: "Школа Вектора", color: "#1b4cffff", path: "SchoolMain" },
    { access_level: '0', label: "Получение ПГАС", color: "#b52a12ff", path: "PGAS" },
];

export const HomeScreen = ({ navigation }) => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.grid}>
                {services.length > 0 &&
                    services
                        .filter((s) => s !== null)
                        .map((s, idx) => (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.card,
                                    { backgroundColor: s.color },
                                ]}
                                onPress={() => navigation.navigate(s.path)}
                            >
                                <Text style={styles.cardText}>{s.label}</Text>
                            </TouchableOpacity>
                        ))}
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
