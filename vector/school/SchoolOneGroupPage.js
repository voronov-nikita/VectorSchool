import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Modal,
    FlatList,
    TextInput,
    Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { URL } from "../config";

export const SchoolOneGroupScreen = ({ route, navigation }) => {
    const { groupId, groupName } = route.params;
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    const [addVisible, setAddVisible] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchText, setSearchText] = useState("");
    const [toAddId, setToAddId] = useState(null);
    const [level, setLevel] = useState("боец");
    const [studentToDelete, setStudentToDelete] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, [groupId]);

    useEffect(async () => {
        
        const login = await AsyncStorage.getItem("authToken").then();

        try {
            const response = fetch(`${URL}/user/access_level?login=${login}`);
            const data = response.json();

            if (response.ok) {
                setLevel(data.access_level);
            } else {
                console.warn("Ошибка сервера:", data.error);
                return null;
            }
        } catch (error) {
            console.error("Ошибка сети:", error);
            return null;
        }
    }, []);

    const fetchStudents = () => {
        setLoading(true);
        fetch(`${URL}/students?group_id=${groupId}`)
            .then((res) => res.json())
            .then(setStudents)
            .catch(() => Alert.alert("Ошибка загрузки"))
            .finally(() => setLoading(false));
    };

    const handleAttendance = (studentId, delta) => {
        fetch(`${URL}/students/${studentId}/attendance`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ delta }),
        })
            .then((res) => res.json())
            .then((data) => {
                setStudents((prev) =>
                    prev.map((st) =>
                        st.id === studentId
                            ? { ...st, attendance: data.attendance }
                            : st
                    )
                );
            })
            .catch(() => Alert.alert("Ошибка обновления"));
    };

    const handleDelete = () => {
        fetch(`${URL}/students/${studentToDelete}`, { method: "DELETE" })
            .then(() => {
                setStudents((prev) =>
                    prev.filter((st) => st.id !== studentToDelete)
                );
                setStudentToDelete(null);
            })
            .catch(() => Alert.alert("Ошибка удаления"));
    };

    // костыль добавления индификатора
    const normalizeUsersWithId = (users) => {
        return users.map((user, index) => ({
            ...user,
            id: index + 1, // генерируем id начиная с 1
        }));
    };

    const openAddModal = () => {
        fetch(`${URL}/users`)
            .then((res) => res.json())
            .then((data) => {
                // Получаем всех пользователей из ответа
                const allUsersArray = data.fighters || data.users || [];
                // Собираем id учеников, уже в группе
                const existingIds = new Set(students.map((s) => s.id));
                // Фильтруем пользователей, убрать тех, кто уже есть
                const filteredUsers = allUsersArray.filter(
                    (u) => !existingIds.has(u.id)
                );

                // Если необходимо, сгенерировать id, если их вдруг нет:
                const normalizedUsers = filteredUsers.map((u, idx) =>
                    u.id ? u : { ...u, id: idx + 1 }
                );

                setAllUsers(normalizedUsers);
                setFilteredUsers(normalizedUsers);
                setAddVisible(true);
                setSearch("");
                setToAddId(null);
            })
            .catch(() => Alert.alert("Ошибка загрузки"));
    };

    const onSearchChange = (text) => {
        setSearchText(text);
        const filtered = allUsers.filter((user) =>
            user.fio.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredUsers(filtered);
        console.log(allUsers);
        console.log(filteredUsers);
    };

    const handleAddUser = () => {
        if (!toAddId) return;
        const user = allUsers.find((u) => u.id === toAddId);
        if (!user) return;

        fetch(`${URL}/students`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fio: user.fio,
                group_id: groupId,
            }),
        })
            .then(() => {
                setAddVisible(false);
                setToAddId(null);
                fetchStudents();
            })
            .catch(() => Alert.alert("Ошибка добавления"));
    };

    if (loading)
        return (
            <View style={styles.centered}>
                <Text>Загрузка...</Text>
            </View>
        );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Студенты группы: {groupName}</Text>
            <ScrollView>
                {students.length === 0 && (
                    <Text style={{ paddingVertical: 10 }}>
                        В группе пока нет студентов.
                    </Text>
                )}
                {students.map((student) => (
                    <View key={student.id} style={styles.studentRow}>
                        <Text style={styles.studentName}>{student.fio}</Text>
                        {["куратор", "админ"].includes(level) ? (
                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[
                                        styles.attendanceBtn,
                                        styles.minusBtn,
                                    ]}
                                    onPress={() =>
                                        handleAttendance(student.id, -1)
                                    }
                                >
                                    <Text style={styles.attendanceText}>-</Text>
                                </TouchableOpacity>
                                <Text style={styles.attendanceCount}>
                                    {student.attendance ?? 0}
                                </Text>
                                <TouchableOpacity
                                    style={[
                                        styles.attendanceBtn,
                                        styles.plusBtn,
                                    ]}
                                    onPress={() =>
                                        handleAttendance(student.id, 1)
                                    }
                                >
                                    <Text style={styles.attendanceText}>+</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.deleteBtn}
                                    onPress={() =>
                                        setStudentToDelete(student.id)
                                    }
                                >
                                    <Text style={styles.deleteBtnText}>
                                        Удалить
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </View>
                ))}
            </ScrollView>

            {["куратор", "админ"].includes(level) ? (
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={openAddModal}
                >
                    <Text style={styles.addButtonText}>Добавить</Text>
                </TouchableOpacity>
            ) : null}

            {/* Добавление студента */}
            <Modal visible={addVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Выберите студента</Text>
                        <TextInput
                            value={searchText}
                            onChangeText={onSearchChange}
                            placeholder="Поиск по имени"
                            style={styles.searchInput}
                        />
                        <FlatList
                            data={filteredUsers}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.modalListItem,
                                        toAddId === item.id &&
                                            styles.modalListItemSelected,
                                    ]}
                                    onPress={() => setToAddId(item.id)}
                                >
                                    <Text style={styles.modalListText}>
                                        {item.fio}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            style={{ maxHeight: 200 }}
                        />
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                disabled={!toAddId}
                                onPress={handleAddUser}
                                style={[
                                    styles.confirmButton,
                                    {
                                        backgroundColor: toAddId
                                            ? "#1976d2"
                                            : "#aaa",
                                    },
                                ]}
                            >
                                <Text style={styles.confirmButtonText}>
                                    Добавить
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setAddVisible(false)}
                                style={[styles.cancelButton]}
                            >
                                <Text style={styles.cancelButtonText}>
                                    Отмена
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Удаление студента */}
            <Modal visible={!!studentToDelete} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Удалить студента?</Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={handleDelete}
                                style={[
                                    styles.confirmButton,
                                    { backgroundColor: "#d32f2f" },
                                ]}
                            >
                                <Text style={styles.confirmButtonText}>Да</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setStudentToDelete(null)}
                                style={[styles.cancelButton]}
                            >
                                <Text style={styles.cancelButtonText}>Нет</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: "#fff" },
    header: { fontSize: 22, fontWeight: "700", marginBottom: 10 },
    studentRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: "#f5f5f5",
        marginBottom: 10,
        borderRadius: 6,
        justifyContent: "space-between",
    },
    studentName: { fontSize: 18 },
    actions: {
        flexDirection: "row",
        alignItems: "center",
    },
    attendanceBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        marginHorizontal: 5,
    },
    minusBtn: { backgroundColor: "#eee" },
    plusBtn: { backgroundColor: "#4caf50" },
    attendanceText: { fontSize: 22, fontWeight: "700" },
    attendanceCount: {
        fontSize: 18,
        width: 24,
        textAlign: "center",
        fontWeight: "600",
    },
    deleteBtn: {
        backgroundColor: "#d32f2f",
        borderRadius: 6,
        paddingVertical: 6,
        paddingHorizontal: 15,
        marginLeft: 10,
    },
    deleteBtnText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    addButton: {
        position: "absolute",
        bottom: 34,
        left: 28,
        backgroundColor: "#1976d2",
        paddingVertical: 12,
        paddingHorizontal: 25,
        borderRadius: 22,
        elevation: 6,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 18,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.25)",
    },
    modalContent: {
        width: "85%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 15,
        textAlign: "center",
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 10,
    },
    modalListItem: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    modalListItemSelected: {
        backgroundColor: "#dbeafe",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    confirmButton: {
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 8,
    },
    confirmButtonText: {
        color: "#fff",
        fontWeight: "700",
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 8,
        backgroundColor: "#aaa",
        alignItems: "center",
    },
    cancelButtonText: {
        color: "#fff",
        fontWeight: "700",
    },
});
