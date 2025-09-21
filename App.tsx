// App.tsx
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importa tus componentes
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import Registrate1 from './components/Registrate1';
import Registrate2 from './components/Registrate2';
import Registrate3 from './components/Registrate3';
import DrawerNavigator from './components/DrawerNavigator';
import ListadoCanje from './components/ListadoCanje';
import PremiosScreen from './components/PremiosScreen';
import VerPremio from './components/VerPremio';
import MetaScreen from './components/MetaScreen';
import DailyHistory from './components/DailyHistory';
import MetaAnual from './components/MetaAnual';
//import CanjePremio from './components/CanjePremio';
import UserScreen from './components/UserScreen';
import HomeScreen from './components/HomeScreen';

// Agrega el tipo global del stack raíz (ajusta los params si quieres más precisión)
type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  MainHome: undefined;
  Registrate1: undefined;
  Registrate2: undefined;
  Registrate3: undefined;
  ListadoCanje: undefined;
  PremiosScreen: undefined;
  VerPremio: { premio: any }; // ajustar a la interfaz Premio si la exportás
  MetaScreen: undefined;
  DailyHistory: { dailyGoals: Record<string, { steps: number; calories: number }> };
  MetaAnual: undefined;
  UserScreen: undefined;
  HomeScreen: undefined;
};

// Crea el navigator tipado
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" hidden />
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainHome" component={DrawerNavigator} options={{ headerShown: false }} />
        <Stack.Screen name="Registrate1" component={Registrate1} />
        <Stack.Screen name="Registrate2" component={Registrate2} />
        <Stack.Screen name="Registrate3" component={Registrate3} />
        <Stack.Screen name="ListadoCanje" component={ListadoCanje} />
        <Stack.Screen name="PremiosScreen" component={PremiosScreen} />
        <Stack.Screen name="VerPremio" component={VerPremio} />
        <Stack.Screen name="MetaScreen" component={MetaScreen} />
        <Stack.Screen name="DailyHistory" component={DailyHistory} />
        <Stack.Screen name="MetaAnual" component={MetaAnual} />
        <Stack.Screen name="UserScreen" component={UserScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
