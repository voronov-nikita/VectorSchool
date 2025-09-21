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
        label: "Календарь мероприятий",
        color: "#7A5FF6",
        path: "Events",
    },
    {
        access_level: "*",
        label: "Инструкция",
        color: "#FFC142",
        path: "Instruction",
    },
    {
        access_level: "*",
        label: "Мой профиль",
        color: "#5CD2D0",
        path: "Profile",
    },
    {
        access_level: "admin",
        label: "Школа Вектора",
        color: "#1b4cffff",
        path: "SchoolMain",
    },
    { access_level: "*", label: "Новости", color: "#6d5200ff", path: "News" },
    {
        access_level: "0",
        label: "Получение ПГАС",
        color: "#b52a12ff",
        path: "PGAS",
    },
];
export const HomeScreen = ({ navigation }) => {
    const { width } = useWindowDimensions();

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
        justifyContent: "flex-end",
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
