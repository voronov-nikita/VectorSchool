import React from "react";
import { TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

export const BellButton = () => {
    const onPress = () => {
        console.log("НОВОЕ УВЕДОМЛЕНИЕ!");
    };

    return (
        <TouchableOpacity onPress={onPress} style={{ padding: 10 }}>
            <Icon name="notifications-outline" size={25} color="#000" />
        </TouchableOpacity>
    );
};

export default BellButton;
