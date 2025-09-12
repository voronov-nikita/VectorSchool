import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
} from "react-native";

import { URL } from "../config";

export const SchoolOneGroupScreen = ({ route }) => {
    const { groupId, groupName } = route.params;
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Для модального окна
    const [modalVisible, setModalVisible] = useState(false);
    const [fio, setFio] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [telegramId, setTelegramId] = useState("");

    // Загрузка студентов группы
    const fetchStudents = () => {
        setLoading(true);
        fetch(`${URL}/students?group_id=${groupId}`)
            .then((res) => res.json())
            .then((data) => {
                setStudents(data);
                setLoading(false);
            })
            .catch((e) => {
                console.error("Ошибка API /students", e);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchStudents();
    }, [groupId]);

    // Обработка добавления студента
    const handleAddStudent = () => {
        if (!fio.trim()) {
            Alert.alert("Ошибка", "Введите ФИО");
            return;
        }
        // Дополнительно можно проверить формат даты и telegramId
        fetch(`${URL}/students`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                fio: fio.trim(),
                birth_date: birthDate.trim(),
                telegram_id: telegramId.trim(),
                group_id: groupId,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    Alert.alert("Ошибка", data.error);
                } else {
                    Alert.alert("Успех", "Студент добавлен");
                    setModalVisible(false);
                    setFio("");
                    setBirthDate("");
                    setTelegramId("");
                    fetchStudents();
                }
            })
            .catch(() => {
                Alert.alert("Ошибка", "Не удалось добавить студента");
            });
    };

    if (loading) {
        return <ActivityIndicator style={{ marginTop: 30 }} />;
    }

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container}>
                <Text style={styles.header}>Студенты группы: {groupName}</Text>
                {students.map((student) => (
                    <View key={student.id} style={styles.card}>
                        <Text style={styles.name}>{student.fio}</Text>
                    </View>
                ))}
                {students.length === 0 && <Text>Студентов нет</Text>}
            </ScrollView>

            {/* Кнопка добавления */}
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>

            {/* Модальное окно */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Добавить студента</Text>
                        <TextInput
                            placeholder="ФИО"
                            value={fio}
                            onChangeText={setFio}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Дата рождения (например, 01.01.2000)"
                            value={birthDate}
                            onChangeText={setBirthDate}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="ID Telegram"
                            value={telegramId}
                            onChangeText={setTelegramId}
                            style={styles.input}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={handleAddStudent}
                            >
                                <Text style={styles.modalButtonText}>
                                    Сохранить
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.modalButton,
                                    styles.modalButtonCancel,
                                ]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>
                                    Отмена
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: "#fff" },
    header: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
    card: {
        backgroundColor: "#f9f9f9",
        padding: 12,
        marginVertical: 6,
        borderRadius: 6,
    },
    name: { fontSize: 16 },

    addButton: {
        position: "absolute",
        bottom: 30,
        right: 30,
        backgroundColor: "#1976d2",
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },
    addButtonText: { color: "#fff", fontSize: 32, lineHeight: 34 },

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        width: "85%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 8,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        padding: 10,
        marginBottom: 12,
        fontSize: 16,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    modalButton: {
        backgroundColor: "#1976d2",
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 6,
    },
    modalButtonCancel: {
        backgroundColor: "#aaa",
    },
    modalButtonText: {
        color: "#fff",
        fontSize: 16,
    },
});
