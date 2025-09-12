import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export const BackButton = () => {
    const navigation = useNavigation();

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerLeft: () => (
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={{ marginLeft: 15 }}
                >
                    <Ionicons name="arrow-back" size={24} color="#001124ff" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    // Компонент не рендерит UI сам по себе
    return null;
};
