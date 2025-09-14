import React from "react";
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    Linking,
    TouchableOpacity,
} from "react-native";

export const ContactsScreen = () => {
    const contacts = [
        {
            type: "Email",
            value: "info@example.com",
            link: "mailto:info@example.com",
        },
        {
            type: "Телефон",
            value: "+7 (123) 456-78-90",
            link: "tel:+71234567890",
        },
        {
            type: "Telegram",
            value: "@your_telegram",
            link: "https://t.me/your_telegram",
        },
        { type: "Адрес", value: "г. Москва, пр.Вернадского, 86" },
    ];

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.header}>Контакты</Text>
            <View style={styles.section}>
                {contacts.map((contact, index) => (
                    <TouchableOpacity
                        key={index}
                        disabled={!contact.link}
                        onPress={() =>
                            contact.link && Linking.openURL(contact.link)
                        }
                        style={
                            contact.link
                                ? styles.contactItemLink
                                : styles.contactItem
                        }
                    >
                        <Text style={styles.contactType}>{contact.type}:</Text>
                        <Text style={styles.contactValue}>{contact.value}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: "#fff", flex: 1 },
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#1976d2",
    },
    section: {},
    contactItem: {
        marginBottom: 16,
        paddingVertical: 8,
    },
    contactItemLink: {
        marginBottom: 16,
        paddingVertical: 8,
    },
    contactType: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
    },
    contactValue: {
        fontSize: 16,
        color: "#555",
    },
});
