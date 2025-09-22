//
// Метод выхода из аккаунта
// Является немного костылем, но что поделать, зато работает 😜
//

import React, { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ExitButton = ({ navigation }) => {
    useEffect(() => {
        AsyncStorage.clear();
        navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
    }, []);
};
