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

/*import DrawerNavigator from './components/DrawerNavigator';
import RegistrateSalud from './components/RegistrateSalud';
import RegistrateSalud2 from './components/RegistrateSalud2';
import RegistrateSalud3 from './components/RegistrateSalud3';
import RecuperarContrasena from './components/RecuperarContrasena';
import ListadoCanje from './components/ListadoCanje';
import PremiosScreen from './components/PremiosScreen';
import VerPremio from './components/VerPremio';
import MetaScreen from './components/MetaScreen';
import DailyHistory from './components/DailyHistory';
import MetaAnual from './components/MetaAnual';
import CanjePremio from './components/CanjePremio';
import Registrate1Editar from './components/Registrate1Editar';
import Registrate2Editar from './components/Registrate2Editar';
import RegistrateSaludEditar from './components/RegistrateSaludEditar';
import UserScreen from './components/UserScreen';
import HomeScreen from './components/HomeScreen';
*/
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" hidden />
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Registrate1" component={Registrate1} />
        <Stack.Screen name="Registrate2" component={Registrate2} />
        <Stack.Screen name="Registrate3" component={Registrate3} />

{/*     <Stack.Screen name="MainHome" component={DrawerNavigator} />
        <Stack.Screen name="RegistrateSalud" component={RegistrateSalud} />
        <Stack.Screen name="RegistrateSalud2" component={RegistrateSalud2} />
        <Stack.Screen name="RegistrateSalud3" component={RegistrateSalud3} />
        <Stack.Screen name="RecuperarContrasena" component={RecuperarContrasena} />
        <Stack.Screen name="ListadoCanje" component={ListadoCanje} />
        <Stack.Screen name="PremiosScreen" component={PremiosScreen} />
        <Stack.Screen name="VerPremio" component={VerPremio} />
        <Stack.Screen name="MetaScreen" component={MetaScreen} />
        <Stack.Screen name="DailyHistory" component={DailyHistory} />
        <Stack.Screen name="MetaAnual" component={MetaAnual} />
        <Stack.Screen name="CanjePremio" component={CanjePremio} />
        <Stack.Screen name="Registrate1Editar" component={Registrate1Editar} />
        <Stack.Screen name="Registrate2Editar" component={Registrate2Editar} />
        <Stack.Screen name="RegistrateSaludEditar" component={RegistrateSaludEditar} />
        <Stack.Screen name="UserScreen" component={UserScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
*/}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
