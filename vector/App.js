//
// Основной файл разработки
// Сюда все импортируется
//

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createDrawerNavigator } from "@react-navigation/drawer";

// Импорт страниц
import { PGASScreen } from "./pages/PGAS";
import { AuthScreen } from "./pages/AuthPage";
import { HomeScreen } from "./pages/HomePage";
import { UsersScreen } from "./pages/UsersPage";
import { ProfileScreen } from "./pages/ProfilePage";
import { EventsScreen } from "./pages/EventsPage";
import { StatisticsScreen } from "./pages/StatisticPage";

import { ExitButton } from "./components/ExitButton";
import { BackButton } from "./components/ButtonBack";

import { SchoolMainScreen } from "./school/SchoolMainPage";
import { SchoolOneGroupScreen } from "./school/SchoolOneGroupPage";

// Создаем конфигуратор Drawer и Stack
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Главная функция приложения
export default function App() {
    return (
        <NavigationContainer>
            <Drawer.Navigator
                initialRouteName="Auth"
                screenOptions={{
                    drawerStyle: {
                        backgroundColor: "#f0f0f0",
                        width: 250,
                    },
                }}
            >
                <Drawer.Screen
                    name="Auth"
                    options={{
                        headerShown: false,
                        drawerItemStyle: { display: "none" },
                    }}
                    component={AuthScreen}
                />
                <Drawer.Screen
                    name="SchoolOneGroup"
                    options={{
                        headerTitle: "Список группы",
                        headerLeft: () => <BackButton />,
                        drawerItemStyle: { display: "none" },
                    }}
                    component={SchoolOneGroupScreen}
                />
                <Drawer.Screen
                    name="Home"
                    options={{ title: "Главная", headerTitleAlign: "center" }}
                    component={HomeScreen}
                />
                <Drawer.Screen
                    name="SchoolMain"
                    options={{
                        headerTitle: "Группы",
                        headerLeft: () => <BackButton />,
                        drawerItemStyle: { display: "none" },
                    }}
                    component={SchoolMainScreen}
                />
                <Drawer.Screen
                    name="Profile"
                    options={{ title: "Профиль", headerTitleAlign: "center" }}
                    component={ProfileScreen}
                />
                <Drawer.Screen
                    name="Users"
                    options={{
                        title: "Список бойцов",
                        headerTitleAlign: "center",
                    }}
                    component={UsersScreen}
                />
                <Drawer.Screen
                    name="Statistics"
                    options={{
                        title: "Статистика",
                        headerTitleAlign: "center",
                    }}
                    component={StatisticsScreen}
                />
                <Drawer.Screen
                    name="Events"
                    options={{
                        title: "Мероприятия",
                        headerTitleAlign: "center",
                    }}
                    component={EventsScreen}
                />
                <Drawer.Screen
                    name="PGAS"
                    options={{ title: "ПГАС", headerTitleAlign: "center" }}
                    component={PGASScreen}
                />

                <Drawer.Screen
                    name="Exit"
                    options={{ title: "Выход" }}
                    component={ExitButton}
                />
            </Drawer.Navigator>
        </NavigationContainer>
    );
}
