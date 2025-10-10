import { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { URL } from "../config";

const services = [
    {
        access_level: ["боец", "админ", "куратор"],
        label: "Календарь мероприятий",
        color: "#a9ba48ff",
        path: "Events",
    },
    {
        access_level: ["админ", "куратор", "боец"],
        label: "Учебные группы",
        color: "#0a630eff",
        path: "SchoolGroups",
    },
    {
        access_level: ["админ", "куратор", "боец"],
        label: "Запись на экзамены",
        color: "#099973ff",
        path: "Exams",
    },
    {
        access_level: ["админ", "куратор"],
        label: "???",
        color: "#21030bff",
        path: "Game",
    },
    {
        access_level: ["админ", "куратор"],
        label: "Добавить вопрос в форму",
        color: "#cba5afff",
        path: "AddQuestionQuize",
    },
    // {
    //     access_level: ["админ", "куратор", "боец"],
    //     label: "Домашка",
    //     color: "#ff041dff",
    //     path: "Homework",
    // },
    {
        access_level: ["админ", "куратор", "училка"],
        label: "Достижения",
        color: "#b04429ff",
        path: "SchoolAchive",
    },
    // {
    //     access_level: ["админ", "куратор", "боец"],
    //     label: "Учебные материалы",
    //     color: "#96b9ffff",
    //     path: "SchoolMaterial",
    // },
    {
        access_level: ["админ"],
        label: "Оценки",
        color: "#1069a9ff",
        path: "Scores",
    },
];

export const SchoolMainScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const [level, setLevel] = useState("боец");

    // Максимум 4 карточки в ряд, минимум 2
    // Определяем количество колонок в зависимости от ширины окна
    let numColumns = 4;
    if (width <= 650) {
        numColumns = 3;
    } else if (width < 750) {
        numColumns = 4;
    }

    // Вычисляем ширину карточки (учитывая отступы)
    const cardMargin = 20; // margin*2 слева и справа (10*2)
    const cardWidth = (width - cardMargin * numColumns) / numColumns;

    useEffect(async () => {
        const login = await AsyncStorage.getItem("authToken").then();
        try {
            const response = await fetch(
                `${URL}/user/access_level?login=${login}`
            );
            const data = await response.json();

            if (response.ok) {
                setLevel(data.access_level);
                console.log(level);
            } else {
                console.warn("Ошибка сервера:", data.error);
                return null;
            }
        } catch (error) {
            console.error("Ошибка сети:", error);
            return null;
        }
    }, []);

    return (
        <SafeAreaView style={styles.flexContainer}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.grid}>
                    {services.map((s, idx) =>
                        s.access_level.includes(level) ? (
                            <TouchableOpacity
                                key={idx}
                                style={[
                                    styles.card,
                                    {
                                        backgroundColor: s.color,
                                        width: cardWidth,
                                    },
                                ]}
                                onPress={() => navigation.navigate(s.path)}
                            >
                                <Text style={styles.cardText}>{s.label}</Text>
                            </TouchableOpacity>
                        ) : null
                    )}
                </View>
                <View style={styles.footer}>
                    <Text style={styles.copyright}>
                        © 2025 Профориентационный отряд РТУ МИРЭА «Вектор»
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    flexContainer: {
        flex: 1,
        backgroundColor: "#fafafa",
        position: "relative",
    },
    scrollContent: {
        paddingTop: 40,
        paddingHorizontal: 20,
        paddingBottom: 80, // чтобы контент не перекрывался футером
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: 20, // В React Native нет поддержки gap, добавьте margin в карточках вместо gap если нужно
    },
    card: {
        flexBasis: "48%",
        width: "38%",
        minWidth: 270,
        maxWidth: 340,
        height: 100,
        borderRadius: 20,
        margin: 12,
        justifyContent: "center",
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.14,
        shadowOffset: { width: 2, height: 1 },
        elevation: 4,
    },
    cardText: {
        textAlign: "center",
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
    },
    footer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fafafa",
        padding: 15,
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: "#fafafa",
    },
    copyright: {
        textAlign: "center",
        color: "#888",
        fontSize: 13,
        marginTop: 8,
    },
});
