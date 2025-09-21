import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    FlatList,
} from "react-native";
import { URL } from "../config";

export const TestsScreen = ({ navigation }) => {
    const [tests, setTests] = useState([]);

    useEffect(() => {
        fetch(`${URL}/tests`)
            .then((res) => res.json())
            .then((data) => setTests(data.tests));
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={tests}
                keyExtractor={(item) => `${item.id}`}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.listBlock}
                        onPress={() =>
                            navigation.navigate("TakeTest", {
                                test: item,
                            })
                        }
                    >
                        <Text style={styles.groupTitle}>{item.name}</Text>
                        <Text style={styles.fabButton}>{item.max_score}</Text>
                    </TouchableOpacity>
                )}
                contentContainerStyle={{ paddingBottom: 120 }}
            />
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate("CreateTest")}
            >
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 0,
    },
    listBlock: {
        backgroundColor: "#f3f3f3",
        borderRadius: 7,
        marginHorizontal: 12,
        marginTop: 12,
        padding: 17,
        minHeight: 60,
        justifyContent: "flex-start",
        position: "relative",
    },
    groupTitle: {
        fontWeight: "700",
        fontSize: 20,
        color: "#222",
        marginBottom: 6,
    },
    groupCurator: {
        color: "#888",
        fontSize: 15,
        marginBottom: 1,
    },
    fabButton: {
        position: "absolute",
        bottom: 12,
        right: 12,
        width: 34,
        height: 34,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
    },
    fabButtonText: {
        color: "#fff",
        fontSize: 21,
        fontWeight: "700",
    },
    addButton: {
        backgroundColor: "#227be3",
        position: "absolute",
        bottom: 30,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: 32,
        alignItems: "center",
        justifyContent: "center",
        elevation: 6,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 36,
        marginBottom: 2,
    },
});
