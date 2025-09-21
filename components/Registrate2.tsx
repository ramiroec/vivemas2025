import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    ScrollView,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';

// Define las rutas disponibles
type RootStackParamList = {
    Registrate1: undefined;
    Registrate2: {
        email: string;
        password: string;
        nombre: string;
        apellido: string;
        edad: string;
    };
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
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Registrate2'>;
type RouteProps = RouteProp<RootStackParamList, 'Registrate2'>;

const Registrate2: React.FC = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteProps>();

    const { email, password, nombre, apellido, edad } = route.params;

    const [documentType, setDocumentType] = useState<string>('Cédula de Identidad');
    const [documentNumber, setDocumentNumber] = useState<string>('');
    const [gender, setGender] = useState<string>('Femenino');
    const [country, setCountry] = useState<string>('Paraguay');

    const handleNext = () => {
        navigation.navigate('Registrate3', {
            email,
            password,
            nombre,
            apellido,
            edad,
            documentType,
            documentNumber,
            gender,
            country,
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <StatusBar hidden />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    <View style={styles.text}>
                        <TouchableOpacity onPress={() => navigation.navigate('Registrate1')}>
                            <MaterialIcons
                                name="arrow-back"
                                size={56}
                                color="#3a90e6"
                                style={styles.appbar}
                            />
                        </TouchableOpacity>
                        <Text style={styles.title}>Datos Personales</Text>
                        <Text style={styles.body}>Necesitamos tus datos para registrarte.</Text>
                    </View>

                    {/* Tipo de documento */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Tipo de documento</Text>
                        <Picker
                            selectedValue={documentType}
                            style={styles.picker}
                            onValueChange={(itemValue: any) => setDocumentType(itemValue)}
                        >
                            <Picker.Item label="Cédula de Identidad" value="Cédula de Identidad" />
                            <Picker.Item label="Pasaporte" value="Pasaporte" />
                            <Picker.Item label="Otro" value="Otro" />
                        </Picker>
                    </View>

                    {/* Número de documento */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Número de documento</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingresar Documento"
                            value={documentNumber}
                            onChangeText={setDocumentNumber}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Género */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Género</Text>
                        <Picker
                            selectedValue={gender}
                            style={styles.picker}
                            onValueChange={(itemValue: any) => setGender(itemValue)}
                        >
                            <Picker.Item label="Masculino" value="Masculino" />
                            <Picker.Item label="Femenino" value="Femenino" />
                            <Picker.Item label="No Binario" value="No Binario" />
                        </Picker>
                    </View>

                    {/* País */}
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>País</Text>
                        <Picker
                            selectedValue={country}
                            style={styles.picker}
                            onValueChange={(itemValue: any) => setCountry(itemValue)}
                        >
                            {[
                                'Argentina',
                                'Brasil',
                                'Chile',
                                'Colombia',
                                'Perú',
                                'Uruguay',
                                'Paraguay',
                                'Bolivia',
                                'Ecuador',
                            ].map((pais) => (
                                <Picker.Item key={pais} label={pais} value={pais} />
                            ))}
                        </Picker>
                    </View>

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
                            <Text style={styles.signUpButtonText}>Continuar al Paso 3</Text>
                        </Pressable>
                    </View>


                </View>
            </ScrollView>
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
});

export default Registrate2;
