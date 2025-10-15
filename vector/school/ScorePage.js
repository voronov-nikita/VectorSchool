import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    StyleSheet,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from "react-native";

import { URL } from "../config";

export const ScoreScreen = () => {
    const [users, setUsers] = useState([]);
    const [ratings, setRatings] = useState({}); // Текущие значения в input
    const [originalRatings, setOriginalRatings] = useState({}); // Исходные значения для отмены
    const [loading, setLoading] = useState(true);

    // Пример уровня доступа (нужно заменить вашей реализацией)
    const userAccessLevel = "админ";

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${URL}/users`);
            const json = await response.json();
            const fetchedUsers = json.fighters || [];
            setUsers(fetchedUsers);

            const initialRatings = {};
            fetchedUsers.forEach((user) => {
                initialRatings[user.login] = user.rating?.toString() || "";
            });
            setRatings(initialRatings);
            setOriginalRatings(initialRatings);
        } catch {
            Alert.alert("Ошибка", "Не удалось загрузить данные пользователей");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const onChangeText = (login, text) => {
        if (/^\d*\.?\d*$/.test(text)) {
            setRatings((prev) => ({ ...prev, [login]: text }));
        }
    };

    const cancelEdit = (login) => {
        setRatings((prev) => ({
            ...prev,
            [login]: originalRatings[login] || "",
        }));
    };

    const saveEdit = async (login) => {
        const ratingStr = ratings[login] || "";
        const parsed = parseFloat(ratingStr.replace(",", "."));
        if (isNaN(parsed)) {
            Alert.alert("Ошибка", "Некорректный формат рейтинга");
            setRatings((prev) => ({
                ...prev,
                [login]: originalRatings[login] || "",
            }));
            return;
        }

        try {
            const response = await fetch(`${URL}/profile/${login}/rating`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating: parsed }),
            });
            if (!response.ok) throw new Error("Ошибка сохранения");

            // После успешного сохранения обновляем оригинальные и список пользователей
            setOriginalRatings((prev) => ({ ...prev, [login]: ratingStr }));
            setUsers((prevUsers) =>
                prevUsers.map((user) =>
                    user.login === login ? { ...user, rating: parsed } : user
                )
            );
            Alert.alert("Успех", "Рейтинг сохранён");
        } catch {
            Alert.alert("Ошибка", "Не удалось сохранить рейтинг");
        }
    };

    const renderUser = ({ item }) => {
        const inputValue = ratings[item.login] || "";
        const originalValue = originalRatings[item.login] || "";
        const isChanged = inputValue !== originalValue;
        const canEdit = userAccessLevel === "админ"; // Для примера

        return (
            <View style={styles.userRow}>
                <Text style={styles.userName}>{item.fio}</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={inputValue}
                    onChangeText={(text) => onChangeText(item.login, text)}
                    placeholder="Рейтинг"
                    editable={canEdit}
                />
                {canEdit && isChanged && (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity onPress={() => saveEdit(item.login)}>
                            <Text style={styles.saveButton}>✔️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => cancelEdit(item.login)}
                        >
                            <Text style={styles.cancelButton}>❌</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    };

    if (loading) {
        return <ActivityIndicator style={styles.centered} size="large" />;
    }

    return (
        <FlatList
            data={users}
            keyExtractor={(item) => item.login}
            renderItem={renderUser}
            ListEmptyComponent={
                <Text style={styles.centered}>Пользователи не найдены</Text>
            }
        />
    );
};

const styles = StyleSheet.create({
    userRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomColor: "#ccc",
        borderBottomWidth: 1,
    },
    userName: {
        fontSize: 16,
        flex: 1,
        marginRight: 12,
    },
    input: {
        width: 60,
        borderBottomWidth: 1,
        borderColor: "#888",
        textAlign: "center",
        fontSize: 16,
        marginRight: 8,
    },
    buttonRow: {
        flexDirection: "row",
    },
    saveButton: {
        fontSize: 24,
        color: "green",
        marginRight: 8,
    },
    cancelButton: {
        fontSize: 24,
        color: "red",
    },
    centered: {
        marginTop: 20,
        textAlign: "center",
        fontSize: 18,
    },
});
