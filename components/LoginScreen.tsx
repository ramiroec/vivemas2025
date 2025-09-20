import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import api from './api';
import { SafeAreaView } from 'react-native-safe-area-context';

// Define tus rutas disponibles
type RootStackParamList = {
  MainHome: { nombre: string };
  RecuperarContrasena: undefined;
  Welcome: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          navigation.navigate('MainHome', { nombre: '' });
        }
      } catch (error) {
        console.error('Error checking auth token:', error);
      }
    };
    checkAuth();
  }, [navigation]);

  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Gotham-Regular': require('../assets/Fonts/gotham2/GothamRegular.otf'),
          'Gotham-Bold': require('../assets/Fonts/gotham2/GothamBold.ttf'),
          'Gotham-Book': require('../assets/Fonts/gotham2/GothamBook.ttf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    };
    loadFonts();
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await api.post('/login', { email, password });
      const { codigo, idUsuario, token } = response.data;

      if (codigo === '200') {
        const patientResponse = await api.get(`/paciente/${idUsuario}`);
        const patientData = patientResponse.data;

        await AsyncStorage.setItem('idUsuario', idUsuario.toString());
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('descripcion_tipo_usuario', patientData.descripcion_tipo_usuario);

        navigation.navigate('MainHome', { nombre: patientData.nombre });
      } else {
        setErrorMessage('Usuario y/o Contraseña Inválido/s!');
        setModalVisible(true);
      }
    } catch (error) {
      console.error('Error de inicio de sesión:', error);
      setErrorMessage('Hubo un problema al intentar iniciar sesión. Inténtalo de nuevo.');
      setModalVisible(true);
    } finally {
      setLoading(false);
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.container}>
            <View style={styles.text}>
              <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
                <MaterialIcons
                  name="arrow-back"
                  size={56}
                  color="#3a90e6"
                  style={styles.appbar}
                />
              </TouchableOpacity>
              <Text style={styles.title}>Iniciar Sesión</Text>
              <Text style={styles.body}>Necesitamos tus datos para ingresar.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresar Correo"
                placeholderTextColor="#bbbbbb"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                importantForAutofill="no"
                blurOnSubmit={false}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.inputPassword}
                  placeholder="Ingresar Contraseña"
                  placeholderTextColor="#bbbbbb"
                  secureTextEntry={!passwordVisible}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIconContainer}
                  onPress={() => setPasswordVisible(!passwordVisible)}
                >
                  <Ionicons
                    name={passwordVisible ? 'eye' : 'eye-off'}
                    size={24}
                    color="#8b96ab"
                    style={styles.eyeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('RecuperarContrasena')}>
              <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {loading ? (
              <ActivityIndicator size="large" color="#3a90e6" style={styles.activityIndicator} />
            ) : (
              <TouchableOpacity style={styles.btnSignUp} onPress={handleLogin}>
                <Text style={styles.btnText}>Ingresar</Text>
              </TouchableOpacity>
            )}

            <Modal
              animationType="slide"
              transparent={true}
              visible={modalVisible}
              onRequestClose={() => setModalVisible(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalText}>{errorMessage}</Text>
                  <Pressable style={styles.modalButton} onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalButtonText}>Cerrar</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 24,
    width: '100%',
  },
  text: {
    marginTop: -220,
    marginBottom: 30,
  },
  title: {
    color: '#171717',
    fontSize: 28,
    lineHeight: 36.4,
    fontFamily: 'Gotham-Regular',
  },
  body: {
    color: '#8C97AB',
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Gotham-Book',
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#6b7280',
    fontSize: 16,
    marginBottom: 8,
    fontFamily: 'Gotham-Regular',
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#BBBBBB',
    fontFamily: 'Gotham-Regular',
  },
  passwordContainer: {
    position: 'relative',
  },
  inputPassword: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#BBBBBB',
    paddingRight: 50,
    fontFamily: 'Gotham-Regular',
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  eyeIcon: {
    width: 24,
    height: 24,
  },
  btnSignUp: {
    backgroundColor: '#3a90e6',
    borderRadius: 20,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  btnText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Gotham-Regular',
  },
  linkText: {
    color: '#3a90e6',
    fontSize: 14,
    marginTop: 16,
    textDecorationLine: 'underline',
    fontFamily: 'Gotham-Regular',
  },
  appbar: {
    height: 56,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  activityIndicator: {
    marginTop: 24,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Gotham-Regular',
  },
  modalButton: {
    backgroundColor: '#3a90e6',
    borderRadius: 20,
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  modalButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontFamily: 'Gotham-Regular',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
