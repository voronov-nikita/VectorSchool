import React from "react";
import { View, Text, Button } from "react-native";
import { useAuth } from "./Auth";

export default function HomeScreen() {
    const { user, signOut } = useAuth();

    return (
        <View>
            <Text>Здравствуйте, {user.email}!</Text>
            <Button title="Выйти" onPress={signOut} />
        </View>
    );
}
