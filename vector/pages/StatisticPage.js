import React, { useState, useEffect } from "react";
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    ScrollView,
} from "react-native";

import { URL } from "../config";

const medalBackgroundColors = {
    1: "#FFF4B2", // светло-жёлтый фон для золота
    2: "#E6E6E6", // светло-серый (серебро)
    3: "#F7E6D4", // светло-бронзовый
    default: "#F0F0F0", // светло-серый для остальных
};

export const StatisticsScreen = () => {
    const [top, setTop] = useState([]);

    useEffect(() => {
        fetch(`${URL}/rating`)
            .then((res) => res.json())
            .then((data) => setTop(data.top_10));
    }, []);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {top.map((place) => {
                const blockColor =
                    medalBackgroundColors[place.rank] ||
                    medalBackgroundColors.default;
                return (
                    <View
                        key={place.rank}
                        style={[styles.placeRow, { justifyContent: "center" }]}
                    >
                        <View
                            style={[
                                styles.placeBlock,
                                { backgroundColor: blockColor },
                            ]}
                        >
                            <Text style={styles.placeText}>
                                Место {place.rank}
                            </Text>
                        </View>
                        <View style={styles.usersRow}>
                            {place.users.map((user) => (
                                <TouchableOpacity
                                    key={user.login}
                                    style={[
                                        styles.userContainer,
                                        {
                                            backgroundColor: blockColor,
                                            borderColor: blockColor,
                                        },
                                    ]}
                                    onPress={() =>
                                        alert(
                                            `${user.fio}\nРейтинг: ${user.rating}`
                                        )
                                    }
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={styles.userText}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {user.fio}
                                    </Text>
                                    <Text style={styles.ratingText}>
                                        {user.rating.toFixed(2)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    placeRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        flexWrap: "wrap",
    },
    placeBlock: {
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: 24,
        marginRight: 16,
        minWidth: 130,
        alignItems: "center",
        justifyContent: "center",
        elevation: 3, // тень android
        shadowColor: "#000", // тень ios
        shadowOpacity: 0.12,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
    },
    placeText: {
        fontSize: 22,
        fontWeight: "700",
        color: "#222D45",
        textAlign: "center",
    },
    usersRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        flex: 1,
        justifyContent: "center",
    },
    userContainer: {
        borderWidth: 1,
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 12,
        marginBottom: 8,
        minWidth: 110,
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 3,
    },
    userText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#222D45",
    },
    ratingText: {
        fontSize: 13,
        color: "#555",
        marginTop: 2,
    },
});
