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
import { NewsScreen } from "./pages/NewsPage";
import { UsersScreen } from "./pages/UsersPage";
import { EventsScreen } from "./pages/EventsPage";
import { ProfileScreen } from "./pages/ProfilePage";
import { ContactsScreen } from "./pages/ContactsPage";
import { StatisticsScreen } from "./pages/StatisticPage";
import { InstructionScreen } from "./pages/InstructionPage";

// компоненты для нормальной работы
import BellButton from "./components/NotifictionButton";
import { ModalProvider } from "./components/InfoModal";
import { ExitButton } from "./components/ExitButton";
import { BackButton } from "./components/ButtonBack";

// Все блоки, которые использует школа Вектора
import { SchoolOneGroupScreen } from "./school/SchoolOneGroupPage";
import { SchoolAchiveScreen } from "./school/SchoolAchivePage";
import { SchoolMainScreen } from "./school/SchoolMainPage";
import { CreateTestScreen } from "./school/CreateTestPage";
import { SchoolGroupsScreen } from "./school/GroupsPage";
import { HomeworkScreen } from "./school/HomeworkPage";
import { TakeTestScreen } from "./school/TakeTestPage";
import { TestsScreen } from "./school/TestsPage";
import { AttendanceScreen } from "./pages/AttendancePage";
import { GameScreen } from "./school/GamePage";
import { AddQuestionForm } from "./school/AddQuestionPage";

// Создаем конфигуратор Drawer и Stack
const Drawer = createDrawerNavigator();

// Главная функция приложения
export default function App() {
    return (
        <ModalProvider>
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
                            title: 'Авторизация',
                            drawerItemStyle: { display: "none" },
                        }}
                        component={AuthScreen}
                    />
                    <Drawer.Screen
                        name="CreateTest"
                        options={{
                            headerTitle: "Создание нового теста",
                            headerShown: true,
                            headerLeft: () => <BackButton adress="Tests" />,
                            drawerItemStyle: { display: "none" },
                        }}
                        component={CreateTestScreen}
                    />
                    <Drawer.Screen
                        name="SchoolGroups"
                        options={{
                            headerTitle: "Группы",
                            headerShown: true,
                            headerLeft: () => (
                                <BackButton adress="SchoolMain" />
                            ),
                            drawerItemStyle: { display: "none" },
                        }}
                        component={SchoolGroupsScreen}
                    />
                    <Drawer.Screen
                        name="Game"
                        options={{
                            headerTitle: "",
                            headerShown: false,
                            headerLeft: () => (
                                <BackButton adress="SchoolMain" />
                            ),
                            drawerItemStyle: { display: "none" },
                        }}
                        component={GameScreen}
                    />
                    <Drawer.Screen
                        name="AddQuestionQuize"
                        options={{
                            headerTitle: "",
                            headerShown: true,
                            headerLeft: () => (
                                <BackButton adress="SchoolMain" />
                            ),
                            drawerItemStyle: { display: "none" },
                        }}
                        component={AddQuestionForm}
                    />
                    {/* <Drawer.Screen
                        name="SchoolJournal"
                        options={{
                            headerTitle: "Журнал посещаемости",
                            headerShown: true,
                            headerLeft: () => <BackButton adress="SchoolMain"/>,
                            drawerItemStyle: { display: "none" },
                        }}
                        component={JournalScreen}
                    /> */}
                    <Drawer.Screen
                        name="Tests"
                        options={{
                            headerTitle: "Тесты",
                            headerShown: true,
                            headerLeft: () => (
                                <BackButton adress="SchoolMain" />
                            ),
                            drawerItemStyle: { display: "none" },
                        }}
                        component={TestsScreen}
                    />
                    <Drawer.Screen
                        name="Homework"
                        options={{
                            headerTitle: "Домашняя работа",
                            headerShown: true,
                            headerLeft: () => (
                                <BackButton adress="SchoolMain" />
                            ),
                            drawerItemStyle: { display: "none" },
                        }}
                        component={HomeworkScreen}
                    />
                    <Drawer.Screen
                        name="TakeTest"
                        options={{
                            headerTitle: "Тестирование",
                            headerShown: true,
                            headerLeft: () => <BackButton adress="Tests" />,
                            drawerItemStyle: { display: "none" },
                        }}
                        component={TakeTestScreen}
                    />
                    <Drawer.Screen
                        name="SchoolOneGroup"
                        options={{
                            headerTitle: "Список группы",
                            headerLeft: () => (
                                <BackButton adress="SchoolGroups" />
                            ),
                            drawerItemStyle: { display: "none" },
                        }}
                        component={SchoolOneGroupScreen}
                    />
                    <Drawer.Screen
                        name="SchoolAchive"
                        options={{
                            headerTitle: "Достижения",
                            headerLeft: () => (
                                <BackButton adress="SchoolMain" />
                            ),
                            drawerItemStyle: { display: "none" },
                        }}
                        component={SchoolAchiveScreen}
                    />
                    <Drawer.Screen
                        name="Home"
                        options={{
                            title: "Главная",
                            // headerRight: () => <BellButton />,
                            headerTitleAlign: "center",
                        }}
                        component={HomeScreen}
                    />
                    <Drawer.Screen
                        name="News"
                        options={{
                            title: "Новости",
                            headerTitleAlign: "center",
                            drawerItemStyle: { display: "none" },
                        }}
                        component={NewsScreen}
                    />
                    <Drawer.Screen
                        name="Instruction"
                        options={{
                            title: "Инструкци и правила пользования",
                            headerTitleAlign: "center",
                            drawerItemStyle: {display: 'none'}
                        }}
                        component={InstructionScreen}
                    />
                    <Drawer.Screen
                        name="Contacts"
                        options={{
                            title: "Контакты",
                            headerTitleAlign: "center",
                        }}
                        component={ContactsScreen}
                    />
                    <Drawer.Screen
                        name="SchoolMain"
                        options={{
                            headerTitle: "Школа Вектора",
                            headerLeft: () => <BackButton adress="Home" />,
                            drawerItemStyle: { display: "none" },
                        }}
                        component={SchoolMainScreen}
                    />
                    <Drawer.Screen
                        name="Profile"
                        options={{
                            title: "Профиль",
                            headerTitleAlign: "center",
                        }}
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
                            drawerItemStyle: { display: "none" },
                        }}
                        component={StatisticsScreen}
                    />
                    <Drawer.Screen
                        name="Events"
                        options={{
                            title: "Мероприятия",
                            headerTitleAlign: "center",
                            headerLeft: () => <BackButton adress="SchoolMain"/>,
                        }}
                        component={EventsScreen}
                    />
                    <Drawer.Screen
                        name="Attendance"
                        options={{
                            title: "Посещения",
                            headerTitleAlign: "center",
                            headerLeft: () => <BackButton adress="Events" />,
                            drawerItemStyle: { display: "none" },
                        }}
                        component={AttendanceScreen}
                    />
                    <Drawer.Screen
                        name="PGAS"
                        options={{
                            title: "ПГАС",
                            headerTitleAlign: "center",
                            drawerItemStyle: { display: "none" },
                        }}
                        component={PGASScreen}
                    />

                    <Drawer.Screen
                        name="Exit"
                        options={{ title: "Выход" }}
                        component={ExitButton}
                    />
                </Drawer.Navigator>
            </NavigationContainer>
        </ModalProvider>
    );
}
