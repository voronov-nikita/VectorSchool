import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, Platform, ScrollView } from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";

// русификация календаря
LocaleConfig.locales["ru"] = {
    monthNames: [
        "Январь",
        "Февраль",
        "Март",
        "Апрель",
        "Май",
        "Июнь",
        "Июль",
        "Август",
        "Сентябрь",
        "Октябрь",
        "Ноябрь",
        "Декабрь",
    ],
    monthNamesShort: [
        "Янв",
        "Фев",
        "Мар",
        "Апр",
        "Май",
        "Июн",
        "Июл",
        "Авг",
        "Сен",
        "Окт",
        "Ноя",
        "Дек",
    ],
    dayNames: [
        "Воскресенье",
        "Понедельник",
        "Вторник",
        "Среда",
        "Четверг",
        "Пятница",
        "Суббота",
    ],
    dayNamesShort: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
    today: "Сегодня",
};
LocaleConfig.defaultLocale = "ru";

// временная хуйня
const lessonsSchedule = {
    "2025-08-31": [
        { time: "9:00 – 10:30", title: "Математика" },
        { time: "11:00 – 12:30", title: "Информатика" },
    ],
    "2025-08-30": [{ time: "10:00 – 11:30", title: "Физика" }],
};


export const EventsScreen = () => {
    const [selectedDate, setSelectedDate] = useState("2025-08-31");
    const { width } = Dimensions.get("window");
    const isMobile = width < 768;

    return (
        <View style={styles.container}>
            <ScrollView style={styles.card}>
                <Text style={styles.title}>Календарь мероприятий</Text>
                <View
                    style={[
                        styles.innerContainer,
                        { flexDirection: isMobile ? "column" : "row" },
                    ]}
                >
                    {/* Календарь всегда сверху */}
                    <Calendar
                        current={selectedDate}
                        onDayPress={(day) => setSelectedDate(day.dateString)}
                        markedDates={{
                            [selectedDate]: {
                                selected: true,
                                selectedColor: "#337AFF",
                            },
                        }}
                        theme={{
                            todayTextColor: "#337AFF",
                            selectedDayBackgroundColor: "#337AFF",
                            arrowColor: "#337AFF",
                            textMonthFontWeight: "bold",
                        }}
                        style={{
                            borderRadius: 18,
                            backgroundColor: "#fff",
                            width: isMobile ? "100%" : 370,
                            marginBottom: isMobile ? 20 : 0,
                        }}
                        firstDay={1}
                        monthFormat={"MMMM yyyy"}
                    />

                    {/* Расписание */}
                    <View
                        style={[
                            styles.schedulePanel,
                            { marginLeft: isMobile ? 0 : 40 },
                        ]}
                    >
                        <Text style={styles.dateText}>
                            {selectedDate.split("-").reverse().join(".")}
                        </Text>
                        {lessonsSchedule[selectedDate] ? (
                            lessonsSchedule[selectedDate].map((lesson, idx) => (
                                <View key={idx} style={styles.lessonCard}>
                                    <Text style={styles.lessonTime}>
                                        {lesson.time}
                                    </Text>
                                    <Text style={styles.lessonTitle}>
                                        {lesson.title}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyPanel}>
                                <Text style={styles.emptyText}>
                                    Нет мероприятий
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f8fa",
        padding: 0,
        alignItems: "center",
    },
    card: {
        width: "98%",
        maxWidth: 960,
        marginTop: 12,
        padding: Platform.OS === "web" ? 24 : 12,
        borderRadius: 20,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOpacity: 0.07,
        shadowRadius: 25,
    },
    title: {
        fontSize: 24,
        fontWeight: "500",
        marginBottom: 18,
    },
    innerContainer: {
        width: "100%",
        justifyContent: "flex-start",
    },
    schedulePanel: {
        flex: 1,
        justifyContent: "flex-start",
    },
    dateText: {
        fontSize: 17,
        fontWeight: "500",
        marginBottom: 12,
    },
    lessonCard: {
        backgroundColor: "#eef4ff",
        borderRadius: 14,
        marginBottom: 10,
        padding: 12,
    },
    lessonTime: {
        fontSize: 15,
        color: "#337AFF",
        fontWeight: "bold",
    },
    lessonTitle: {
        fontSize: 15,
        marginTop: 2,
    },
    emptyPanel: {
        alignItems: "center",
        justifyContent: "center",
        marginTop: 24,
    },
    emptyText: {
        color: "#aaa",
        fontSize: 15,
    },
});
