import React from "react";
import { ScrollView, View, Text, StyleSheet } from "react-native";

export const InstructionScreen = () => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Мероприятия</Text>
                <Text style={styles.sectionText}>
                    Мероприятия — это запланированные занятия, которые
                    отображаются в вашем электронном журнале. Вы можете
                    добавлять новые занятия, указывать дату и тип занятия, чтобы
                    организовать учебный процесс.
                </Text>
                <Text style={styles.sectionText}>
                    Понимание и правильное использование мероприятий позволит
                    контролировать посещаемость и вести учет учебных занятий.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                    Что это и как этим пользоваться
                </Text>
                <Text style={styles.sectionText}>
                    Электронный журнал предназначен для удобного и быстрого
                    ведения посещаемости студентов. В нем можно фиксировать
                    присутствие или отсутствие на занятиях, редактировать данные
                    и получать отчеты.
                </Text>
                <Text style={styles.sectionText}>
                    Для работы с журналом выберите группу, затем откроется
                    список студентов и мероприятий. Кликайте по ячейкам с
                    отметками посещаемости, чтобы изменить статус.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Инструкция</Text>
                <Text style={styles.sectionText}>
                    1. Выберите нужную группу из списка групп.
                </Text>
                <Text style={styles.sectionText}>
                    2. Просмотрите расписание и список студентов.
                </Text>
                <Text style={styles.sectionText}>
                    3. Для изменения отметки посещаемости нажмите на нужную
                    ячейку.
                </Text>
                <Text style={styles.sectionText}>
                    4. Чтобы добавить новую группу или студента, используйте
                    кнопки с плюсом в правом нижнем углу соответствующих
                    страниц.
                </Text>
                <Text style={styles.sectionText}>
                    5. Все изменения сохраняются автоматически и отображаются в
                    реальном времени.
                </Text>
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
    },
    section: { marginBottom: 24 },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 8,
        color: "#1976d2",
    },
    sectionText: {
        fontSize: 16,
        lineHeight: 22,
        color: "#333",
        marginBottom: 6,
    },
});
