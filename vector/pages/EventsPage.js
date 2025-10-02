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
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useNavigation } from "@react-navigation/native";
import { URL } from "../config";

// Русификация календаря
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
    const navigation = useNavigation();
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
    const [eventsByDate, setEventsByDate] = useState({});
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [eventTitle, setEventTitle] = useState("");
    const [auditorium, setAuditorium] = useState("");
    const [eventDate, setEventDate] = useState(getCurrentDateString());
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("-");
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editData, setEditData] = useState(null);

    // Новый стейт для удаления
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleteId, setDeleteId] = useState(null);

    const isMobile = width < 768;

    useEffect(() => {
        (async () => {
            const login = await AsyncStorage.getItem("authToken");
            try {
                const response = await fetch(
                    `${URL}/user/access_level?login=${login}`
                );
                const data = await response.json();
                if (response.ok) setLevel(data.access_level);
            } catch (error) {
                console.error("Ошибка сети:", error);
            }
        })();
    }, []);

    const parseEvents = (eventsArray) => {
        const obj = {};
        eventsArray.forEach((ev) => {
            if (!obj[ev.date]) obj[ev.date] = [];
            obj[ev.date].push(ev);
        });
        return obj;
    };

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

    // Создание
    const createEvent = async () => {
        const login = await AsyncStorage.getItem("authToken");
        const body = {
            title: eventTitle,
            date: eventDate,
            start_time: startTime,
            end_time: endTime,
            auditorium,
        };

        try {
            const response = await fetch(`${URL}/events/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    login: login,
                },
                body: JSON.stringify(body),
            });
            const data = await response.json();
            if (response.ok) {
                setIsModalVisible(false);
                setEventTitle("");
                setStartTime("");
                setEndTime("");
                setAuditorium("");
                setEventDate(selectedDate);
                fetchEvents();
            } else {
                // Ошибка создания мероприятия
            }
        } catch (err) {
            // Ошибка сети
        }
    };

    // ////////////////////////////
    // Новый метод удаления через modal
    // ////////////////////////////
    const openDeleteModal = (id) => {
        setDeleteId(id);
        setDeleteModalVisible(true);
    };

    const confirmDelete = async () => {
        const login = await AsyncStorage.getItem("authToken");
        try {
            await fetch(`${URL}/events/${deleteId}`, {
                method: "DELETE",
                headers: { login },
            });
            setDeleteModalVisible(false);
            setDeleteId(null);
            fetchEvents();
        } catch (err) {
            setDeleteModalVisible(false);
            setDeleteId(null);
        }
    };

    const cancelDelete = () => {
        setDeleteModalVisible(false);
        setDeleteId(null);
    };
    // ////////////////////////////

    // Редактирование
    const openEditModal = (ev) => {
        setEditData({
            id: ev.id,
            title: ev.title,
            start_time: ev.start_time || "",
            end_time: ev.end_time || "",
            date: ev.date,
            auditorium: ev.auditorium || "",
        });
        setEditModalVisible(true);
    };

    const handleEditSave = async () => {
        const login = await AsyncStorage.getItem("authToken");
        const data = editData || {};
        const fieldsToSend = {};
        ["title", "start_time", "end_time", "date", "auditorium"].forEach(
            (k) => {
                if (data[k] !== undefined) fieldsToSend[k] = data[k];
            }
        );

        await fetch(`${URL}/events/${editData.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", login },
            body: JSON.stringify(fieldsToSend),
        });
        setEditModalVisible(false);
        setEditData(null);
        fetchEvents();
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
                    <Calendar
                        current={selectedDate}
                        onDayPress={(day) => {
                            setSelectedDate(day.dateString);
                            setEventDate(day.dateString);
                        }}
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
                                    <TouchableOpacity
                                        style={{ flex: 1 }}
                                        onPress={() =>
                                            navigation.navigate("Attendance", {
                                                eventId: ev.id,
                                            })
                                        }
                                    >
                                        <Text style={styles.lessonTime}>
                                            {ev.title} {"("}
                                            {ev.auditorium}
                                            {")"}
                                        </Text>
                                        <Text style={styles.lessonTitle}>
                                            {ev.start_time && ev.end_time
                                                ? `${ev.start_time} – ${ev.end_time}`
                                                : ""}
                                        </Text>
                                    </TouchableOpacity>
                                    {(level === "админ") && (
                                        <View style={styles.buttonRow}>
                                            <TouchableOpacity
                                                style={styles.editBtn}
                                                onPress={() =>
                                                    openEditModal(ev)
                                                }
                                            >
                                                <MaterialCommunityIcons
                                                    name="pencil-outline"
                                                    size={22}
                                                    color="#222"
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.delBtn}
                                                onPress={() =>
                                                    openDeleteModal(ev.id)
                                                }
                                            >
                                                <MaterialCommunityIcons
                                                    name="trash-can-outline"
                                                    size={22}
                                                    color="#fff"
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
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

            {(level === "админ") && (
                <>
                    <TouchableOpacity
                        style={styles.fab}
                        onPress={() => {
                            setEventDate(selectedDate);
                            setIsModalVisible(true);
                        }}
                    >
                        <Text style={styles.fabText}>+</Text>
                    </TouchableOpacity>
                    {/* Модалка создания */}
                    <Modal
                        transparent={true}
                        visible={isModalVisible}
                        animationType="slide"
                        onRequestClose={() => setIsModalVisible(false)}
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
                                <TextInput
                                    style={styles.input}
                                    placeholder="Аудитория"
                                    value={auditorium}
                                    onChangeText={setAuditorium}
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
                    {/* Модалка редактирования */}
                    <Modal
                        transparent={true}
                        visible={editModalVisible}
                        animationType="slide"
                        onRequestClose={() => setEditModalVisible(false)}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalWindow}>
                                <Text style={styles.modalTitle}>
                                    Редактировать мероприятие
                                </Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Название"
                                    value={editData?.title || ""}
                                    onChangeText={(txt) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            title: txt,
                                        }))
                                    }
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Дата (ГГГГ-ММ-ДД)"
                                    value={editData?.date || ""}
                                    onChangeText={(txt) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            date: txt,
                                        }))
                                    }
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Время начала (HH:MM)"
                                    value={editData?.start_time || ""}
                                    onChangeText={(txt) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            start_time: txt,
                                        }))
                                    }
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Время окончания (HH:MM)"
                                    value={editData?.end_time || ""}
                                    onChangeText={(txt) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            end_time: txt,
                                        }))
                                    }
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Аудитория"
                                    value={editData?.auditorium || ""}
                                    onChangeText={(txt) =>
                                        setEditData((prev) => ({
                                            ...prev,
                                            auditorium: txt,
                                        }))
                                    }
                                />

                                <TouchableOpacity
                                    style={styles.modalBtn}
                                    onPress={handleEditSave}
                                >
                                    <Text style={styles.modalBtnText}>
                                        Сохранить изменения
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalClose}
                                    onPress={() => setEditModalVisible(false)}
                                >
                                    <Text style={styles.modalCloseText}>
                                        Закрыть
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                    {/* Модалка удаления */}
                    <Modal
                        transparent={true}
                        visible={deleteModalVisible}
                        animationType="slide"
                        onRequestClose={cancelDelete}
                    >
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalWindow}>
                                <Text style={styles.modalTitle}>
                                    Удалить мероприятие?
                                </Text>
                                <Text
                                    style={{
                                        textAlign: "center",
                                        marginBottom: 16,
                                    }}
                                >
                                    Вы уверены, что хотите удалить мероприятие?
                                    Это действие нельзя отменить.
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.modalBtn,
                                        { backgroundColor: "#ff5757" },
                                    ]}
                                    onPress={confirmDelete}
                                >
                                    <Text style={styles.modalBtnText}>
                                        Удалить
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.modalClose}
                                    onPress={cancelDelete}
                                >
                                    <Text style={styles.modalCloseText}>
                                        Отмена
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
        flexDirection: "row",
        alignItems: "center",
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
        textAlignVertical: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.19,
        shadowRadius: 4,
        zIndex: 99,
    },
    fabText: {
        textAlignVertical: "center",
        textAlign: "center",
        justifyContent: "top",
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
    buttonRow: {
        flexDirection: "row",
        marginLeft: 8,
    },
    editBtn: {
        padding: 8,
        backgroundColor: "#ffdd57",
        borderRadius: 8,
        marginRight: 8,
    },
    delBtn: {
        padding: 8,
        backgroundColor: "#ff5757",
        borderRadius: 8,
    },
    editBtnText: {
        fontSize: 18,
    },
    delBtnText: {
        fontSize: 18,
        color: "#fff",
    },
});
