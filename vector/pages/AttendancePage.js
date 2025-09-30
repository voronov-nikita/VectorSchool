import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { URL } from "../config";

export const AttendanceScreen = ({ route }) => {
    const { eventId } = route.params;
    const [event, setEvent] = useState(null);
    const [level, setLevel] = useState("боец");
    const [attendance, setAttendance] = useState({});
    const [sections, setSections] = useState([]);
    const [expandedGroups, setExpandedGroups] = useState({});

    useEffect(() => {
        // Заполняем событие с отметками
        fetch(`${URL}/event/${eventId}/participants`)
            .then((res) => res.json())
            .then((data) => {
                const attendanceState = {};
                data.participants.forEach((p) => {
                    attendanceState[p.login] = p.attended;
                });
                setAttendance(attendanceState);
            });

        // Инфо о событии
        fetch(`${URL}/events/${eventId}`)
            .then((res) => res.json())
            .then(setEvent);

        // Загрузка групп и студентов с login
        fetch(`${URL}/groups`)
            .then((res) => res.json())
            .then(async (groupsData) => {
                const sectionsArr = [];
                for (const group of groupsData) {
                    const studentsRes = await fetch(
                        `${URL}/students?group_id=${group.id}`
                    );
                    const students = await studentsRes.json();
                    const studentsWithLogin = students.map((student) => ({
                        ...student,
                        login: student.login || student.id.toString(),
                    }));
                    sectionsArr.push({
                        title: group.curator
                            ? `${group.name} (Куратор: ${group.curator})`
                            : `${group.name} (Без куратора)`,
                        data:
                            studentsWithLogin.length > 0
                                ? studentsWithLogin
                                : [
                                      {
                                          id: "empty",
                                          fio: "Нет пользователей в группе",
                                      },
                                  ],
                        id: group.id,
                    });
                }
                setSections(sectionsArr);
            });

        // Уровень доступа
        AsyncStorage.getItem("authToken")
            .then((login) => fetch(`${URL}/user/access_level?login=${login}`))
            .then((res) => res.json())
            .then((data) => {
                setLevel(data.access_level);
            });
    }, [eventId]);

    const toggleGroup = (groupId) => {
        setExpandedGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }));
    };

    const handleSwitch = (login, val) => {
        fetch(`${URL}/event/${eventId}/participants/${login}/attendance`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                login: login,
            },
            body: JSON.stringify({ attended: val }),
        }).then(() => setAttendance((prev) => ({ ...prev, [login]: val })));
    };

    return event ? (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{event.title}</Text>
                <Text style={styles.headerTime}>
                    {event.date} {event.start_time}-{event.end_time}
                </Text>
                <Text style={styles.headerRoom}>
                    Аудитория: {event.auditorium || "—"}
                </Text>
            </View>

            <FlatList
                data={sections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item: group }) => (
                    <View>
                        <TouchableOpacity
                            style={styles.groupHeader}
                            onPress={() => toggleGroup(group.id)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.groupHeaderText}>
                                {group.title}
                            </Text>
                            <Text style={{ fontSize: 18 }}>
                                {expandedGroups[group.id] ? "▲" : "▼"}
                            </Text>
                        </TouchableOpacity>

                        {expandedGroups[group.id] && (
                            <FlatList
                                data={group.data}
                                keyExtractor={(user) =>
                                    user.id?.toString() || user.login
                                }
                                renderItem={({ item }) =>
                                    item.id === "empty" ? (
                                        <Text style={styles.emptyGroupText}>
                                            {item.fio}
                                        </Text>
                                    ) : (
                                        <View style={styles.userRow}>
                                            <Text>{item.fio}</Text>
                                            <Switch
                                                value={!!attendance[item.login]}
                                                onValueChange={(val) =>
                                                    handleSwitch(
                                                        item.login,
                                                        val
                                                    )
                                                }
                                                disabled={
                                                    !(
                                                        level === "админ" ||
                                                        level === "куратор"
                                                    )
                                                }
                                                trackColor={{
                                                    false: "#5e0000ff",
                                                    true: "#228B22cc",
                                                }}
                                                thumbColor={"#969696ff"}
                                                style={{
                                                    transform: [
                                                        { scaleX: 1.1 },
                                                        { scaleY: 1.1 },
                                                    ],
                                                }}
                                            />
                                        </View>
                                    )
                                }
                            />
                        )}
                    </View>
                )}
            />
        </View>
    ) : (
        <Text>Загрузка...</Text>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 16 },
    header: {
        marginBottom: 18,
        backgroundColor: "#eef4ff",
        borderRadius: 14,
        padding: 12,
    },
    headerTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
    headerTime: { fontSize: 16, color: "#337AFF", marginBottom: 4 },
    headerRoom: { fontSize: 14, color: "#777" },
    groupHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#d5e5ff",
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    groupHeaderText: { fontSize: 18, fontWeight: "bold" },
    emptyGroupText: {
        fontStyle: "italic",
        color: "#888",
        padding: 10,
    },
    userRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
});
