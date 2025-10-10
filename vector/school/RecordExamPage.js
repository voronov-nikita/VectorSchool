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
    const [level, setLevel] = useState("student");
    const [showAddModal, setShowAddModal] = useState(false);
    const [newExam, setNewExam] = useState({
        place: "",
        date: "",
        start: "",
        end: "",
    });
    const [myLogin, setMyLogin] = useState("");

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

    const handleSignup = (examId, booked) => {
        fetch(`${URL}/exam/${examId}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json", login: myLogin },
            body: JSON.stringify({ signup: !booked }),
        }).then(async (resp) => {
            if (!resp.ok) {
                const res = await resp.json();
                alert(res.error || "Слот занят");
            }
            fetchExams();
        });
    };

    const handleAddExam = () => {
        fetch(`${URL}/exams`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newExam),
        }).then(() => {
            setShowAddModal(false);
            setNewExam({ place: "", date: "", start: "", end: "" });
            fetchExams();
        });
    };

    const renderExam = ({ item }) => {
        const booked = item.booked_student === myLogin;
        const slotFree = !item.booked_student;
        return (
            <View style={styles.examCard}>
                <Text style={styles.examTitle}>{item.place}</Text>
                <Text style={styles.examTime}>
                    {item.date} {"\n"}{item.start}-{item.end}
                </Text>
                <Text style={styles.examBooked}>
                    {item.booked_student
                        ? `Записан: ${item.booked_student}`
                        : "Слот свободен"}
                </Text>

                {(slotFree || booked) && (
                    <TouchableOpacity
                        style={[
                            styles.signupBtn,
                            { backgroundColor: booked ? "#944e4eff" : "#278B22" },
                        ]}
                        onPress={() => handleSignup(item.id, booked)}
                    >
                        <Text style={{ color: "#fff" }}>
                            {booked ? "Отменить запись" : "Записаться"}
                        </Text>
                    </TouchableOpacity>
                )}
                {/* Если слот занят другим — никакой кнопки */}
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
                            placeholder="Аудитория"
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
    loginTag: {
        backgroundColor: "#b8eaff",
        margin: 3,
        padding: 5,
        borderRadius: 7,
        fontSize: 13,
        color: "#555",
    },
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
});
