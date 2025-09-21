// Модально окно уведомлений 
// 
// Иногда пользователь делает что-то не так и его нужно как-то предупредить
// о том, что он не прав в данной ситуации, поэтому используется модальное окно информирования
// Так как обычный Alert не работает в WEB версии данного приложения, 
// а приложение будет использоваться по большей части как раз в WEB, то необходим отдельный компонент,
// выполняющий данные роль
// 
// В файле представлено 2 экспортируемые функции:
// функция-класс *ModalContext* требуется для того, 
// чтобы наше модальное окно отображалось поверх остальных окон
// 
// Функция-метод useInfoModal, используется для того, чтобы как раз вызвать
// Модальное окно в нужный момент и передать текст с информацией о том, 
// что конкретно делал не так пользователь

import React, { createContext, useContext, useState } from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

// стандартная оболочка модального контента
const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
    const [modalData, setModalData] = useState({ visible: false, message: "" });

    function showModal(message) {
        setModalData({ visible: true, message });
    }
    function closeModal() {
        setModalData({ visible: false, message: "" });
    }

    return (
        <ModalContext.Provider value={{ showModal }}>
            {children}
            <Modal
                transparent={true}
                animationType="fade"
                visible={modalData.visible}
                onRequestClose={closeModal}
            >
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <Text style={styles.message}>{modalData.message}</Text>
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={closeModal}
                        >
                            <Text style={styles.closeBtnText}>Закрыть</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ModalContext.Provider>
    );
};

export function useInfoModal() {
    const ctx = useContext(ModalContext);
    if (!ctx) {
        throw new Error("useInfoModal must be used inside ModalProvider");
    }
    return ctx.showModal;
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        backgroundColor: "#fff",
        borderRadius: 12,
        paddingVertical: 25,
        paddingHorizontal: 20,
        width: "60%",
        alignItems: "center",
        elevation: 6,
    },
    message: {
        fontSize: 16,
        color: "#333",
        marginBottom: 18,
        textAlign: "center",
    },
    closeBtn: {
        backgroundColor: "#232946",
        borderRadius: 9,
        paddingVertical: 10,
        paddingHorizontal: 24,
    },
    closeBtnText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
});
