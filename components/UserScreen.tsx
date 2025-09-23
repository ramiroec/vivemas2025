import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import * as Font from 'expo-font';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Login: undefined;
  Registrate1Editar: undefined;
  Registrate2Editar: undefined;
  RegistrateSaludEditar: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const UserScreen: React.FC<Props> = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [emailMarketingEnabled, setEmailMarketingEnabled] = useState<boolean>(true);
  const [nombre, setNombre] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idUsuario = await AsyncStorage.getItem('idUsuario');
        if (idUsuario) {
          const patientResponse = await api.get(`/paciente/${idUsuario}`);
          const patientData = patientResponse.data;
          setNombre(`${patientData.nombre} ${patientData.apellido}`);
          setEmail(patientData.email);
        }
      } catch (error) {
        console.error('Error al obtener datos del paciente:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Gotham-Regular': require('../assets/Fonts/gotham2/GothamRegular.otf'),
          'Gotham-Bold': require('../assets/Fonts/gotham2/GothamBold.ttf'),
          'Gotham-Light': require('../assets/Fonts/gotham2/Gotham-Light.otf'),
          'Gotham-Black': require('../assets/Fonts/gotham2/Gotham-Black.otf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    };
    loadFonts();
  }, []);

  useEffect(() => {
    const fetchNotificationSettings = async () => {
      try {
        const storedNotificationsEnabled = await AsyncStorage.getItem('notificationsEnabled');
        const storedEmailMarketingEnabled = await AsyncStorage.getItem('emailMarketingEnabled');

        if (storedNotificationsEnabled !== null) {
          setNotificationsEnabled(JSON.parse(storedNotificationsEnabled));
        }
        if (storedEmailMarketingEnabled !== null) {
          setEmailMarketingEnabled(JSON.parse(storedEmailMarketingEnabled));
        }
      } catch (error) {
        console.error('Error al cargar configuraciones de notificaciones:', error);
      }
    };
    fetchNotificationSettings();
  }, []);

  useEffect(() => {
    const saveNotificationSettings = async () => {
      try {
        await AsyncStorage.setItem('notificationsEnabled', JSON.stringify(notificationsEnabled));
        await AsyncStorage.setItem('emailMarketingEnabled', JSON.stringify(emailMarketingEnabled));
      } catch (error) {
        console.error('Error al guardar configuraciones de notificaciones:', error);
      }
    };
    saveNotificationSettings();
  }, [notificationsEnabled, emailMarketingEnabled]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove([
        'idUsuario',
        'token',
        'nombre',
        'id_paciente',
      ]);
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.scrollViewContent, { paddingBottom: 140 }]}
        keyboardShouldPersistTaps="handled"
      >
         <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.userName}>{nombre || 'Usuario'}</Text>
            <Text style={styles.userEmail}>{email || 'Usuario'}</Text>
          </View>

          {[
            { label: 'Datos de Registro', route: 'Registrate1Editar', style: styles.sectionTitle },
            { label: 'Datos Personales', route: 'Registrate2Editar', style: styles.sectionTitle2 },
            { label: 'Información de Salud', route: 'RegistrateSaludEditar', style: styles.sectionTitlesalud },
          ].map(({ label, route, style }) => (
            <TouchableOpacity
              key={route}
              style={[styles.section, { flexDirection: 'row', alignItems: 'center' }]}
              onPress={() => navigation.navigate(route as keyof RootStackParamList)}
            >
              <Text style={style}>{label}</Text>
              <MaterialIcons
                name="chevron-right"
                size={24}
                color="#3A90E6"
                style={styles.chevron}
              />
            </TouchableOpacity>
          ))}

          <View style={styles.notificationsSection}>
            <Text style={styles.sectionTitle}>Notificaciones</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Recibir Notificaciones</Text>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#767577', true: '#14D3A7' }}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Recibir Publicidad</Text>
              <Switch
                value={emailMarketingEnabled}
                onValueChange={setEmailMarketingEnabled}
                trackColor={{ false: '#767577', true: '#14D3A7' }}
              />
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle3}>Política de Privacidad & Condiciones</Text>
            <View style={styles.policySection}>
              <Text style={styles.policyText}>
                Al registrarte a Vive +, aceptás nuestra
              </Text>
              <TouchableOpacity onPress={() => Linking.openURL('https://vivemas.com.py/privacidad/')}>
                <Text style={styles.policyLink}> Política de Privacidad & Términos y Condiciones de uso.</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
            <Text style={styles.signOutText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 22,
    fontFamily: 'Gotham-Regular',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: 'gray',
    fontFamily: 'Gotham-Regular',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Gotham-Regular',
    marginRight: 145,
  },
  sectionTitle2: {
    fontSize: 16,
    fontFamily: 'Gotham-Regular',
    marginRight: 152,
  },
  sectionTitle3: {
    fontSize: 16,
    fontFamily: 'Gotham-Regular',
  },
  sectionTitlesalud: {
    fontSize: 16,
    marginRight: 105,
    fontFamily: 'Gotham-Regular',
  },
  notificationsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 130,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',//center 
    justifyContent: 'space-between',
   //marginBottom: 10,
  },
  switchLabel: {
    fontSize: 14,
    padding:20,
    fontFamily: 'Gotham-Regular',
    color: '#6B7280',
  },
  infoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  policySection: {
    alignItems: 'center',
    marginBottom: 10,
  },
  policyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 15,
    fontFamily: 'Gotham-Regular',
  },
  policyLink: {
    fontSize: 20,
    color: '#2c9dd1',
    textDecorationLine: 'underline',
    fontFamily: 'Gotham-Regular',
  },
  signOutButton: {
    backgroundColor: '#e63a3a1a',
    borderRadius: 16,
    height: 48,
    marginHorizontal: 16,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  signOutText: {
    color: '#e63a3a',
    fontSize: 16,
    fontFamily: 'Gotham-Regular',
  },
    loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: 'auto',
  },
});


export default UserScreen;
