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
    Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { URL, achievementsConfig } from "../config";

const { width } = Dimensions.get("window");
const ITEM_SIZE = width / 6 - 12; // Размер иконки достижения

export const ProfileScreen = ({ navigation }) => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

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

    // Фильтруем достижения, показываем только те, что есть в конфиге
    const achievementsToShow = profile.achievements.filter(
        (name) => achievementsConfig[name]
    );

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Профиль пользователя</Text>
            <View style={styles.card}>
                <Text style={styles.fio}>{profile.fio}</Text>

                <Text style={styles.login}>
                    Логин в системе:{" "}
                    <Text style={{ fontWeight: "bold" }}>{profile.login}</Text>
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

                <Text style={styles.section}>Достижения:</Text>
                {achievementsToShow.length === 0 ? (
                    <Text>Нет достижений</Text>
                ) : (
                    <FlatList
                        data={achievementsToShow}
                        keyExtractor={(item) => item}
                        numColumns={6}
                        scrollEnabled={false} // Чтобы не конфликтовать с ScrollView
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
            <View style={styles.bottomRow}>
                <Button
                    title="Выйти из системы"
                    onPress={handleLogout}
                    color="#ff3333ff"
                />
            </View>
        </ScrollView>
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
    achievementItem: {
        alignItems: "center",
        flex: 1,
        margin: 6,
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
    bottomRow: { width: "98%", maxWidth: 500 },
});
