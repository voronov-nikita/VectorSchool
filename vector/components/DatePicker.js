import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
    StyleSheet,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export const DatePicker = ({ date, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);

    if (Platform.OS === "web") {
        // Web: используем нативный input type="date"
        return (
            <input
                type="date"
                value={date.toISOString().split("T")[0]}
                onChange={(e) => onChange(new Date(e.target.value))}
                style={styles.webInput}
            />
        );
    }

    const onChangeNative = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) {
            onChange(selectedDate);
        }
    };

    return (
        <View>
            <TouchableOpacity
                onPress={() => setShowPicker(true)}
                style={styles.mobileButton}
            >
                <Text>{formatDateForDisplay(date)}</Text>
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={onChangeNative}
                />
            )}
        </View>
    );
};

export const TimePicker = ({ time, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);

    if (Platform.OS === "web") {
        // Web: используем нативный input type="time"
        return (
            <input
                type="time"
                value={time.toTimeString().slice(0, 5)}
                onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(":");
                    const newDate = new Date(time);
                    newDate.setHours(Number(hours));
                    newDate.setMinutes(Number(minutes));
                    onChange(newDate);
                }}
                style={styles.webInput}
            />
        );
    }

    const onChangeNative = (event, selectedTime) => {
        setShowPicker(false);
        if (selectedTime) {
            onChange(selectedTime);
        }
    };

    return (
        <View>
            <TouchableOpacity
                onPress={() => setShowPicker(true)}
                style={styles.mobileButton}
            >
                <Text>{formatTimeForDisplay(time)}</Text>
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={time}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={onChangeNative}
                />
            )}
        </View>
    );
};

// Формат даты для отображения дд.мм.гггг
export const formatDateForDisplay = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}.${mm}.${yyyy}`;
};

// Формат времени для отображения чч:мм
export const formatTimeForDisplay = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
};

const styles = StyleSheet.create({
    webInput: {
        padding: 8,
        borderRadius: 6,
        borderColor: "#a0bfff",
        borderWidth: 1,
        fontSize: 16,
        width: 150,
    },
    mobileButton: {
        padding: 10,
        backgroundColor: "#e9f5ff",
        borderRadius: 6,
    },
});
