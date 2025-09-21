import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import * as Font from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

type RootStackParamList = {
  Login: undefined;
  HomeScreen: undefined;
  MetaScreen: undefined;
  MetaAnual: undefined;
  DailyHistory: undefined;
  PremiosScreen: undefined;
  ListadoCanje: undefined;
  UserScreen: undefined;
  Registrate1Editar: undefined;
  Registrate2Editar: undefined;
  RegistrateSaludEditar: undefined;
};

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList>;
};

const CustomDrawer: React.FC<Props> = ({ navigation }) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [fontsLoaded, setFontsLoaded] = useState(false);

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
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    };
    loadFonts();
  }, []);

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
    <View style={styles.drawerContainer}>
      <LinearGradient
        colors={['#3A90E6', '#3A90E6', '#14D3A7']}
        style={styles.headerContainer}
      >
        <Text style={styles.userName}>{nombre || 'Usuario'}</Text>
        <Text style={styles.userEmail}>{email || 'usuario@email.com'}</Text>
      </LinearGradient>

      <View style={styles.menuContainer}>
        <View style={styles.menuItemsContainer}>
          {/* Principal arriba de todo */}
          <TouchableOpacity onPress={() => navigation.navigate('HomeScreen')} style={styles.menuItem}>
            <MaterialIcons name="home" size={22} color="#3A90E6" style={styles.menuIcon} />
            <Text style={styles.drawerItem}>Principal</Text>
          </TouchableOpacity>

          {/* Meta */}
          <TouchableOpacity onPress={() => navigation.navigate('MetaScreen')} style={styles.menuItem}>
            <MaterialIcons name="flag" size={22} color="#3A90E6" style={styles.menuIcon} />
            <Text style={styles.drawerItem}>Meta</Text>
          </TouchableOpacity>

          {/* Premios */}
          <TouchableOpacity onPress={() => navigation.navigate('PremiosScreen')} style={styles.menuItem}>
            <MaterialIcons name="card-giftcard" size={22} color="#3A90E6" style={styles.menuIcon} />
            <Text style={styles.drawerItem}>Premios</Text>
          </TouchableOpacity>

          {/* Usuario */}
          <TouchableOpacity onPress={() => navigation.navigate('UserScreen')} style={styles.menuItem}>
            <MaterialIcons name="person" size={22} color="#3A90E6" style={styles.menuIcon} />
            <Text style={styles.drawerItem}>Usuario</Text>
          </TouchableOpacity>
        </View>

        {/* Redes sociales */}
        <View style={styles.socialMediaContainer}>
          <TouchableOpacity onPress={() => Linking.openURL('https://wa.me/595971994724')} style={styles.socialButton}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" style={styles.socialIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.instagram.com/vivemaspy/')} style={styles.socialButton}>
            <Ionicons name="logo-instagram" size={24} color="#C13584" style={styles.socialIcon} />
          </TouchableOpacity>
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialIcons name="logout" size={22} color="#FF6347" style={styles.menuIconSesion} />
           <Text style={styles.cerrarSesion}>Cerrar Sesión</Text>
         </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  headerContainer: {
    padding: 20,
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    height: 180,
  },
  userName: {
    fontSize: 22,
    color: 'white',
    fontFamily: 'Gotham-Regular',
  },
  userEmail: {
    fontSize: 14,
    color: 'white',
    fontFamily: 'Gotham-Regular',
    marginTop: 5,
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  menuItemsContainer: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomColor: '#E5E5E5',
    borderBottomWidth: 1,
  },
  drawerItem: {
    fontSize: 14,
    marginLeft: 10,
    fontFamily: 'Gotham-Regular',
    color: '#3A90E6',
  },
  menuIcon: {
    width: 24,
    height: 24,
  },
  chevronIcon: {
    marginLeft: 'auto',
    width: 24,
    height: 24,
  },
  subMenuContainer: {
    paddingLeft: 40,
  },
  subMenuItem: {
    paddingVertical: 8,
  },
  subMenuText: {
    fontSize: 12,
    color: 'black',
    fontFamily: 'Gotham-Regular',
  },
  socialMediaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  socialButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  socialIcon: {
    width: 25,
    height: 25,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  menuIconSesion: {
    width: 24,
    height: 24,
  },
  cerrarSesion: {
    fontSize: 16,
    color: '#FF6347',
    fontFamily: 'Gotham-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});


export default CustomDrawer;
