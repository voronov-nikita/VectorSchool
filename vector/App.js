import React from "react";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';

import { AuthProvider, useAuth } from "./src/Auth";
import LoginScreen from "./src/Login";
import HomeScreen from "./src/Home";

const Stack = createNativeStackNavigator();

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <ActivityIndicator size="large" style={{ flex: 1 }} />;

  return (
    <Stack.Navigator>
      {user ? (
        <Stack.Screen name="Home" component={HomeScreen} />
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <AppRoutes />
      </NavigationContainer>
    </AuthProvider>
  );
}
