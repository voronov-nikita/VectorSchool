import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
    ScrollView,
    TouchableOpacity,
    Modal,
    TextInput,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { URL } from "../config";

// русификация календаря (оставьте как есть)
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

export const EventsScreen = () => {
    const getCurrentDateString = () => {
        const d = new Date();
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, "0");
        const day = d.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(getCurrentDateString());
    const { width } = Dimensions.get("window");
    const [level, setLevel] = useState("боец");
    const [eventsByDate, setEventsByDate] = useState({}); // важно!
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [eventTitle, setEventTitle] = useState("");
    const [eventDate, setEventDate] = useState(getCurrentDateString());
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const isMobile = width < 768;

    // Получить уровень доступа пользователя
    useEffect(() => {
        (async () => {
            const login = await AsyncStorage.getItem("authToken");
            try {
                const response = await fetch(
                    `${URL}/user/access_level?login=${login}`
                );
                const data = await response.json();
                if (response.ok) {
                    setLevel(data.access_level);
                }
            } catch (error) {
                console.error("Ошибка сети:", error);
            }
        })();
    }, []);

    // Парсер событий с сервера
    const parseEvents = (eventsArray) => {
        const obj = {};
        eventsArray.forEach((ev) => {
            if (!obj[ev.date]) obj[ev.date] = [];
            obj[ev.date].push(ev);
        });
        return obj;
    };

    // Загрузка событий с сервера
    const fetchEvents = () => {
        fetch(`${URL}/events`)
            .then((res) => res.json())
            .then((data) => {
                setEventsByDate(parseEvents(data.events));
            });
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    // Создание события (только для админа)
    const createEvent = async () => {
        const login = await AsyncStorage.getItem("authToken");
        const body = {
            title: eventTitle,
            date: eventDate,
            start_time: startTime,
            end_time: endTime,
        };
        try {
            const response = await fetch(`${URL}/events/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    login: login, // меняйте на Authorization, если требуется
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (response.ok) {
                setIsModalVisible(false);
                setEventTitle("");
                setStartTime("");
                setEndTime("");
                setEventDate(selectedDate);
                fetchEvents();
            } else {
                alert("Ошибка: " + (data.error || "unknown"));
            }
        } catch (err) {
            alert("Ошибка сети: " + err.message);
        }
    };

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
                    {/* Календарь */}
                    <Calendar
                        current={selectedDate}
                        onDayPress={(day) => {
                            setSelectedDate(day.dateString);
                            setEventDate(day.dateString); // подставляем выбранную дату в форму по умолчанию
                        }}
                        markedDates={{
                            [selectedDate]: {
                                selected: true,
                                selectedColor: "#337AFF",
                            },
                            // Можно выделять еще даты с событиями тут если нужно
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
                    {/* События выбранного дня */}
                    <View
                        style={[
                            styles.schedulePanel,
                            { marginLeft: isMobile ? 0 : 40 },
                        ]}
                    >
                        <Text style={styles.dateText}>
                            {selectedDate.split("-").reverse().join(".")}
                        </Text>
                        {eventsByDate[selectedDate] &&
                        eventsByDate[selectedDate].length > 0 ? (
                            eventsByDate[selectedDate].map((ev, idx) => (
                                <View key={idx} style={styles.lessonCard}>
                                    <Text style={styles.lessonTime}>
                                        {/* Обычно отображают "18:00–20:00" */}
                                        {ev.start_time && ev.end_time
                                            ? `${ev.start_time} – ${ev.end_time}`
                                            : ""}
                                    </Text>
                                    <Text style={styles.lessonTitle}>
                                        {ev.title}
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
            {level === "админ" && (
                <>
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => {
                            setEventDate(selectedDate); // дата по умолчанию — выбранная
                            setIsModalVisible(true);
                        }}
                    >
                        <Text style={styles.fabText}>+</Text>
                    </TouchableOpacity>
                    <Modal
                        transparent={true}
                        visible={isModalVisible}
                        animationType="slide"
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalWindow}>
                                <Text style={styles.modalTitle}>
                                    Создать мероприятие
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Название"
                                    value={eventTitle}
                                    onChangeText={setEventTitle}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Дата (ГГГГ-ММ-ДД)"
                                    value={eventDate}
                                    onChangeText={setEventDate}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Время начала (HH:MM)"
                                    value={startTime}
                                    onChangeText={setStartTime}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Время окончания (HH:MM)"
                                    value={endTime}
                                    onChangeText={setEndTime}
                                />
                                <TouchableOpacity
                                    style={styles.modalBtn}
                                    onPress={createEvent}
                                >
                                    <Text style={styles.modalBtnText}>
                                        Создать мероприятие
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalClose}
                                    onPress={() => setIsModalVisible(false)}
                                >
                                    <Text style={styles.modalCloseText}>
                                        Закрыть
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                </>
            )}
        </View>
    );
};

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
    fab: {
        position: "absolute",
        right: 24,
        bottom: 24,
        backgroundColor: "#337AFF",
        width: 56,
        height: 56,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.19,
        shadowRadius: 4,
        zIndex: 99,
    },
    fabText: {
        color: "#fff",
        fontSize: 36,
        fontWeight: "bold",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        alignItems: "center",
        justifyContent: "center",
    },
    modalWindow: {
        width: 300,
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 20,
        alignItems: "stretch",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        marginBottom: 14,
        padding: 10,
        fontSize: 16,
    },
    modalBtn: {
        backgroundColor: "#337AFF",
        borderRadius: 14,
        padding: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    modalBtnText: {
        color: "#fff",
        fontSize: 16,
    },
    modalClose: {
        alignItems: "center",
        padding: 6,
    },
    modalCloseText: {
        color: "#337AFF",
    },
});
