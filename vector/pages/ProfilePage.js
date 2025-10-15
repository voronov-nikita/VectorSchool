import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Button,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Image,
    FlatList,
    TextInput,
    TouchableOpacity,
    Alert,
    Dimensions,
    Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { URL, achievementsConfig } from "../config";

const { width } = Dimensions.get("window");
const ITEM_SIZE = width / 6 - 12;

export const ProfileScreen = ({ navigation }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);

    // Параметры для смены пароля
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [changingPassword, setChangingPassword] = useState(false);

    useEffect(() => {
        (async () => {
            const login = await AsyncStorage.getItem("authToken");
            fetch(`${URL}/profile/${login}`)
                .then((res) => res.json())
                .then((data) => {
                    setProfile(data);
                    setLoading(false);
                })
                .catch(() => {
                    setLoading(false);
                });
        })();
    }, []);

    const handleLogout = () => {
        navigation.navigate("Exit");
    };

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            Alert.alert("Ошибка", "Пожалуйста, заполните все поля");
            return;
        }
        if (newPassword !== confirmNewPassword) {
            Alert.alert("Ошибка", "Новый пароль и подтверждение не совпадают");
            return;
        }

        setChangingPassword(true);

        try {
            const response = await fetch(
                `${URL}/profile/${profile.login}/change_password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        old_password: oldPassword,
                        new_password: newPassword,
                    }),
                }
            );
            const json = await response.json();
            if (response.ok) {
                Alert.alert("Успех", "Пароль успешно изменён");
                setOldPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
                setModalVisible(false);
            } else {
                Alert.alert(
                    "Ошибка",
                    json.error || "Не удалось изменить пароль"
                );
            }
        } catch {
            Alert.alert("Ошибка", "Ошибка связи с сервером");
        } finally {
            setChangingPassword(false);
        }
    };

    if (loading) {
        return (
            <ActivityIndicator
                size="large"
                color="#5833ffff"
                style={{ flex: 1, justifyContent: "center" }}
            />
        );
    }
    if (!profile || profile.error) {
        return (
            <Text style={{ flex: 1, textAlign: "center", marginTop: 40 }}>
                Профиль не найден.{"\n"}Скорее всего информация еще не была
                добавлена.
            </Text>
        );
    }

    const achievementsToShow = profile.achievements.filter(
        (name) => achievementsConfig[name]
    );

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Профиль пользователя</Text>
                <View style={styles.card}>
                    <Text style={styles.fio}>{profile.fio}</Text>

                    <Text style={styles.login}>
                        Логин в системе:{" "}
                        <Text style={{ fontWeight: "bold" }}>
                            {profile.login}
                        </Text>
                    </Text>

                    <Text style={styles.login}>
                        Логин в телеграмм:{" "}
                        <Text style={{ fontWeight: "bold" }}>
                            {profile.telegram}
                        </Text>
                    </Text>

                    <Text style={styles.rating}>
                        Рейтинг бойца:{" "}
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

                    {achievementsToShow.length === 0 ? (
                        <Text>Нет достижений</Text>
                    ) : (
                        <FlatList
                            data={achievementsToShow}
                            keyExtractor={(item) => item}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.achievementsList}
                            renderItem={({ item }) => (
                                <View style={styles.achievementItem}>
                                    <Image
                                        source={achievementsConfig[item]}
                                        style={styles.achievementImage}
                                        resizeMode="contain"
                                    />
                                    <Text style={styles.achievementText}>
                                        {item}
                                    </Text>
                                </View>
                            )}
                        />
                    )}
                </View>

                {/* Кнопка открытия модалки смены пароля */}
                <TouchableOpacity
                    style={styles.openModalButton}
                    onPress={() => setModalVisible(true)}
                >
                    <Text style={styles.openModalButtonText}>
                        🔒 Изменить пароль
                    </Text>
                </TouchableOpacity>

                <View style={styles.bottomRow}>
                    <Button
                        title="Выйти из системы"
                        onPress={handleLogout}
                        color="#ff3333ff"
                    />
                </View>
            </ScrollView>

            {/* Модальное окно */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.subHeader}>Смена пароля</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Старый пароль"
                            secureTextEntry
                            value={oldPassword}
                            onChangeText={setOldPassword}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Новый пароль"
                            secureTextEntry
                            value={newPassword}
                            onChangeText={setNewPassword}
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Подтвердите новый пароль"
                            secureTextEntry
                            value={confirmNewPassword}
                            onChangeText={setConfirmNewPassword}
                        />

                        <View style={styles.modalButtonsRow}>
                            <TouchableOpacity
                                style={[
                                    styles.changePasswordButton,
                                    { flex: 1, marginRight: 8 },
                                ]}
                                onPress={handleChangePassword}
                                disabled={changingPassword}
                            >
                                <Text style={styles.changePasswordButtonText}>
                                    Сохранить
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.cancelButton, { flex: 1 }]}
                                onPress={() => setModalVisible(false)}
                                disabled={changingPassword}
                            >
                                <Text
                                    style={[
                                        styles.changePasswordButtonText,
                                        { color: "#ff5555" },
                                    ]}
                                >
                                    Отмена
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

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
    subHeader: {
        fontSize: 20,
        fontWeight: "600",
        marginBottom: 12,
        textAlign: "center",
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
    achievementsList: { paddingVertical: 10 },
    achievementItem: {
        alignItems: "center",
        marginRight: 12,
        width: ITEM_SIZE,
    },
    achievementImage: {
        width: ITEM_SIZE,
        height: ITEM_SIZE,
    },
    achievementText: {
        marginTop: 4,
        fontSize: 10,
        textAlign: "center",
    },
    openModalButton: {
        backgroundColor: "#337AFF",
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 18,
        marginBottom: 24,
    },
    openModalButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
    bottomRow: { width: "98%", maxWidth: 500 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 16,
        marginBottom: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    modalContent: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#fff",
        borderRadius: 18,
        padding: 24,
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    modalButtonsRow: {
        flexDirection: "row",
        marginTop: 12,
    },
    changePasswordButton: {
        backgroundColor: "#337AFF",
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
    },
    cancelButton: {
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#ff5555",
    },
    changePasswordButtonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
    },
});
