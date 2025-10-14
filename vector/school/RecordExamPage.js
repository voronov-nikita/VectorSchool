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
    Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { URL } from "../config";

// Формат даты и времени
const formatDateForDisplay = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
};
const formatTimeForDisplay = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
};

// DatePicker для web и мобильных
const DatePicker = ({ date, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);
    if (Platform.OS === "web") {
        return (
            <input
                type="date"
                value={date.toISOString().split("T")[0]}
                onChange={(e) => onChange(new Date(e.target.value))}
                style={styles.webInput}
            />
        );
    }
    const onChangeNative = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) onChange(selectedDate);
    };
    return (
        <View>
            <TouchableOpacity
                onPress={() => setShowPicker(true)}
                style={styles.mobileButton}
            >
                <Text>{formatDateForDisplay(date)}</Text>
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChangeNative}
                />
            )}
        </View>
    );
};

// TimePicker для web и мобильных
const TimePicker = ({ time, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);
    if (Platform.OS === "web") {
        return (
            <input
                type="time"
                value={time.toTimeString().slice(0, 5)}
                onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(":");
                    const newDate = new Date(time);
                    newDate.setHours(Number(hours));
                    newDate.setMinutes(Number(minutes));
                    onChange(newDate);
                }}
                style={styles.webInput}
            />
        );
    }
    const onChangeNative = (event, selectedTime) => {
        setShowPicker(false);
        if (selectedTime) onChange(selectedTime);
    };
    return (
        <View>
            <TouchableOpacity
                onPress={() => setShowPicker(true)}
                style={styles.mobileButton}
            >
                <Text>{formatTimeForDisplay(time)}</Text>
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={time}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onChangeNative}
                />
            )}
        </View>
    );
};

const ADDRESS_OPTIONS = ["проспект Вернадского 86", "проспект Вернадского 78"];
const EXAM_TYPE_OPTIONS = [
    "Все",
    "Экзамен на интеллектуала",
    "Экзамен на экскурсовода",
    "Экзамен на консультанта",
    "Общий экзамен",
];

export const RecordExamScreen = () => {
    const [exams, setExams] = useState([]);
    const [level, setLevel] = useState("боец");
    const [filterExamType, setFilterExamType] = useState("Все");
    const [filterAddress, setFilterAddress] = useState("Все");
    const [showModal, setShowModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);
    const [form, setForm] = useState({
        address: ADDRESS_OPTIONS[0],
        auditorium: "",
        examType: EXAM_TYPE_OPTIONS[1], // по умолчанию первый экзамен, кроме "Все"
        date: new Date(),
        start: new Date(),
        end: new Date(),
        capacity: "",
    });
    const [myLogin, setMyLogin] = useState("");
    const [errorModalVisible, setErrorModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [confirmDeleteExam, setConfirmDeleteExam] = useState(null);

    useEffect(() => {
        fetchExams();
        AsyncStorage.getItem("authToken").then((login) => {
            setMyLogin(login);
            fetch(`${URL}/user/access_level?login=${login}`)
                .then((res) => res.json())
                .then((data) => setLevel(data.access_level))
                .catch(() => setLevel("боец"));
        });
    }, []);

    const fetchExams = () => {
        fetch(`${URL}/exams`)
            .then((res) => res.json())
            .then(setExams)
            .catch(() => showError("Ошибка загрузки экзаменов"));
    };

    const showError = (msg) => {
        setErrorMessage(msg);
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

    const startEditExam = (exam) => {
        setEditingExam(exam);
        setForm({
            address: exam.address,
            auditorium: exam.auditorium,
            examType: exam.examType || EXAM_TYPE_OPTIONS[1],
            date: exam.date ? new Date(exam.date) : new Date(),
            start: exam.start
                ? new Date(`1970-01-01T${exam.start}:00`)
                : new Date(),
            end: exam.end ? new Date(`1970-01-01T${exam.end}:00`) : new Date(),
            capacity: String(exam.capacity),
        });
        setShowModal(true);
    };

    const startAddExam = () => {
        setEditingExam(null);
        setForm({
            address: ADDRESS_OPTIONS[0],
            auditorium: "",
            examType: EXAM_TYPE_OPTIONS[1],
            date: new Date(),
            start: new Date(),
            end: new Date(),
            capacity: "1",
        });
        setShowModal(true);
    };

    const handleDeleteExam = (examId) => {
        setConfirmDeleteExam(examId);
    };

    const handleSaveExam = () => {
        const capacityNum = parseInt(form.capacity, 10);
        if (isNaN(capacityNum) || capacityNum < 1) {
            showError(
                "Введите корректное количество мест (целое число от 1 и выше)"
            );
            return;
        }
        if (form.end <= form.start) {
            showError("Время окончания должно быть позже времени начала");
            return;
        }
        const dateStr = form.date.toISOString().split("T")[0];
        const startStr = formatTimeForDisplay(form.start);
        const endStr = formatTimeForDisplay(form.end);

        const payload = {
            address: form.address,
            auditorium: form.auditorium,
            examType: form.examType,
            date: dateStr,
            start: startStr,
            end: endStr,
            capacity: capacityNum,
        };

        let url = `${URL}/exams`;
        let method = "POST";

        if (editingExam) {
            url = `${URL}/exams/${editingExam.id}/edit`;
            method = "POST";
        }

        fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then(() => {
                setShowModal(false);
                fetchExams();
            })
            .catch(() => showError("Ошибка сохранения экзамена"));
    };

    const examsFiltered = (
        filterExamType === "Все"
            ? exams
            : exams.filter((e) => e.examType === filterExamType)
    ).filter((e) =>
        filterAddress === "Все" ? true : e.address === filterAddress
    );

    const isAdminOrCurator = ["админ", "куратор"].includes(level);

    const renderExam = ({ item }) => {
        const userBooked = item.booked_students?.some(
            (student) => student.login === myLogin
        );
        const slotFree = item.available_seats > 0;
        const place = `${item.address}, ауд. ${item.auditorium}`;

        return (
            <View style={styles.examCard}>
                <Text style={styles.examTitle}>{place}</Text>
                <Text style={styles.examTime}>
                    {formatDateForDisplay(item.date)}
                    {"\n"}
                    {item.start}-{item.end}
                </Text>
                <Text
                    style={[
                        styles.examBooked,
                        { fontStyle: "italic", marginBottom: 5 },
                    ]}
                >
                    {item.examType}
                </Text>
                <Text style={{ fontWeight: "bold" }}>Записались:</Text>
                {item.booked_students && item.booked_students.length > 0 ? (
                    item.booked_students.map((student, idx) =>
                        isAdminOrCurator ? (
                            <Text
                                key={idx}
                                style={{ fontSize: 13, color: "#337AFF" }}
                                onPress={() => {
                                    if (student.telegram) {
                                        let urlTG = student.telegram.startsWith(
                                            "@"
                                        )
                                            ? student.telegram.slice(1)
                                            : student.telegram;
                                        if (!urlTG.startsWith("http")) {
                                            urlTG = "https://t.me/" + urlTG;
                                        }
                                        Linking.openURL(urlTG);
                                    }
                                }}
                            >
                                {student.fio}
                            </Text>
                        ) : (
                            <Text
                                key={idx}
                                style={{ fontSize: 13, color: "#444" }}
                            >
                                {student.fio}
                            </Text>
                        )
                    )
                ) : (
                    <Text style={{ color: "#666" }}>Нет записавшихся</Text>
                )}
                {!isAdminOrCurator && (slotFree || userBooked) && (
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
                {["админ", "куратор"].includes(level) && (
                    <View style={{ flexDirection: "row", marginTop: 10 }}>
                        <TouchableOpacity
                            style={styles.editBtn}
                            onPress={() => startEditExam(item)}
                        >
                            <Text style={{ color: "#fff" }}>Редактировать</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.deleteBtn}
                            onPress={() => handleDeleteExam(item.id)}
                        >
                            <Text style={{ color: "#fff" }}>Удалить</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Фильтр записей на экзамены:</Text>
            <Picker
                selectedValue={filterExamType}
                onValueChange={setFilterExamType}
                style={styles.picker}
            >
                {EXAM_TYPE_OPTIONS.map((type) => (
                    <Picker.Item key={type} label={type} value={type} />
                ))}
            </Picker>
            <Picker
                selectedValue={filterAddress}
                onValueChange={setFilterAddress}
                style={styles.picker}
            >
                <Picker.Item key="Все" label="Все" value="Все" />
                {ADDRESS_OPTIONS.map((addr) => (
                    <Picker.Item key={addr} label={addr} value={addr} />
                ))}
            </Picker>

            <FlatList
                data={examsFiltered}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderExam}
            />

            {["админ", "куратор"].includes(level) && (
                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.8}
                    onPress={startAddExam}
                >
                    <Text style={styles.fabText}>+</Text>
                </TouchableOpacity>
            )}

            <Modal
                visible={!!confirmDeleteExam}
                transparent
                animationType="fade"
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={{ textAlign: "center", marginBottom: 10 }}>
                            Вы уверены, что хотите удалить этот экзамен?
                        </Text>
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Button
                                title="Удалить"
                                color="#da2222"
                                onPress={() => {
                                    fetch(`${URL}/exams/${confirmDeleteExam}`, {
                                        method: "DELETE",
                                    })
                                        .then(() => {
                                            setConfirmDeleteExam(null);
                                            fetchExams();
                                        })
                                        .catch(() => {
                                            setConfirmDeleteExam(null);
                                            showError("Ошибка удаления");
                                        });
                                }}
                            />
                            <Button
                                title="Отмена"
                                color="#888"
                                onPress={() => setConfirmDeleteExam(null)}
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={showModal} transparent animationType="slide">
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
                            {editingExam
                                ? "Редактировать экзамен"
                                : "Добавить экзамен"}
                        </Text>

                        <Text style={styles.label}>Адрес</Text>
                        <Picker
                            selectedValue={form.address}
                            onValueChange={(value) =>
                                setForm((f) => ({ ...f, address: value }))
                            }
                            style={styles.picker}
                        >
                            {ADDRESS_OPTIONS.map((addr) => (
                                <Picker.Item
                                    key={addr}
                                    label={addr}
                                    value={addr}
                                />
                            ))}
                        </Picker>

                        <Text style={styles.label}>Аудитория</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Введите аудиторию"
                            value={form.auditorium}
                            onChangeText={(auditorium) =>
                                setForm((f) => ({ ...f, auditorium }))
                            }
                        />

                        <Text style={styles.label}>Тип экзамена</Text>
                        <Picker
                            selectedValue={form.examType}
                            onValueChange={(value) =>
                                setForm((f) => ({ ...f, examType: value }))
                            }
                            style={styles.picker}
                        >
                            {EXAM_TYPE_OPTIONS.slice(1).map((type) => (
                                <Picker.Item
                                    key={type}
                                    label={type}
                                    value={type}
                                />
                            ))}
                        </Picker>

                        <Text style={styles.label}>Дата</Text>
                        <DatePicker
                            date={form.date}
                            onChange={(date) =>
                                setForm((f) => ({ ...f, date }))
                            }
                        />

                        <Text style={styles.label}>Время начала</Text>
                        <TimePicker
                            time={form.start}
                            onChange={(start) =>
                                setForm((f) => ({ ...f, start }))
                            }
                        />

                        <Text style={styles.label}>Время конца</Text>
                        <TimePicker
                            time={form.end}
                            onChange={(end) => setForm((f) => ({ ...f, end }))}
                        />

                        <Text style={styles.label}>Количество мест</Text>
                        <TextInput
                            style={styles.input}
                            keyboardType="numeric"
                            value={form.capacity}
                            onChangeText={(v) =>
                                setForm((f) => ({ ...f, capacity: v }))
                            }
                        />

                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                                marginTop: 15,
                            }}
                        >
                            <Button
                                title="Сохранить"
                                color="#278B22"
                                onPress={handleSaveExam}
                            />
                            <Button
                                title="Отмена"
                                color="#888"
                                onPress={() => setShowModal(false)}
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
    label: {
        fontWeight: "bold",
        marginTop: 10,
        marginBottom: 5,
    },
    picker: {
        backgroundColor: "#bed4e8ff",
        borderRadius: 6,
        margin: 5,
        padding: 8,
        width: "100%",
    },
    webInput: {
        padding: 8,
        borderRadius: 6,
        borderColor: "#a0bfff",
        borderWidth: 1,
        fontSize: 16,
        width: 150,
        marginBottom: 8,
    },
    mobileButton: {
        padding: 10,
        backgroundColor: "#e9f5ff",
        borderRadius: 6,
        marginBottom: 8,
    },
    editBtn: {
        backgroundColor: "#337AFF",
        borderRadius: 7,
        paddingVertical: 8,
        paddingHorizontal: 14,
        marginRight: 10,
    },
    deleteBtn: {
        backgroundColor: "#da2222",
        borderRadius: 7,
        paddingVertical: 8,
        paddingHorizontal: 14,
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
