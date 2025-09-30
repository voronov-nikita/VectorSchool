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
        access_level: ["админ", "куратор"],
        label: "Инструкция",
        color: "#e97900ff",
        path: "Instruction",
    },
    {
        access_level: ["боец", "куратор", "админ"],
        label: "Мой профиль",
        color: "#5cd287ff",
        path: "Profile",
    },
    {
        access_level: ["админ", "боец", "куратор"],
        label: "Контакты",
        color: "#8a8a8aff",
        path: "Contacts",   
    },
    {
        access_level: ["админ"],
        label: "Новости",
        color: "#6d0057ff",
        path: "News",
    },
    {
        access_level: [],
        label: "Получение ПГАС",
        color: "#b52a12ff",
        path: "PGAS",
    },
    {
        access_level: [],
        label: "ДОД",
        color: "#e90090ff",
        path: "DOD",
    },
    {
        access_level: ["куратор", "админ", "боец"],
        label: "Школа Вектора",
        color: "#1b4cffff",
        path: "SchoolMain",
    },
];

export const HomeScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const [level, setLevel] = useState("боец");

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

    // Максимум 4 карточки в ряд, минимум 2
    // Определяем количество колонок в зависимости от ширины окна
    let numColumns = 4;
    if (width <= 650) {
        numColumns = 3;
    } else if (width < 700) {
        numColumns = 4;
    }

    // Вычисляем ширину карточки (учитывая отступы)
    const cardMargin = 20; // margin*2 слева и справа (10*2)
    const cardWidth = (width - cardMargin * numColumns) / numColumns;

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
        paddingBottom: 80, // паддинг снизу чтоб не перекрывать футер
    },
    grid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    card: {
        height: 100,
        borderRadius: 20,
        margin: 12,
        justifyContent: "center",
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.14,
        shadowOffset: { width: 2, height: 1 },
        elevation: 4,
        minWidth: 150,
        maxWidth: 350,
    },
    cardText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "500",
        textAlign: "center",
        justifyContent: "center",
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
        borderColor: "#ddd",
    },
    copyright: {
        textAlign: "center",
        color: "#888",
        fontSize: 13,
        marginTop: 8,
    },
});
