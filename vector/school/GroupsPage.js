import React, { useState, useEffect } from "react";
import {
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Modal,
    Alert,
} from "react-native";

import { URL } from "../config";

export const SchoolGroupsScreen = ({ navigation }) => {
    const [groups, setGroups] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [curator, setCurator] = useState("");

    const fetchGroups = () => {
        fetch(`${URL}/groups`)
            .then((res) => res.json())
            .then((data) => setGroups(data))
            .catch((e) => console.error("Ошибка API /groups", e));
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleAddGroup = () => {
        if (!groupName.trim() || !curator.trim()) {
            Alert.alert("Ошибка", "Заполните все поля");
            return;
        }
        fetch(`${URL}/groups`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: groupName.trim(),
                curator: curator.trim(),
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    Alert.alert("Ошибка", data.error);
                } else {
                    Alert.alert("Успех", "Группа добавлена");
                    setModalVisible(false);
                    setGroupName("");
                    setCurator("");
                    fetchGroups();
                }
            })
            .catch((e) => {
                Alert.alert("Ошибка", "Не удалось добавить группу");
            });
    };

    return (
        <View style={styles.container}>
            {/* <BackButton /> */}
            <ScrollView>
                {groups.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={styles.card}
                        onPress={() =>
                            navigation.navigate("SchoolOneGroup", {
                                groupId: item.id,
                            })
                        }
                    >
                        <Text style={styles.title}>{item.name}</Text>
                        <Text style={styles.description}>
                            Куратор: {item.curator}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            {/* Кнопка Добавить Группу */}
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
                        <Text style={styles.modalTitle}>Добавить группу</Text>
                        <TextInput
                            placeholder="Название группы"
                            value={groupName}
                            onChangeText={setGroupName}
                            style={styles.input}
                        />
                        <TextInput
                            placeholder="Куратор группы"
                            value={curator}
                            onChangeText={setCurator}
                            style={styles.input}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={styles.modalButton}
                                onPress={handleAddGroup}
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
    container: { flex: 1, backgroundColor: "#fff", padding: 20 },
    card: {
        backgroundColor: "#f1f1f1",
        marginVertical: 6,
        padding: 12,
        borderRadius: 6,
    },
    title: { fontSize: 16, fontWeight: "bold" },
    description: { fontSize: 14, color: "#666" },
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
        width: "80%",
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
