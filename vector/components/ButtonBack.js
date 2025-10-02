import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export const BackButton = ({ adress = "" }) => {
    const navigation = useNavigation();

    // Вернуть саму кнопку, чтобы рендер был гарантирован
    return (
        <TouchableOpacity
            onPress={() =>
                adress !== ""
                    ? navigation.navigate(adress)
                    : navigation.canGoBack()
                    ? navigation.goBack()
                    : null
            }
            style={{ marginLeft: 15 }}
        >
            <Ionicons name="arrow-back" size={24} color="#001124ff" />
        </TouchableOpacity>
    );
};
