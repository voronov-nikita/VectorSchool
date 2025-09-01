import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Button,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
} from "react-native";

import { URL } from "../config";

export const ProfileScreen = ({navigation, login}) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    // const login = "ivanov_ii"; // фиксированный логин для теста

    useEffect(() => {
        fetch(`${URL}/profile/${login}`)
            .then((res) => res.json())
            .then((data) => {
                setProfile(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const handleLogout = () => {
        navigation.navigate("Exit");
    };

    if (loading) {
        return (
            <ActivityIndicator
                size="large"
                color="#337AFF"
                style={{ flex: 1 }}
            />
        );
    }
    if (!profile || profile.error) {
        return (
            <Text style={{ flex: 1, textAlign: "center", marginTop: 40 }}>
                Профиль не найден.{"\n"}Скорее всего информация еще не была добавлена.
            </Text>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Профиль пользователя</Text>
            <View style={styles.card}>
                {/* ФИО человека */}
                <Text style={styles.fio}>{profile.fio}</Text>

                {/* Общая информация */}
                <Text style={styles.login}>
                    Логин в системе:{" "}
                    <Text style={{ fontWeight: "bold" }}>{profile.login}</Text>
                </Text>

                {/* Контактная информация */}
                <Text style={styles.login}>
                    Логин в телеграмм:{" "}
                    <Text style={{ fontWeight: "bold" }}>{profile.telegram}</Text>
                </Text>

                {/* ИНформация о бойце */}
                <Text style={styles.rating}>
                    Рейтинг бойцов:{" "}
                    <Text style={{ color: "#337AFF", fontWeight: "bold" }}>
                        {profile.rating}
                    </Text>
                </Text>
                <Text style={styles.attendance}>
                    Посещено мероприятий:{" "}
                    <Text style={{ fontWeight: "bold" }}>
                        {profile.attendance}
                    </Text>
                </Text>
                <Text style={styles.section}>Достижения:</Text>
                {profile.achievements.length === 0 && (
                    <Text>Нет достижений</Text>
                )}
                {profile.achievements.map((ach, idx) => (
                    <Text key={idx} style={styles.achievement}>
                        {ach}
                    </Text>
                ))}
            </View>
            <View style={styles.bottomRow}>
                <Button
                    title="Выйти из системы"
                    onPress={handleLogout}
                    color="#337AFF"
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: "#f9fafe",
        alignItems: "center",
        padding: 18,
    },
    header: {
        fontSize: 26,
        fontWeight: "bold",
        marginTop: 12,
        marginBottom: 18,
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 18,
        width: "98%",
        maxWidth: 500,
        shadowColor: "#337AFF",
        shadowOpacity: 0.11,
        marginBottom: 24,
    },
    fio: { fontSize: 22, fontWeight: "500", marginBottom: 6 },
    login: { fontSize: 16, marginBottom: 6 },
    rating: { fontSize: 16, marginBottom: 6 },
    attendance: { fontSize: 16, marginBottom: 12 },
    section: {
        fontSize: 16,
        fontWeight: "bold",
        marginTop: 8,
        marginBottom: 5,
    },
    achievement: { fontSize: 15, marginLeft: 12, marginBottom: 2 },
    bottomRow: { width: "98%", maxWidth: 500 },
});
