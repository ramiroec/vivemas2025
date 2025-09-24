// App.tsx
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// importa tus pantallas principales (ajusta rutas si tus archivos se llaman distinto)
import WelcomeScreen from './components/WelcomeScreen';
import LoginScreen from './components/LoginScreen';
import HomeTabs from './components/Home';

// Agrega el tipo global del stack raíz (ajusta los params si quieres más precisión)
export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  MainHome: undefined;
  Registrate1: undefined;
  Registrate2: undefined;
  Registrate3: undefined;
  PremiosScreen: undefined;
  VerPremio: { premio?: any };
  MetaScreen: undefined;
  DailyHistory: { dailyGoals: Record<string, { steps: number; calories: number }> };
  UserScreen: undefined;
};

// Crea el navigator tipado
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  useEffect(() => {
    (async () => {
      try {
        // carga dinámica para evitar crash en Expo Go si el modulo nativo no está linkeado
        const NavigationBar = require('expo-navigation-bar');
        if (Platform.OS === 'android' && NavigationBar?.setVisibilityAsync) {
          await NavigationBar.setVisibilityAsync('hidden');
          // comportamiento overlay-swipe mejora interacción con gestos
          // setBehaviorAsync may not be supported on devices with edge-to-edge enabled
          // or certain platform/runtime combinations. Guard with a try/catch to avoid
          // warnings/crashes when it's not supported.
          if (NavigationBar.setBehaviorAsync) {
            try {
              await NavigationBar.setBehaviorAsync('overlay-swipe');
            } catch (err) {
              // No-op: the platform doesn't support changing the nav bar behavior.
              // This avoids the runtime warning about edge-to-edge.
            }
          }
        }
      } catch (e) {
        // módulo no disponible en este runtime (Expo Go) -> no hacer nada
      }
    })();
  }, []);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="MainHome" component={HomeTabs} />
          {/* agrega aquí otras pantallas que necesites */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
