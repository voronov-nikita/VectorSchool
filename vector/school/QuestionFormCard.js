import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Switch,
    Platform,
} from "react-native";

const COLORS = {
    background: "#181A22",
    card: "#222436",
    accent: "#eebbc3",
    text: "#fff",
    sub: "#b3b6c2",
    border: "#35384a",
    input: "#25273c",
    radio: "#eebbc3",
};

// Компонент одного вопроса
export const QuestionFormCard = ({
    question,
    onChange,
    index,
    onDelete,
    onAttachFile,
}) => {
    // question: { text, type, options, required }
    const [typeDropdown, setTypeDropdown] = useState(false);

    const typeLabels = {
        single: "Один из списка",
        multiple: "Несколько из списка",
        text: "Текстовый ответ",
    };

    // Обрабатываем изменение полей
    const change = (field, value) => {
        onChange(index, { ...question, [field]: value });
    };

    // Добавить вариант
    const addOption = () => {
        change("options", [...(question.options || []), ""]);
    };

    // Удалить вариант
    const removeOption = (i) => {
        change(
            "options",
            question.options.filter((_, idx) => idx !== i)
        );
    };

    // Изменить текст варианта
    const changeOption = (i, text) => {
        const newOpts = [...question.options];
        newOpts[i] = text;
        change("options", newOpts);
    };

    return (
        <View
            style={{
                backgroundColor: COLORS.card,
                borderRadius: 8,
                padding: 16,
                marginVertical: 8,
                borderWidth: 1,
                borderColor: COLORS.border,
                boxShadow:
                    Platform.OS === "web" ? "0 3px 8px #1118" : undefined,
            }}
        >
            {/* Вопрос */}
            <TextInput
                style={{
                    color: COLORS.text,
                    backgroundColor: COLORS.input,
                    fontSize: 18,
                    borderRadius: 4,
                    padding: 8,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                }}
                placeholder="Вопрос..."
                placeholderTextColor={COLORS.sub}
                value={question.text}
                onChangeText={(t) => change("text", t)}
            />

            {/* Переключатель типа вопроса */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                }}
            >
                <TouchableOpacity
                    onPress={() => setTypeDropdown((x) => !x)}
                    style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 6,
                        backgroundColor: COLORS.input,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: COLORS.border,
                        marginRight: 12,
                    }}
                >
                    <Text style={{ color: COLORS.accent, fontSize: 15 }}>
                        {typeLabels[question.type]}
                    </Text>
                    <Text style={{ marginLeft: 7, color: COLORS.sub }}>
                        &#9660;
                    </Text>
                </TouchableOpacity>
                {typeDropdown && (
                    <View
                        style={{
                            position: "absolute",
                            top: 40,
                            left: 0,
                            zIndex: 100,
                            backgroundColor: COLORS.card,
                            borderRadius: 4,
                            borderWidth: 1,
                            borderColor: COLORS.formBorder,
                            width: 170,
                        }}
                    >
                        {Object.entries(typeLabels).map(([val, label]) => (
                            <TouchableOpacity
                                key={val}
                                style={{ padding: 10 }}
                                onPress={() => {
                                    setTypeDropdown(false);
                                    change("type", val);
                                }}
                            >
                                <Text style={{ color: COLORS.accent }}>
                                    {label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
                <TouchableOpacity
                    onPress={onDelete}
                    style={{ marginLeft: "auto", padding: 6 }}
                >
                    <Text style={{ color: COLORS.sub }}>Удалить</Text>
                </TouchableOpacity>
            </View>

            {/* Переключатель "Обязательный" */}
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 13,
                }}
            >
                <Text
                    style={{ color: COLORS.sub, marginRight: 8, fontSize: 14 }}
                >
                    Обязательный вопрос
                </Text>
                <Switch
                    value={question.required || false}
                    onValueChange={(v) => change("required", v)}
                    thumbColor={COLORS.accent}
                    trackColor={{
                        true: COLORS.accent + "50",
                        false: COLORS.input,
                    }}
                />
            </View>

            {/* Варианты для выбора */}
            {(question.type === "single" || question.type === "multiple") && (
                <View>
                    {(question.options || []).map((opt, i) => (
                        <View
                            key={i}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                marginBottom: 7,
                            }}
                        >
                            <View
                                style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 9,
                                    borderWidth: 2,
                                    borderColor: COLORS.radio,
                                    alignItems: "center",
                                    justifyContent: "center",
                                    marginRight: 7,
                                    backgroundColor:
                                        question.type === "single"
                                            ? COLORS.card
                                            : COLORS.input,
                                }}
                            >
                                {question.type === "single" ? (
                                    <View
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: 5,
                                            backgroundColor: COLORS.radio,
                                        }}
                                    />
                                ) : (
                                    <View
                                        style={{
                                            width: 12,
                                            height: 12,
                                            borderRadius: 3,
                                            backgroundColor:
                                                COLORS.radio + "60",
                                        }}
                                    />
                                )}
                            </View>
                            <TextInput
                                style={{
                                    flex: 1,
                                    backgroundColor: COLORS.input,
                                    color: COLORS.text,
                                    borderWidth: 1,
                                    borderColor: COLORS.border,
                                    borderRadius: 4,
                                    paddingVertical: 4,
                                    paddingHorizontal: 8,
                                }}
                                value={opt}
                                onChangeText={(t) => changeOption(i, t)}
                                placeholder={`Вариант ${i + 1}`}
                                placeholderTextColor={COLORS.sub}
                            />
                            <TouchableOpacity onPress={() => removeOption(i)}>
                                <Text style={{ color: COLORS.sub, padding: 5 }}>
                                    ✖
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    <TouchableOpacity
                        onPress={addOption}
                        style={{ padding: 8 }}
                    >
                        <Text style={{ color: COLORS.accent }}>
                            + Добавить вариант
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Ответ для типа "текст" */}
            {question.type === "text" && (
                <Text style={{ color: COLORS.sub, fontStyle: "italic" }}>
                    Этот вопрос требует текстового ответа
                </Text>
            )}

            {/* Кнопка/иконка для прикрепления файла */}
            <TouchableOpacity
                style={{
                    marginTop: 12,
                    flexDirection: "row",
                    alignItems: "center",
                }}
                onPress={() => onAttachFile(index)}
            >
                <Text
                    style={{
                        color: COLORS.accent,
                        fontSize: 15,
                        marginRight: 6,
                    }}
                >
                    📎 Прикрепить изображение / файл
                </Text>
                {!!question.file && (
                    <Text style={{ color: COLORS.sub, fontSize: 12 }}>
                        {question.file.name}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
};
