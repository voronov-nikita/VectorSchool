import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
} from "react-native";

import { URL } from "../config";

const windowWidth = Dimensions.get("window").width;
const imgSize = (windowWidth - 60) / 3;

export const SchoolAchiveScreen = ({ login }) => {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${URL}/achievements`, {
            headers: { login },
        })
            .then((res) => res.json())
            .then((data) => {
                if (!data.error) {
                    setAchievements(data);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [login]);

    if (loading) {
        return (
            <ActivityIndicator
                size="large"
                style={{ flex: 1, justifyContent: "center" }}
            />
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {achievements.map((ach, i) => (
                <View key={i} style={styles.achievementCard}>
                    <Image
                        source={{
                            uri: `${URL}:5000${ach.url}`,
                        }}
                        style={styles.image}
                    />
                    <Text style={styles.date}>{ach.date}</Text>
                </View>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 10,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    achievementCard: {
        width: imgSize,
        marginBottom: 15,
        alignItems: "center",
    },
    image: {
        width: imgSize,
        height: imgSize,
        borderRadius: 12,
    },
    date: {
        marginTop: 5,
        fontSize: 12,
        color: "#555",
    },
});
