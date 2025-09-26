import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, Switch } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { URL } from "../config";

export const AttendanceScreen = ({ route }) => {
    const { eventId } = route.params;
    const [event, setEvent] = useState(null);
    const [users, setUsers] = useState([]);
    const [level, setLevel] = useState("боец");
    const [attendance, setAttendance] = useState({});

    useEffect(() => {
        // Получаем инфо о событии
        fetch(`${URL}/events/${eventId}`)
            .then((res) => res.json())
            .then(setEvent);

        // Получаем список пользователей
        fetch(`${URL}/users`)
            .then((res) => res.json())
            .then((data) => setUsers(data.fighters));

        // Получаем уровень доступа
        AsyncStorage.getItem("authToken")
            .then((login) => fetch(`${URL}/user/access_level?login=${login}`))
            .then((res) => res.json())
            .then((data) => {
                setLevel(data.access_level);
            });
    }, [eventId]);

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
                    Аудитория: {event.room || "—"}
                </Text>
            </View>
            <FlatList
                data={users}
                renderItem={({ item }) => (
                    <View style={styles.userRow}>
                        <Text>{item.fio}</Text>
                        <Switch
                            value={!!attendance[item.login]}
                            onValueChange={(val) =>
                                handleSwitch(item.login, val)
                            }
                            disabled={
                                !(level === "админ" || level === "куратор")
                            }
                        />
                    </View>
                )}
                keyExtractor={(item) => item.login}
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
    userRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#eee",
    },
});
