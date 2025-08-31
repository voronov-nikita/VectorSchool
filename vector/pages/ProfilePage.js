import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    ScrollView,
} from "react-native";

import { URL } from "../config";

export const ProfileScreen = () => {
    const userLogin = localStorage.getItem(userId)
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editName, setEditName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [saving, setSaving] = useState(false);

    // Получение профиля пользователя с сервера
    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await fetch(
                    `${URL}/profile?login=${encodeURIComponent(
                        userLogin
                    )}`
                );
                const data = await res.json();
                setProfile(data);
                setEditName(data.fio);
                setEditEmail(data.email || "");
            } catch (e) {
                Alert.alert("Ошибка", "Не удалось загрузить профиль");
            }
            setLoading(false);
        };
        fetchProfile();
    }, [userLogin]);

    // Сохранение изменений профиля
    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`${URL}/profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    login: userLogin,
                    fio: editName,
                    email: editEmail,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                Alert.alert("Успех", "Данные успешно обновлены");
                setProfile({ ...profile, fio: editName, email: editEmail });
            } else {
                Alert.alert("Ошибка", data.error || "Ошибка обновления данных");
            }
        } catch (e) {
            Alert.alert("Ошибка", "Нет соединения с сервером");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <ActivityIndicator
                size="large"
                style={{ flex: 1, marginTop: 40 }}
            />
        );
    }
    if (!profile) {
        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Text>Профиль не найден</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.page}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.path}>Главная / Профиль</Text>
                    <Text style={styles.title}>Мой профиль</Text>
                    <Text style={styles.subtitle}>
                        Обновите данные своей учетной записи, такие как имя,
                        адрес электронной почты и пароль
                    </Text>
                </View>
                <TouchableOpacity style={styles.logout} onPress={onLogout}>
                    <Text style={styles.logoutText}>Выйти</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.sectionWrapper}>
                <Text style={styles.sectionTitle}>Информация профиля</Text>
                <Text style={styles.sectionHint}>
                    Обновите информацию профиля вашего аккаунта и адрес
                    электронной почты.
                </Text>
                <View style={styles.infoCard}>
                    <Text style={styles.inputLabel}>Название *</Text>
                    <TextInput
                        style={styles.input}
                        value={editName}
                        onChangeText={setEditName}
                        autoCapitalize="words"
                        placeholder="ФИО"
                    />
                    <Text style={styles.inputLabel}>Электронная почта *</Text>
                    <TextInput
                        style={styles.input}
                        value={editEmail}
                        onChangeText={setEditEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="email"
                    />
                    <TouchableOpacity
                        style={styles.saveBtn}
                        onPress={handleSave}
                        disabled={saving}
                    >
                        <Text style={styles.saveBtnText}>
                            {saving ? "Сохраняю..." : "Сохранить"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.sectionWrapper}>
                <Text style={styles.sectionTitle}>Смена пароля</Text>
                <Text style={styles.sectionHint}>
                    Убедитесь, что в вашей учетной записи используется длинный
                    случайный пароль, чтобы оставаться в безопасности.
                </Text>
                {/* Здесь реализуйте дополнительную логику и поля смены пароля при необходимости */}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    page: { backgroundColor: "#f5f6fa", flex: 1 },
    header: {
        backgroundColor: "#fff",
        margin: 15,
        marginBottom: 0,
        padding: 18,
        borderRadius: 9,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    path: { color: "#8e94a3", fontSize: 14, marginBottom: 3 },
    title: { fontSize: 24, fontWeight: "bold", marginBottom: 4 },
    subtitle: { color: "#7b8793", fontSize: 15 },

    logout: { flexDirection: "row", alignItems: "center", gap: 7 },
    logoutText: { color: "#2176ff", fontSize: 16, fontWeight: "600" },

    sectionWrapper: { marginHorizontal: 15, marginTop: 32 },
    sectionTitle: { fontSize: 20, fontWeight: "600", marginBottom: 7 },
    sectionHint: { color: "#7b8793", marginBottom: 14, fontSize: 15 },
    infoCard: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: "500",
        marginTop: 6,
        marginBottom: 3,
        color: "#6f7683",
    },
    input: {
        borderWidth: 1,
        borderColor: "#dde2ef",
        borderRadius: 7,
        padding: 11,
        fontSize: 17,
        marginBottom: 9,
        backgroundColor: "#fafbff",
    },
    saveBtn: {
        backgroundColor: "#2176ff",
        padding: 14,
        borderRadius: 7,
        alignItems: "center",
        marginTop: 6,
    },
    saveBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
