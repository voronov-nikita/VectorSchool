import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    useWindowDimensions,
} from "react-native";

const services = [
    {
        access_level: "*",
        label: "Учебные группы",
        color: "#1dff28ff",
        path: "SchoolGroups",
    },
    {
        access_level: "*",
        label: "Тесты",
        color: "#42fff2ff",
        path: "Tests",
    },
    {
        access_level: "0",
        label: "Домашка",
        color: "#ff041dff",
        path: "Homework",
    },
    {
        access_level: "0",
        label: "Достижения",
        color: "#b512aaff",
        path: "SchoolAchive",
    },
    {
        access_level: "0",
        label: "Учебные материалы",
        color: "#96b9ffff",
        path: "SchoolMaterial",
    },
];

export const SchoolMainScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();

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

    return (
        <SafeAreaView style={styles.flexContainer}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.grid}>
                    {services.map((s, idx) => (
                        <TouchableOpacity
                            key={idx}
                            style={[
                                styles.card,
                                { backgroundColor: s.color, width: cardWidth },
                            ]}
                            onPress={() => navigation.navigate(s.path)}
                        >
                            <Text style={styles.cardText}>{s.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.footer}>
                    <Text style={styles.copyright}>
                        © 2025 МИРЭА – Российский технологический университет
                        {"\n"}Профориентационный отряд "Вектор"
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
        justifyContent: "flex-end",
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.14,
        shadowOffset: { width: 2, height: 1 },
        elevation: 4,
    },
    cardText: {
        color: "#fff",
        fontSize: 14,
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
