import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Linking,
    Modal,
    TextInput,
    Button,
    StyleSheet,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";
import { URL } from "../config";

export const HomeworkOneScreen = ({ route }) => {
    const { sectionId, sectionTitle } = route.params;
    const [homeworks, setHomeworks] = useState([]);
    const [showAddHw, setShowAddHw] = useState(false);
    const [newHw, setNewHw] = useState({ title: "", url: "" });
    const [confirmHw, setConfirmHw] = useState(null);

    useEffect(() => {
        fetchHomeworks();
    }, []);
    const fetchHomeworks = () => {
        fetch(`${URL}/homeworks?section_id=${sectionId}`)
            .then((res) => res.json())
            .then(setHomeworks);
    };

    const handleAddHomework = () => {
        fetch(`${URL}/homeworks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ section_id: sectionId, ...newHw }),
        }).then(() => {
            setShowAddHw(false);
            setNewHw({ title: "", url: "" });
            fetchHomeworks();
        });
    };

    const handleDeleteHomework = () => {
        fetch(`${URL}/homeworks/${confirmHw.id}`, { method: "DELETE" }).then(
            () => {
                setConfirmHw(null);
                fetchHomeworks();
            }
        );
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
                style={styles.hwBtn}
                onPress={() => Linking.openURL(item.url)}
            >
                <Text style={styles.hwText}>{item.title}</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => setConfirmHw(item)}
            >
                <AntDesign name="delete" size={22} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{sectionTitle}</Text>
            <FlatList
                data={homeworks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={styles.empty}>Нет домашних заданий</Text>
                }
            />
            <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setShowAddHw(true)}
            >
                <AntDesign name="pluscircleo" size={22} color="#fff" />
                <Text style={{ color: "#fff", marginLeft: 8 }}>
                    Добавить домашку
                </Text>
            </TouchableOpacity>

            {/* Добавить домашку */}
            <Modal visible={showAddHw} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={{ fontWeight: "bold", marginBottom: 10 }}>
                            Добавить домашку
                        </Text>
                        <TextInput
                            placeholder="Заголовок"
                            style={styles.input}
                            value={newHw.title}
                            onChangeText={(v) =>
                                setNewHw((hw) => ({ ...hw, title: v }))
                            }
                        />
                        <TextInput
                            placeholder="Ссылка"
                            style={styles.input}
                            value={newHw.url}
                            onChangeText={(v) =>
                                setNewHw((hw) => ({ ...hw, url: v }))
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
                                onPress={handleAddHomework}
                                color="#278B22"
                            />
                            <Button
                                title="Отмена"
                                onPress={() => setShowAddHw(false)}
                                color="#888"
                            />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Подтверждение удаления домашки */}
            <Modal visible={!!confirmHw} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <Text style={{ textAlign: "center", marginBottom: 10 }}>
                            Удалить домашку "{confirmHw?.title}"?
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
                                onPress={handleDeleteHomework}
                            />
                            <Button
                                title="Отмена"
                                color="#888"
                                onPress={() => setConfirmHw(null)}
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
    header: {
        fontSize: 19,
        fontWeight: "bold",
        marginVertical: 10,
        color: "#337AFF",
        textAlign: "center",
    },
    hwBtn: {
        flex: 1,
        backgroundColor: "#e9f5ff",
        borderRadius: 7,
        padding: 14,
    },
    hwText: { fontSize: 16, color: "#337AFF" },
    iconBtn: {
        backgroundColor: "#da2222",
        borderRadius: 22,
        width: 38,
        height: 38,
        justifyContent: "center",
        alignItems: "center",
        marginLeft: 10,
    },
    addBtn: {
        backgroundColor: "#278B22",
        borderRadius: 18,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 12,
        flexDirection: "row",
        justifyContent: "center",
    },
    empty: { color: "#666", textAlign: "center", marginTop: 26 },
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
