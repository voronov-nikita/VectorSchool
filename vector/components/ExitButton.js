//
// Метод выхода из аккаунта
// Является немного костылем, но что поделать, зато работает 😜
//

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import React from "react";

export const ExitButton = ({ navigation }) => {
    // сразу вызываем логику выхода из текущей сессии
    useFocusEffect(
        React.useCallback(() => {
            AsyncStorage.clear();
            navigation.navigate("Auth");
        })
    );

    return null;
};
