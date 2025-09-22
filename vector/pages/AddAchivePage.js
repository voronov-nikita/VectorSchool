import React, { useState } from "react";
import { View, TextInput, Button, Text, Image, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";

import { URL } from "../config";

export const AddAchiveScreen = ({ login }) => {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [imageUri, setImageUri] = useState(null);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 1,
        });

        if (!result.cancelled) {
            setImageUri(result.uri);
        }
    };

    const uploadAchievement = async () => {
        if (!name || !imageUri) {
            alert("Введите название и выберите изображение");
            return;
        }

        const formData = new FormData();
        formData.append("name", name);
        formData.append("description", description);
        const filename = imageUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image";

        formData.append("image", {
            uri:
                Platform.OS === "ios"
                    ? imageUri.replace("file://", "")
                    : imageUri,
            name: filename,
            type,
        });

        try {
            const response = await fetch(
                `${URL}/achievements`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "multipart/form-data",
                        login: login,
                    },
                    body: formData,
                }
            );
            const json = await response.json();
            if (json.error) {
                alert(`Ошибка: ${json.error}`);
            } else {
                alert("Ачивка успешно добавлена!");
                setName("");
                setDescription("");
                setImageUri(null);
            }
        } catch (e) {
            alert("Ошибка при загрузке");
        }
    };

    return (
        <View style={{ padding: 20 }}>
            <TextInput
                placeholder="Название достижения"
                value={name}
                onChangeText={setName}
                style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
            />
            <TextInput
                placeholder="Описание (необязательно)"
                value={description}
                onChangeText={setDescription}
                style={{ borderWidth: 1, padding: 8, marginBottom: 10 }}
            />
            <Button title="Выбрать изображение" onPress={pickImage} />
            {imageUri && (
                <Image
                    source={{ uri: imageUri }}
                    style={{ width: 200, height: 200, marginVertical: 10 }}
                />
            )}
            <Button title="Добавить достижение" onPress={uploadAchievement} />
        </View>
    );
};
