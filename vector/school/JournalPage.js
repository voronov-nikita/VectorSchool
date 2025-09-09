import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, Alert } from "react-native";
import axios from "axios";

import { URL } from "../config";

export const JournalScreen = () => {
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [journal, setJournal] = useState({
        students: [],
        lessons: [],
        attendance: [],
    });
    const [userRole, setUserRole] = useState("student"); // 'admin', 'curator', 'user'

    useEffect(() => {
        axios.get(`${URL}/groups`).then((res) => setGroups(res.data));
    }, []);

    useEffect(() => {
        if (selectedGroup) {
            axios
                .get(`${URL}/journal?group_id=${selectedGroup}`)
                .then((res) => setJournal(res.data));
        }
    }, [selectedGroup]);

    const handleChangeStatus = (student_id, lesson_id, currentStatus) => {
        if (userRole !== "admin" && userRole !== "curator" && userRole !== "student") return;
        const newStatus = currentStatus === "Н" ? "+" : "Н";
        axios
            .post(`${URL}/attendance`, {
                student_id,
                lesson_id,
                status: newStatus,
            })
            .then(() => {
                // Refresh
                axios
                    .get(`${URL}/journal?group_id=${selectedGroup}`)
                    .then((res) => setJournal(res.data));
            });
    };

    return (
        <ScrollView horizontal>
            <View>
                {/* Список групп */}
                <View style={{ flexDirection: "row" }}>
                    {groups.map((g) => (
                        <TouchableOpacity
                            key={g}
                            onPress={() => setSelectedGroup(g)}
                        >
                            <Text style={{ marginRight: 16 }}>{g[1]}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                {/* Таблица журнала */}
                <View>
                    <View style={{ flexDirection: "row" }}>
                        <Text style={{ width: 120, fontWeight: "bold" }}>
                            Студент
                        </Text>
                        {journal.lessons.map((l) => (
                            <Text
                                key={l}
                                style={{ marginHorizontal: 6, width: 60 }}
                            >
                                {l} {l}
                            </Text>
                        ))}
                    </View>
                    {journal.students.map((s) => (
                        <View key={s} style={{ flexDirection: "row" }}>
                            <Text style={{ width: 120 }}>{s[1]}</Text>
                            {journal.lessons.map((l) => {
                                const rec = journal.attendance.find(
                                    (a) => a[1] === s && a === l
                                );
                                const status = rec ? rec : "Н";
                                return (
                                    <TouchableOpacity
                                        key={l}
                                        onPress={() =>
                                            handleChangeStatus(s, l, status)
                                        }
                                    >
                                        <Text
                                            style={{
                                                width: 60,
                                                textAlign: "center",
                                                color:
                                                    status === "+"
                                                        ? "green"
                                                        : "red",
                                            }}
                                        >
                                            {status}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </View>
        </ScrollView>
    );
}
