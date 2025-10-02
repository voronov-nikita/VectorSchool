import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    Modal,
    StyleSheet,
    Alert,
    Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { URL } from "../config";

export const UsersScreen = () => {
    const [fighters, setFighters] = useState([]);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("fio");
    const [selected, setSelected] = useState(null);
    const [accessLevel, setAccessLevel] = useState(null); // уровень доступа текущего пользователя
    const [addModalVisible, setAddModalVisible] = useState(false);
    const [newUserLogin, setNewUserLogin] = useState("");
    const [newUserFio, setNewUserFio] = useState("");
    const [newUserTelegram, setNewUserTelegram] = useState("");
    const [newUserPassword, setNewUserPassword] = useState("");
    const [newUserGroup, setNewUserGroup] = useState("");
    const [newUserBirthDate, setNewUserBirthDate] = useState("");

    useEffect(async () => {
        const login = await AsyncStorage.getItem("authToken").then();
        // Получаем уровень доступа текущего пользователя
        fetch(`${URL}/user/access_level?login=${login}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.access_level !== undefined) {
                    setAccessLevel(data.access_level);
                } else {
                    setAccessLevel(null);
                }
            })
            .catch(() => setAccessLevel(null));
    }, []);

    useEffect(() => {
        fetch(`${URL}/users?search=${encodeURIComponent(search)}&sort=${sort}`)
            .then((res) => res.json())
            .then((data) => setFighters(data.fighters || []))
            .catch(() =>
                Alert.alert(
                    "Ошибка",
                    "Не удалось загрузить список пользователей"
                )
            );
    }, [search, sort]);

    const showInfo = async (login) => {
        if (!login) return;
        try {
            const response = await fetch(`${URL}/profile/${login}`);
            if (!response.ok) throw new Error("Профиль не найден");
            const data = await response.json();
            setSelected(data);
        } catch (err) {
            setSelected(null);
            Alert.alert("Ошибка", "Не удалось загрузить профиль пользователя");
        }
    };

    const addUser = async () => {
        if (!newUserLogin || !newUserFio || !newUserPassword) {
            Alert.alert("Ошибка", "Заполните логин, ФИО и пароль");
            return;
        }
        try {
            const response = await fetch(`${URL}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    login: newUserLogin,
                    fio: newUserFio,
                    password: newUserPassword,
                    access_level: "боец",
                    telegram: newUserTelegram,
                    group_name: newUserGroup,
                    birth_date: newUserBirthDate,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error || "Ошибка при добавлении пользователя"
                );
            }
            Alert.alert("Успех", "Пользователь добавлен");
            setAddModalVisible(false);
            setNewUserLogin("");
            setNewUserFio("");
            setNewUserTelegram("");
            setNewUserPassword("");
            setNewUserGroup("");
            setNewUserBirthDate("");
            setSearch(""); // обновить список
        } catch (e) {
            Alert.alert("Ошибка", e.message);
        }
    };

    const openTelegramLink = (telegram) => {
        if (!telegram) return;
        const url = `https://t.me/${telegram.replace("@", "")}`;
        Linking.openURL(url).catch(() =>
            Alert.alert("Ошибка", "Не удалось открыть Telegram")
        );
    };

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
            </View>

            {accessLevel === "админ" && (
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setAddModalVisible(true)}
                >
                    <Text style={styles.addButtonText}>
                        Добавить пользователя
                    </Text>
                </TouchableOpacity>
            )}

            <FlatList
                style={styles.list}
                data={fighters}
                keyExtractor={(item) => item.login}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.listItem}
                        onPress={() => showInfo(item.login)}
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
                                <Text
                                    style={[
                                        styles.modalText,
                                        { color: "blue" },
                                    ]}
                                    onPress={() =>
                                        openTelegramLink(selected.telegram)
                                    }
                                >
                                    Telegram: {selected.telegram}
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

            {/* Модалка добавления пользователя */}
            <Modal
                visible={addModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setAddModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Новый пользователь
                        </Text>
                        <TextInput
                            placeholder="Логин"
                            style={styles.textInput}
                            value={newUserLogin}
                            onChangeText={setNewUserLogin}
                            autoCapitalize="none"
                        />
                        <TextInput
                            placeholder="ФИО"
                            style={styles.textInput}
                            value={newUserFio}
                            onChangeText={setNewUserFio}
                        />
                        <TextInput
                            placeholder="Telegram"
                            style={styles.textInput}
                            value={newUserTelegram}
                            onChangeText={setNewUserTelegram}
                            autoCapitalize="none"
                        />
                        <TextInput
                            placeholder="Пароль"
                            style={styles.textInput}
                            value={newUserPassword}
                            onChangeText={setNewUserPassword}
                            secureTextEntry={true}
                            autoCapitalize="none"
                        />
                        <TextInput
                            placeholder="Учебная группа"
                            style={styles.textInput}
                            value={newUserGroup}
                            onChangeText={setNewUserGroup}
                        />
                        <TextInput
                            placeholder="День рождения (ГГГГ-ММ-ДД)"
                            style={styles.textInput}
                            value={newUserBirthDate}
                            onChangeText={setNewUserBirthDate}
                            autoCapitalize="none"
                        />
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={addUser}
                        >
                            <Text style={styles.addButtonText}>Добавить</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.closeButton, { marginTop: 12 }]}
                            onPress={() => setAddModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Отмена</Text>
                        </TouchableOpacity>
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
    addButton: {
        backgroundColor: "#3030ff",
        borderRadius: 24,
        paddingVertical: 10,
        paddingHorizontal: 20,
        marginBottom: 20,
        alignItems: "center",
    },
    addButtonText: {
        color: "#FFF",
        fontWeight: "600",
        fontSize: 16,
    },
    textInput: {
        width: "100%",
        borderColor: "#CCC",
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
        marginBottom: 12,
        fontSize: 16,
    },
});
