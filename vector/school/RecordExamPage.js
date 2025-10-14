import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Button,
    Platform,
    KeyboardAvoidingView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { URL } from "../config";

export const RecordExamScreen = () => {
    const [exams, setExams] = useState([]);
    const [level, setLevel] = useState("боец");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newExam, setNewExam] = useState({
        place: "",
        date: "",
        start: "",
        end: "",
        capacity: "",
    });
    const [myLogin, setMyLogin] = useState("");
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        fetchExams();
        AsyncStorage.getItem("authToken").then((login) => {
            setMyLogin(login);
            fetch(`${URL}/user/access_level?login=${login}`)
                .then((res) => res.json())
                .then((data) => setLevel(data.access_level));
        });
    }, []);

    const fetchExams = () => {
        fetch(`${URL}/exams`)
            .then((res) => res.json())
            .then(setExams);
    };

    const showError = (message) => {
        setErrorMessage(message);
        setErrorModalVisible(true);
    };

    const handleSignup = (examId, booked) => {
        fetch(`${URL}/exam/${examId}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json", login: myLogin },
            body: JSON.stringify({ signup: !booked }),
        }).then(async (resp) => {
            if (!resp.ok) {
                const res = await resp.json();
                showError(res.error || "Слот занят");
            }
            fetchExams();
        });
    };

    const handleAddExam = () => {
        const capacityNum = parseInt(newExam.capacity, 10);
        if (isNaN(capacityNum) || capacityNum < 1) {
            showError(
                "Введите корректное количество мест (целое число от 1 и выше)"
            );
            return;
        }
        fetch(`${URL}/exams`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                place: newExam.place,
                date: newExam.date,
                start: newExam.start,
                end: newExam.end,
                capacity: capacityNum,
            }),
        }).then(() => {
            setShowAddModal(false);
            setNewExam({
                place: "",
                date: "",
                start: "",
                end: "",
                capacity: "1",
            });
            fetchExams();
        });
    };

    const renderExam = ({ item }) => {
        // booked_students — массив логинов студентов, записанных на экзамен (должен быть в API)
        const userBooked = item.booked_students?.includes(myLogin);
        const slotFree = item.available_seats > 0;

        return (
            <View style={styles.examCard}>
                <Text style={styles.examTitle}>{item.place}</Text>
                <Text style={styles.examTime}>
                    {item.date} {"\n"}
                    {item.start}-{item.end}
                </Text>
                <Text style={styles.examBooked}>
                    {item.booked_count > 0
                        ? `${item.booked_count} из ${item.capacity} мест занято`
                        : "Слотов свободно: " + item.capacity}
                </Text>
                {(slotFree || userBooked) && (
                    <TouchableOpacity
                        style={[
                            styles.signupBtn,
                            {
                                backgroundColor: userBooked
                                    ? "#944e4eff"
                                    : "#278B22",
                            },
                        ]}
                        onPress={() => handleSignup(item.id, userBooked)}
                    >
                        <Text style={{ color: "#fff" }}>
                            {userBooked ? "Отменить запись" : "Записаться"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={exams}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderExam}
            />

            {level === "админ" && (
                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.8}
                    onPress={() => setShowAddModal(true)}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}

            <Modal visible={showAddModal} transparent animationType="slide">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalBox}>
                        <Text
                            style={{
                                fontWeight: "bold",
                                fontSize: 17,
                                marginBottom: 10,
                            }}
                        >
                            Добавить экзамен
                        </Text>
                        <TextInput
                            placeholder="Место"
                            style={styles.input}
                            value={newExam.place}
                            onChangeText={(v) =>
                                setNewExam((n) => ({ ...n, place: v }))
                            }
                        />
                        <TextInput
                            placeholder="Дата (YYYY-MM-DD)"
                            style={styles.input}
                            value={newExam.date}
                            onChangeText={(v) =>
                                setNewExam((n) => ({ ...n, date: v }))
                            }
                        />
                        <TextInput
                            placeholder="Время начала (HH:MM)"
                            style={styles.input}
                            value={newExam.start}
                            onChangeText={(v) =>
                                setNewExam((n) => ({ ...n, start: v }))
                            }
                        />
                        <TextInput
                            placeholder="Время конца (HH:MM)"
                            style={styles.input}
                            value={newExam.end}
                            onChangeText={(v) =>
                                setNewExam((n) => ({ ...n, end: v }))
                            }
                        />
                        <TextInput
                            placeholder="Количество мест"
                            style={styles.input}
                            keyboardType="numeric"
                            value={newExam.capacity}
                            onChangeText={(v) =>
                                setNewExam((n) => ({ ...n, capacity: v }))
                            }
                        />
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Button
                                title="Сохранить"
                                onPress={handleAddExam}
                                color="#278B22"
                            />
                            <Button
                                title="Отмена"
                                onPress={() => setShowAddModal(false)}
                                color="#888"
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            <Modal
                visible={errorModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setErrorModalVisible(false)}
            >
                <View style={styles.errorModalOverlay}>
                    <View style={styles.errorModalBox}>
                        <Text style={styles.errorModalText}>
                            {errorMessage}
                        </Text>
                        <Button
                            title="Закрыть"
                            onPress={() => setErrorModalVisible(false)}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 16 },
    examCard: {
        backgroundColor: "#e9f5ff",
        padding: 14,
        borderRadius: 12,
        marginBottom: 14,
    },
    examTitle: { fontSize: 19, fontWeight: "bold" },
    examTime: { fontSize: 15, marginVertical: 3, color: "#337AFF" },
    examBooked: { fontSize: 13, color: "#666" },
    signupBtn: {
        marginTop: 11,
        padding: 10,
        borderRadius: 7,
        alignItems: "center",
    },
    fab: {
        position: "absolute",
        bottom: 28,
        left: 22,
        backgroundColor: "#337AFF",
        borderRadius: 29,
        width: 58,
        height: 58,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.17,
        shadowRadius: 5,
        elevation: 7,
    },
    fabText: { fontSize: 34, color: "#fff", fontWeight: "bold" },
    modalOverlay: {
        flex: 1,
        backgroundColor: "#0007",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 18,
        width: 320,
    },
    input: {
        borderBottomWidth: 1,
        borderColor: "#a0bfff",
        marginVertical: 7,
        padding: 7,
        fontSize: 15,
    },
    errorModalOverlay: {
        flex: 1,
        backgroundColor: "#00000099",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    errorModalBox: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        width: 300,
        alignItems: "center",
    },
    errorModalText: {
        fontSize: 16,
        marginBottom: 20,
        color: "#cc0000",
        textAlign: "center",
    },
});
