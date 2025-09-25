import React from "react";
import {
    ScrollView,
    View,
    Text,
    StyleSheet,
    Linking,
    TouchableOpacity,
    Image,
} from "react-native";

import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";

import { avatars } from "../config";

export const ContactsScreen = () => {
    const contacts = [
        {
            id: "1",
            fullName: "Божко Георгий\nВадимович",
            telegram: "@GeorgyiBozhko",
            vk: "https://vk.com/george_bozhko",
            email: "bozhko_g@mirea.ru",
            role: "Командир отряда",
            avatar: avatars.gosha,
        },
        {
            id: "2",
            fullName: "Салаватуллина Алия\nАзатовна",
            telegram: "@a1iiiia",
            vk: "https://vk.com/aliia.aliia",
            email: "salavatullina@mirea.ru",
            role: "Первый комиссар",
            avatar: avatars.alia,
        },
        {
            id: "3",
            fullName: "Леонов Даниил\n",
            telegram: "@darbet17",
            vk: "https://vk.com/darbet01",
            email: "-",
            role: "Комиссар по креативной работе",
            avatar: avatars.dania,
        },
        {
            id: "4",
            fullName: "Кипреев Леонид\nАнатольевич",
            telegram: "@lkipreev",
            vk: "https://vk.com/lkipreev",
            email: "kipreev@mirea.ru",
            role: "Комиссар по корпоративной культуре",
            avatar: avatars.leny,
        },
        {
            id: "5",
            fullName: "Бальданова Анна \nВладиславовна",
            telegram: "@annabeldanova",
            vk: "https://vk.com/annabeldanova",
            email: "beldanova@mirea.ru",
            role: "Комиссар по работе со студентами",
            avatar: avatars.anna,
        },
    ];

    const ContactCard = ({ contact }) => (
        <View style={styles.card}>
            <Image source={contact.avatar} style={styles.avatar} />
            <View style={styles.info}>
                <Text style={styles.fullName}>{contact.fullName}</Text>
                <Text style={styles.role}>{contact.role}</Text>

                <TouchableOpacity
                    onPress={() =>
                        Linking.openURL(
                            `https://t.me/${contact.telegram.replace(/^@/, "")}`
                        )
                    }
                >
                    <Text style={styles.link}>
                        Telegram: {contact.telegram}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => Linking.openURL(contact.vk)}>
                    <Text style={styles.link}>VK: {contact.vk}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => Linking.openURL(`mailto:${contact.email}`)}
                >
                    <Text style={styles.link}>Email: {contact.email}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.container2}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        Linking.openURL("https://t.me/vector_mirea");
                    }}
                >
                    <FontAwesome name="telegram" size={20} color="#006effff" />
                    <Text style={styles.buttonText}> Телеграм Канал</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                        Linking.openURL("https://vk.com/vector_mirea");
                    }}
                >
                    <FontAwesome name="vk" size={20} color="#006effff" />
                    <Text style={styles.buttonText}> Группа ВКонтакте</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.section}>
                {contacts.map((contact) => (
                    <ContactCard key={contact.id} contact={contact} />
                ))}
            </View>

            <View style={styles.footer}>
                <Text style={styles.copyright}>
                    © 2025 МИРЭА – Российский технологический университет{"\n"}
                    Профориентационный отряд "Вектор"{"\n"}
                </Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { padding: 20, backgroundColor: "#fff", flex: 1 },
    section: {},
    header: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: "#1976d2",
    },
    section: {},
    card: {
        flexDirection: "row",
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        padding: 15,
        marginBottom: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        marginRight: 15,
    },
    info: {
        flex: 1,
    },
    fullName: {
        fontWeight: "700",
        fontSize: 18,
        marginBottom: 4,
        color: "#333",
    },
    role: {
        fontSize: 14,
        color: "#666",
        marginBottom: 8,
    },
    link: {
        color: "#1976d2",
        marginBottom: 4,
        fontSize: 16,
    },
    container2: {
        flexDirection: "row",
        justifyContent: "center", // сближение кнопок по центру
        gap: 12, // современный способ задать промежуток в RN версиях, где поддерживается (Иначе использовать marginRight)
        marginVertical: 20,
    },
    button: {
        flexDirection: "row", // иконка и текст в ряд
        backgroundColor: "#fff",
        borderColor: "#000",
        borderWidth: 2,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        minWidth: 140,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },

    buttonText: {
        color: "#000",
        fontSize: 16,
        fontWeight: "600",
    },
    footer: {
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#fafafa",
        padding: 15,
        alignItems: "center",
        borderTopWidth: 1,
        borderColor: "#ddd",
    },
    copyright: {
        textAlign: "center",
        color: "#888",
        fontSize: 13,
        marginTop: 8,
    },
});
