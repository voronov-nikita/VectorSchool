import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    StyleSheet,
} from "react-native";

import { URL } from "../config";

export const UsersScreen = () => {
    const [fighters, setFighters] = useState([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("fio");
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        fetch(`${URL}/users?search=${search}&sort=${sort}`)
            .then((res) => res.json())
            .then((data) => setFighters(data.fighters));
    }, [search, sort]);

    return (
        <View style={styles.container}>
            <TextInput
                style={styles.searchInput}
                placeholder="Поиск"
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#999"
            />
            <View style={styles.sortRow}>
                <TouchableOpacity
                    style={[
                        styles.sortBtn,
                        sort === "fio" && styles.sortBtnActive,
                    ]}
                    onPress={() => setSort("fio")}
                >
                    <Text
                        style={[
                            styles.sortBtnText,
                            sort === "fio" && styles.sortBtnTextActive,
                        ]}
                    >
                        По имени
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.sortBtn,
                        sort === "rating" && styles.sortBtnActive,
                    ]}
                    onPress={() => setSort("rating")}
                >
                    <Text
                        style={[
                            styles.sortBtnText,
                            sort === "rating" && styles.sortBtnTextActive,
                        ]}
                    >
                        По рейтингу
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.sortBtn,
                        sort === "attendance" && styles.sortBtnActive,
                    ]}
                    onPress={() => setSort("attendance")}
                >
                    <Text
                        style={[
                            styles.sortBtnText,
                            sort === "attendance" && styles.sortBtnTextActive,
                        ]}
                    >
                        По посещаемости
                    </Text>
                </TouchableOpacity>
            </View>
            <FlatList
                style={styles.list}
                data={fighters}
                keyExtractor={(item) => item.login}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.listItem}
                        onPress={() => setSelected(item)}
                    >
                        <Text style={styles.listItemText}>{item.fio}</Text>
                    </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
            />
            <Modal
                visible={!!selected}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelected(null)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        {selected && (
                            <>
                                <Text style={styles.modalTitle}>
                                    {selected.fio}
                                </Text>
                                <Text style={styles.modalText}>
                                    Рейтинг: {selected.rating}
                                </Text>
                                <Text style={styles.modalText}>
                                    Посещаемость: {selected.attendance}
                                </Text>
                                <Text style={styles.modalText}>
                                    Достижения: {"\n"}{selected.achievements || "нет"}
                                </Text>
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setSelected(null)}
                                >
                                    <Text style={styles.closeButtonText}>
                                        Закрыть
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#F9FAFB",
    },
    searchInput: {
        height: 44,
        borderColor: "#CCC",
        borderWidth: 1,
        borderRadius: 24,
        paddingHorizontal: 16,
        fontSize: 16,
        backgroundColor: "#FFF",
        marginBottom: 16,
        color: "#222D45",
    },
    sortRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    sortBtn: {
        flex: 1,
        marginHorizontal: 4,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#E4E7EB",
        alignItems: "center",
    },
    sortBtnActive: {
        backgroundColor: "#3025ffff",
    },
    sortBtnText: {
        fontSize: 14,
        color: "#4F5D75",
        fontWeight: "600",
    },
    sortBtnTextActive: {
        color: "#FFF",
    },
    list: {
        flex: 1,
    },
    listItem: {
        paddingVertical: 20,
        paddingHorizontal: 20,
        backgroundColor: "#FFF",
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 2,
    },
    listItemText: {
        fontSize: 16,
        color: "#222D45",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 24,
    },
    modalContent: {
        backgroundColor: "#FFF",
        borderRadius: 24,
        padding: 24,
        width: "100%",
        maxWidth: 360,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: "700",
        marginBottom: 12,
        color: "#222D45",
    },
    modalText: {
        fontSize: 16,
        marginBottom: 8,
        color: "#4F5D75",
        textAlign: "center",
    },
    closeButton: {
        marginTop: 16,
        backgroundColor: "#261bffff",
        borderRadius: 24,
        paddingHorizontal: 36,
        paddingVertical: 12,
    },
    closeButtonText: {
        color: "#FFF",
        fontWeight: "600",
        fontSize: 16,
    },
});
