import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable, // <-- agregado
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import Departamentos from './departamentos';
import Ciudades from './ciudades';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Define las rutas disponibles
type RootStackParamList = {
  Registrate3: {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    edad: string;
    documentType: string;
    documentNumber: string;
    gender: string;
    country: string;
  };
  MainHome: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Registrate3'>;
type RouteProps = RouteProp<RootStackParamList, 'Registrate3'>;

const Registrate3: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();

  const { email, password, nombre, apellido, edad, documentType, documentNumber, gender, country } = route.params;

  const [cellphone, setCellphone] = useState<string>('');
  const [city, setCity] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [neighborhood, setNeighborhood] = useState<string>('');

  const getCiudadesByDepartamento = (departamento: string): string[] => {
    return Ciudades[departamento] || [];
  };

  const handleSignUp = async () => {
    try {
      const response = await api.post('/paciente', {
        tipo_documento: documentType,
        numero_documento: documentNumber,
        nombre,
        apellido,
        email,
        contrasena: password,
        celular: cellphone,
        sexo: gender,
        edad,
        pais: country,
        departamento: department || null,
        ciudad: city || null,
        barrio: neighborhood || null,
        litros_agua_dia: null,
        kilogramos_peso: null,
        metros_altura: null,
        realiza_actividad_fisica: null,
        cantidad_veces_semana_act_fisica: null,
        horas_dia_actividad_fisica: null,
        horario_actividad_fisica: null,
        fuma: null,
        toma_alcohol: null,
        antecedentes_personales: [],
        antecedentes_familiares: [],
        direccion: null,
      });

      if (response.status === 201) {
        const idUsuario = response.data.id;
        await AsyncStorage.setItem('idUsuario', idUsuario.toString());
        navigation.navigate('MainHome');
      } else {
        Alert.alert('Error', 'Hubo un problema al registrarte. Inténtalo de nuevo.');
      }
    } catch (error: any) {
      let mensaje = 'Hubo un problema al registrarte. Inténtalo de nuevo.';
      if (error.response?.data?.error) {
        mensaje = error.response.data.error;
      }
      Alert.alert('Error', mensaje);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar hidden />
      <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.innerContainer}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons
                name="arrow-back"
                size={56}
                color="#3a90e6"
                style={styles.appbar}
              />            
            </TouchableOpacity>
            <Text style={styles.title}>Información de contacto</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Celular</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresar Celular"
                placeholderTextColor="#bbbbbb"
                value={cellphone}
                onChangeText={setCellphone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Departamento</Text>
              <Picker
                selectedValue={department}
                style={styles.input}
                onValueChange={(itemValue) => {
                  setDepartment(itemValue);
                  setCity('');
                }}
              >
                <Picker.Item label="Seleccionar Departamento" value="" />
                {Departamentos.map((dept, index) => (
                  <Picker.Item key={index} label={dept} value={dept} />
                ))}
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Ciudad</Text>
              <Picker
                selectedValue={city}
                style={styles.input}
                onValueChange={(itemValue) => setCity(itemValue)}
                enabled={department !== ''}
              >
                <Picker.Item label="Seleccionar Ciudad" value="" />
                {getCiudadesByDepartamento(department).map((ciudad, index) => (
                  <Picker.Item key={index} label={ciudad} value={ciudad} />
                ))}
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Barrio</Text>
              <TextInput
                style={styles.input}
                placeholder="Ingresar Barrio"
                placeholderTextColor="#bbbbbb"
                value={neighborhood}
                onChangeText={setNeighborhood}
              />
            </View>
            <View style={styles.buttonContainer}>
              <Pressable
                onPress={handleSignUp}
                style={({ pressed }) => [
                  styles.signUpButton,
                  pressed && styles.signUpButtonPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Finalizar Registro"
              >
                <Text style={styles.signUpButtonText}>Finalizar Registro</Text>
              </Pressable>
            </View>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    marginBottom: 20,
  },
  title: {
    color: '#171717',
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36.4,
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
  inputGroup: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
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
  picker: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: '#000000',
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
  /* Estilos añadidos para evitar errores TS por propiedades faltantes */
  innerContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
    alignItems: 'stretch',
  },
  inputContainer: {
    marginBottom: 16,
    width: '100%',
  },
  inputLabel: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
});

export default Registrate3;
