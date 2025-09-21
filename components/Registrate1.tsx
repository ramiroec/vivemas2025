import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

// Define las rutas disponibles
type RootStackParamList = {
  Welcome: undefined;
  Registrate2: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    edad: string;
  };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const Registrate1: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [nombre, setNombre] = useState<string>('');
  const [apellido, setApellido] = useState<string>('');
  const [edad, setEdad] = useState<string>('');
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleNext = () => {
    const parsedEdad = parseInt(edad, 10);
    if (isNaN(parsedEdad) || parsedEdad <= 17) {
      setErrorMessage('Debes ser mayor de 17 años para registrarte.');
      return;
    }

    setErrorMessage('');
    navigation.navigate('Registrate2', {
      email,
      password,
      nombre,
      apellido,
      edad,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.text}>
            <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
              <MaterialIcons
                name="arrow-back"
                size={56}
                color="#3a90e6"
                style={styles.appbar}
              />
            </TouchableOpacity>
            <Text style={styles.title}>Registrate</Text>
            <Text style={styles.body}>Necesitamos tus datos para registrarte.</Text>
          </View>

          {/* Campos de entrada */}
          {[
            { label: 'Correo electrónico', value: email, setter: setEmail, keyboardType: 'email-address' },
            { label: 'Nombre', value: nombre, setter: setNombre },
            { label: 'Apellido', value: apellido, setter: setApellido },
            { label: 'Edad (Mayor 18 años)', value: edad, setter: setEdad, keyboardType: 'numeric' },
          ].map(({ label, value, setter, keyboardType }) => (
            <View style={styles.inputContainer} key={label}>
              <Text style={styles.inputLabel}>{label}</Text>
              <TextInput
                style={styles.input}
                placeholder={`Ingresar ${label}`}
                placeholderTextColor="#bbbbbb"
                value={value}
                onChangeText={setter}
                keyboardType={keyboardType as any}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ))}

          {/* Contraseña */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.inputPassword}
                placeholder="Ingresar Password"
                placeholderTextColor="#bbbbbb"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIconContainer}
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Ionicons
                  name={isPasswordVisible ? 'eye' : 'eye-off'}
                  size={24}
                  color="#8b96ab"
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <Text style={styles.policyText}>
            Al registrarte a Vive +, aceptás nuestra{' '}
            <TouchableOpacity onPress={() => Linking.openURL('https://vivemas.com.py/privacidad/')}>
              <Text style={styles.policyLink}>Política de Privacidad & Términos y condiciones</Text>
            </TouchableOpacity>{' '}
            de uso.
          </Text>


                      <View style={styles.buttonContainer}>
                        <Pressable
                          onPress={handleNext}
                          style={({ pressed }) => [
                            styles.signUpButton,
                            pressed && styles.signUpButtonPressed,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel="Continuar al Paso 2"
                        >
                        <Text style={styles.signUpButtonText}>Continuar al Paso 2</Text>
                        </Pressable>
                      </View>

          <View style={styles.spacer} />
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  text: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  title: {
    color: '#171717',
    fontSize: 28,
    fontWeight: '700',
  },
  body: {
    color: '#8b96ab',
    fontSize: 16,
    marginTop: 4,
  },
  appbar: {
    height: 56,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#000000',
  },
  passwordContainer: {
    position: 'relative',
  },
  inputPassword: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#000000',
    paddingRight: 50,
  },
  eyeIconContainer: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  eyeIcon: {
    color: 'black',
    width: 24,
    height: 24,
  },
  policyText: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
  },
  policyLink: {
    color: '#2c9dd1',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
  spacer: {
    height: 100, // Espacio adicional para permitir el desplazamiento hacia el botón
  },
  errorText: {
    color: '#ff3333',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
    signUpButton: {
    backgroundColor: '#3a90e6',
    borderRadius: 12,            // más redondeado
    height: 52,                  // un poco más alto
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
    // sombra (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    // elevación (Android)
    elevation: 6,
  },
  signUpButtonPressed: {
    opacity: 0.85,
    transform: [{ translateY: 1 }],
  },
  signUpButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  /* Estilos existentes/añadidos para el contenedor del botón */
  buttonContainer: {
    marginTop: 16,
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 8,
  },
});

export default Registrate1;
