import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    FlatList,
    StyleSheet,
    Dimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const ITEM_SIZE = width / 4 - 16; // Четыре колонки с отступами

// Пример конфигурации достижений
const achievementsConfig = {
    first: "",
    second: "",
    third: "",
    // добавьте свои картинки и имена
};

// Заглушка для получения достижений по токену
async function fetchUserAchievements(token) {
    // Здесь должен быть запрос к серверу
    // Пример ответа:
    return new Promise((resolve) =>
        setTimeout(() => resolve([{ name: "first" }, { name: "third" }]), 1000)
    );
}

// Отдельный Item для картинки с маской
const AchievementItem = ({ source, locked }) => (
    <View style={styles.itemWrapper}>
        <Image
            source={source}
            style={[styles.image, locked && styles.locked]}
            resizeMode="contain"
        />
    </View>
);

// Страница со всеми достижениями — с фильтром блокировки
export const SchoolAchiveScreen = () => {
    const [userAchievements, setUserAchievements] = useState([]);
    const [token, setToken] = useState("");

    useEffect(() => {
        (async () => {
            const storedToken = await AsyncStorage.getItem("authToken");
            setToken(storedToken);
        })();
    }, []);

    useEffect(() => {
        if (!token) return;
        fetchUserAchievements(token)
            .then((achievements) =>
                setUserAchievements(achievements.map((a) => a.name))
            )
            .catch(() => setUserAchievements([]));
    }, [token]);

    return (
        <FlatList
            data={Object.entries(achievementsConfig)}
            keyExtractor={([name]) => name}
            numColumns={4}
            contentContainerStyle={styles.container}
            renderItem={({ item: [name, source] }) => {
                const locked = !userAchievements.includes(name);
                return <AchievementItem source={source} locked={locked} />;
            }}
        />
    );
};

// Страница с достижениями пользователя (только доступные)
export const UserAchievementsScreen = () => {
    const [userAchievements, setUserAchievements] = useState([]);
    const [token, setToken] = useState("");

    useEffect(() => {
        (async () => {
            const storedToken = await AsyncStorage.getItem("authToken");
            setToken(storedToken);
        })();
    }, []);

    useEffect(() => {
        if (!token) return;
        fetchUserAchievements(token)
            .then((achievements) =>
                setUserAchievements(achievements.map((a) => a.name))
            )
            .catch(() => setUserAchievements([]));
    }, [token]);

    return (
        <View style={styles.container}>
            {userAchievements.length === 0 ? (
                <Text style={styles.messageText}>
                    У вас пока нет достижений.
                </Text>
            ) : (
                <FlatList
                    data={userAchievements}
                    keyExtractor={(name) => name}
                    numColumns={4}
                    contentContainerStyle={styles.container}
                    renderItem={({ item: name }) => {
                        const source = achievementsConfig[name];
                        if (!source) return null;
                        return (
                            <AchievementItem source={source} locked={false} />
                        );
                    }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
    },
    itemWrapper: {
        margin: 8,
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        alignItems: "center",
        justifyContent: "center",
    },
    image: {
        width: ITEM_SIZE - 10,
        height: ITEM_SIZE - 10,
    },
    locked: {
        opacity: 0.3,
        tintColor: "gray",
    },
    messageText: {
        fontSize: 16,
        textAlign: "center",
        marginTop: 30,
    },
});
