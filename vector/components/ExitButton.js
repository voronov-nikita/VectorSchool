//
// Метод выхода из аккаунта
// Является немного костылем, но что поделать, зато работает 😜
//

import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";


export const ExitButton = ({ navigation }) => {
    // сразу вызываем логику выхода из текущей сессии
    useFocusEffect(() => {
        AsyncStorage.clear();
        navigation.reset({ index: 0, routes: [{ name: "Auth" }] });
    }, []);

    return null;
};
