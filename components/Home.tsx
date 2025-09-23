import React, { JSX } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './HomeScreen';
import MetaScreen from './MetaScreen';
import PremiosScreen from './PremiosScreen';
import ListadoCanje from './ListadoCanje';
import VerPremio from './VerPremio';
import DailyHistory from './DailyHistory';
import MetaAnual from './MetaAnual';
import UserScreen from './UserScreen';

// Define las rutas disponibles
export type TabParamList = {
  Home: undefined;
  Meta: undefined;
  Premios: undefined;
  Usuario: undefined;
};

export type MetaStackParamList = {
  MetaScreen: undefined;
  MetaAnual: undefined;
  DailyHistory: { dailyGoals: Record<string, { steps: number; calories: number }> };
};

export type PrizesStackParamList = {
  PremiosScreen: undefined;
  ListadoCanje: undefined;
  VerPremio: { premio: any }; // <-- ajustar a la interfaz real si querés más tipado
};

const Tab = createBottomTabNavigator<TabParamList>();
const MetaStackNav = createNativeStackNavigator<MetaStackParamList>();
const PrizesStackNav = createNativeStackNavigator<PrizesStackParamList>();

function MetaStack(): JSX.Element {
  return (
    <MetaStackNav.Navigator screenOptions={{ headerShown: false }}>
      <MetaStackNav.Screen name="MetaScreen" component={MetaScreen} />
      <MetaStackNav.Screen name="MetaAnual" component={MetaAnual} />
      <MetaStackNav.Screen name="DailyHistory" component={DailyHistory} />
    </MetaStackNav.Navigator>
  );
}

function PrizesStack(): JSX.Element {
  return (
    <PrizesStackNav.Navigator screenOptions={{ headerShown: false }}>
      <PrizesStackNav.Screen name="PremiosScreen" component={PremiosScreen} />
      <PrizesStackNav.Screen name="ListadoCanje" component={ListadoCanje} />
      <PrizesStackNav.Screen name="VerPremio" component={VerPremio} />
    </PrizesStackNav.Navigator>
  );
}

const HomeTabs: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home-outline';
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Meta') iconName = focused ? 'list' : 'list-outline';
          else if (route.name === 'Premios') iconName = focused ? 'gift' : 'gift-outline';
          else if (route.name === 'Usuario') iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2c9dd1',
        tabBarInactiveTintColor: 'gray',
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: 64,
          paddingBottom: 10,
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 8,
          zIndex: 100,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Meta" component={MetaStack} />
      <Tab.Screen name="Premios" component={PrizesStack} />
      <Tab.Screen name="Usuario" component={UserScreen} />
    </Tab.Navigator>
  );
};

export default HomeTabs;
