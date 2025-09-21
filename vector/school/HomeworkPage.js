import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
} from "react-native";

import { URL } from "../config";

export const HomeworkScreen = ({ navigation }) => {
    const [tests, setTests] = useState([]);

    useEffect(() => {
        fetch(`${URL}/tests`)
            .then((res) => res.json())
            .then((data) => setTests(data.tests));
    }, []);

    return (
        <View style={styles.container}>
            Домашка
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 22, backgroundColor: "#232946" },
    title: { fontSize: 26, fontWeight: "700", color: "#fff", marginBottom: 14 },
    testButton: {
        backgroundColor: "#393f56",
        padding: 18,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 3,
    },
    testButtonText: { color: "#eebbc3", fontWeight: "600", fontSize: 18 },
    addButton: {
        backgroundColor: "#eebbc3",
        position: "absolute",
        bottom: 30,
        left: 22,
        right: 22,
        padding: 18,
        borderRadius: 16,
        alignItems: "center",
        elevation: 5,
    },
    addButtonText: { color: "#232946", fontWeight: "700", fontSize: 18 },
});
