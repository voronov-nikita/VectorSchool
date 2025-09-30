import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Dimensions,
    Alert,
    ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { URL } from "../config";

const { width, height } = Dimensions.get("window");
const ITEM_SIZE = width / 4 - 16;

const achievementsConfig = {
    first: {
        title: "Первое достижение",
        image: require("../assets/achive/1.png"),
    },
    third: {
        title: "Третье достижение",
        image: require("../assets/achive/2.png"),
    },
    start: {
        title: "Стартовое достижение",
        image: require("../assets/achive/3.png"),
    },
};

const AchievementItem = ({ source, locked, title, onPress }) => (
    <TouchableOpacity style={styles.itemWrapper} onPress={onPress}>
        <Image
            source={source}
            style={[styles.image, locked && styles.locked]}
            resizeMode="contain"
        />
        <Text style={styles.itemTitle}>{title}</Text>
    </TouchableOpacity>
);

export const SchoolAchiveScreen = () => {
    const [userAchievements, setUserAchievements] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [allUsers, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchUserText, setSearchUserText] = useState("");
    const [selectedUserLogins, setSelectedUserLogins] = useState(new Set());
    const [selectedAchievementKey, setSelectedAchievementKey] = useState(null);

    useEffect(() => {
        fetchUserAchievements();
    }, []);

    const fetchUserAchievements = async () => {
        try {
            const login = await AsyncStorage.getItem("authToken");
            if (!login) throw new Error("Логин не найден");
            const response = await fetch(`${URL}/achievements`, {
                method: "GET",
                headers: { login },
            });
            if (!response.ok) throw new Error("Ошибка сервера");
            const achievements = await response.json();
            setUserAchievements(achievements.map((a) => a.name));
        } catch {
            setUserAchievements([]);
        }
    };

    const loadUsers = () => {
        fetch(`${URL}/users`)
            .then((res) => res.json())
            .then((data) => {
                const usersArray = data.users || data.fighters || [];
                setAllUsers(usersArray);
                setFilteredUsers(usersArray);
            })
            .catch(() =>
                Alert.alert("Ошибка", "Не удалось загрузить пользователей")
            );
    };

    const openModalForAchievement = (achievementKey) => {
        setSelectedAchievementKey(achievementKey);
        setSelectedUserLogins(new Set());
        setSearchUserText("");
        setModalVisible(true);
        loadUsers();
    };

    const onSearchUserChange = (text) => {
        setSearchUserText(text);
        const filtered = allUsers.filter(
            (u) =>
                u.fio.toLowerCase().includes(text.toLowerCase()) ||
                u.login.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredUsers(filtered);
    };

    const toggleUserSelection = (login) => {
        const newSet = new Set(selectedUserLogins);
        if (newSet.has(login)) {
            newSet.delete(login);
        } else {
            newSet.add(login);
        }
        setSelectedUserLogins(newSet);
    };

    const addAchievementToUsers = async () => {
        if (!selectedAchievementKey || selectedUserLogins.size === 0) return;

        const adminLogin = await AsyncStorage.getItem("authToken");
        if (!adminLogin) {
            Alert.alert("Ошибка", "Логин администратора не найден");
            return;
        }

        try {
            // Для каждого выбранного пользователя отправляем запрос по выдаче достижения
            for (let user_login of selectedUserLogins) {
                const response = await fetch(`${URL}/achievements/add`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        login: adminLogin,
                    },
                    body: JSON.stringify({
                        user_login,
                        achievement_name: selectedAchievementKey,
                    }),
                });
                if (!response.ok) throw new Error();
            }

            Alert.alert("Успех", `Достижение выдано выбранным пользователям`);
            setModalVisible(false);
            setSelectedUserLogins(new Set());
            setSelectedAchievementKey(null);
            await fetchUserAchievements();
        } catch {
            Alert.alert("Ошибка", "Не удалось добавить достижение");
        }
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={Object.entries(achievementsConfig)}
                keyExtractor={([key]) => key}
                numColumns={4}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item: [key, val] }) => {
                    const locked = !userAchievements.includes(key);
                    return (
                        <AchievementItem
                            source={val.image}
                            locked={locked}
                            title={val.title}
                            onPress={() => openModalForAchievement(key)}
                        />
                    );
                }}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>Достижений нет</Text>
                }
            />

            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Выберите пользователей для достижения:{" "}
                            {selectedAchievementKey &&
                                achievementsConfig[selectedAchievementKey]
                                    ?.title}
                        </Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Поиск пользователя"
                            value={searchUserText}
                            onChangeText={onSearchUserChange}
                            autoFocus
                        />
                        <FlatList
                            data={filteredUsers}
                            keyExtractor={(item) => item.login}
                            style={{ maxHeight: height * 0.6 }}
                            renderItem={({ item }) => {
                                const selected = selectedUserLogins.has(
                                    item.login
                                );
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.userItem,
                                            selected && styles.userItemSelected,
                                        ]}
                                        onPress={() =>
                                            toggleUserSelection(item.login)
                                        }
                                    >
                                        <Text>
                                            {item.fio} ({item.login}){" "}
                                            {selected ? "✓" : ""}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                        <View style={styles.buttonsRow}>
                            <TouchableOpacity
                                disabled={selectedUserLogins.size === 0}
                                onPress={addAchievementToUsers}
                                style={[
                                    styles.button,
                                    selectedUserLogins.size > 0
                                        ? styles.buttonActive
                                        : styles.buttonDisabled,
                                ]}
                            >
                                <Text style={styles.buttonText}>
                                    Выдать достижение
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                style={[styles.button, styles.buttonCancel]}
                            >
                                <Text style={styles.buttonText}>Отмена</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 10 },
    listContainer: { paddingBottom: 100 },
    itemWrapper: {
        width: ITEM_SIZE,
        height: ITEM_SIZE + 24,
        margin: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    image: { width: ITEM_SIZE - 10, height: ITEM_SIZE - 10 },
    locked: { opacity: 0.3, tintColor: "gray" },
    itemTitle: { marginTop: 4, fontSize: 12, textAlign: "center" },
    emptyText: {
        textAlign: "center",
        marginTop: 50,
        fontSize: 16,
        color: "#777",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.25)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 12,
        width: "85%",
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        marginBottom: 12,
        textAlign: "center",
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 6,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 10,
    },
    userItem: {
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    userItemSelected: {
        backgroundColor: "#dbeafe",
    },
    buttonsRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 15,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 5,
    },
    buttonActive: {
        backgroundColor: "#1976d2",
    },
    buttonDisabled: {
        backgroundColor: "#aaa",
    },
    buttonCancel: {
        backgroundColor: "#888",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "700",
    },
});
