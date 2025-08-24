// AuthContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AsyncStorage.getItem("user").then((data) => {
            if (data) setUser(JSON.parse(data));
            setLoading(false);
        });
    }, []);

    const signIn = async (email, password) => {
        // Здесь должна быть реальная проверка (например, сервер)
        if (email === "test@mirea.ru" && password === "123456") {
            const userData = { email };
            setUser(userData);
            await AsyncStorage.setItem("user", JSON.stringify(userData));
            return true;
        }
        return false;
    };

    const signOut = async () => {
        setUser(null);
        await AsyncStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
