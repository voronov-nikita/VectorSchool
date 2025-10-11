import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Button,
    StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import { URL } from "../config";

export const HomeworkScreen = () => {
    const [sections, setSections] = useState([]);
    const [showAddSection, setShowAddSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState("");
    const [confirmSection, setConfirmSection] = useState(null);
    const navigation = useNavigation();
    const [level, setLevel] = useState("боец");

    useEffect(() => {
        getAccess();
        fetchSections();
    }, []);

    const fetchSections = () => {
        fetch(`${URL}/homework_sections`)
            .then((res) => res.json())
            .then(setSections);
    };

    const getAccess = async () => {
        const login = await AsyncStorage.getItem("authToken").then();
        try {
            const response = await fetch(
                `${URL}/user/access_level?login=${login}`
            );
            const data = await response.json();

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
    };

    const handleAddSection = () => {
        fetch(`${URL}/homework_sections`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: newSectionTitle }),
        }).then(() => {
            setShowAddSection(false);
            setNewSectionTitle("");
            fetchSections();
        });
    };

    const handleDeleteSection = () => {
        fetch(`${URL}/homework_sections/${confirmSection.id}`, {
            method: "DELETE",
        }).then(() => {
            setConfirmSection(null);
            fetchSections();
        });
    };

    const renderItem = ({ item }) => (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                marginVertical: 3,
            }}
        >
            <TouchableOpacity
                style={styles.sectionBtn}
                onPress={() =>
                    navigation.navigate("HomeworkOne", {
                        sectionId: item.id,
                        sectionTitle: item.title,
                    })
                }
            >
                <Text style={styles.sectionText}>{item.title}</Text>
            </TouchableOpacity>
            {["админ"].includes(level) ? (
                <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => setConfirmSection(item)}
                >
                    <AntDesign name="delete" size={22} color="#fff" />
                </TouchableOpacity>
            ) : null}
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={sections}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.empty}>Нет разделов</Text>
                }
            />
            {["админ"].includes(level) && (
                <TouchableOpacity
                    style={styles.addSectionBtn}
                    onPress={() => setShowAddSection(true)}
                >
                    <AntDesign name="pluscircleo" size={22} color="#fff" />
                    <Text style={{ color: "#fff", marginLeft: 8 }}>
                        Добавить раздел
                    </Text>
                </TouchableOpacity>
            )}

            {/* Новый раздел */}
            <Modal visible={showAddSection} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                            Добавить раздел
                        </Text>
                        <TextInput
                            placeholder="Название раздела"
                            style={styles.input}
                            value={newSectionTitle}
                            onChangeText={setNewSectionTitle}
                        />
                        <View
                            style={{
                                flexDirection: "row",
                                justifyContent: "space-between",
                            }}
                        >
                            <Button
                                title="Сохранить"
                                onPress={handleAddSection}
                                color="#278B22"
                            />
                            <Button
                                title="Отмена"
                                onPress={() => setShowAddSection(false)}
                                color="#888"
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Подтверждение удаления раздела */}
            <Modal visible={!!confirmSection} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={{ textAlign: "center", marginBottom: 10 }}>
                            Удалить раздел "{confirmSection?.title}" со всеми
                            домашками?
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
                                onPress={handleDeleteSection}
                            />
                            <Button
                                title="Отмена"
                                color="#888"
                                onPress={() => setConfirmSection(null)}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 12 },
    sectionBtn: {
        flex: 1,
        backgroundColor: "#e6f9ff",
        padding: 18,
        borderRadius: 7,
    },
    sectionText: { fontSize: 17, fontWeight: "bold" },
    iconBtn: {
        backgroundColor: "#da2222",
        borderRadius: 22,
        width: 38,
        height: 38,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    addSectionBtn: {
        backgroundColor: "#278B22",
        borderRadius: 18,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "center",
    },
    empty: { color: "#666", textAlign: "center", marginTop: 30 },
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
