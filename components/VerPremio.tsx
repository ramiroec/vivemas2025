import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { FontAwesome } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// --------------------------
// Tipos
// --------------------------
interface Premio {
  id: string;
  puntos: number;
  foto_enlace: string;
  logo_url?: string;
  premio: string;
  categoria_nombre: string;
  nombre_comercio: string;
  sucursal: string;
  direccion: string;
  premio_observacion?: string;
  contacto_celular?: string;
}

type RootStackParamList = {
  VerPremio: { premio: Premio };
  CanjePremio: { premio: Premio & { qr: string } };
};

type Props = NativeStackScreenProps<RootStackParamList, 'VerPremio'>;

// --------------------------
// Componente
// --------------------------
const VerPremio: React.FC<Props> = ({ route, navigation }) => {
  const { premio } = route.params;
  const [puntosUsuario, setPuntosUsuario] = useState<number>(0);
  const [canCanje, setCanCanje] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idUsuario = await AsyncStorage.getItem('idUsuario');
        if (idUsuario) {
          const response = await api.get(`/paciente/${idUsuario}`);
          const puntos: number = response.data.puntos;
          setPuntosUsuario(puntos);
          setCanCanje(puntos >= premio.puntos);
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    };

    fetchData();
  }, [premio]);

  const handleCanje = async () => {
    setLoading(true);
    try {
      const idUsuario = await AsyncStorage.getItem('idUsuario');
      if (idUsuario && canCanje) {
        const response = await api.post('/canje', { paciente: idUsuario, premio: premio.id });

        if (response.status === 201) {
          const nuevosPuntos = puntosUsuario - premio.puntos;
          setPuntosUsuario(nuevosPuntos);
          setCanCanje(nuevosPuntos >= premio.puntos);

          Alert.alert('¡Éxito!', 'El canje se ha realizado correctamente.');

          navigation.navigate('CanjePremio', { premio: { ...premio, qr: response.data.qr } });
        } else {
          throw new Error('Error al realizar el canje');
        }
      } else {
        Alert.alert('Error', 'No tienes suficientes puntos para realizar este canje.');
      }
    } catch (error) {
      console.error('Error al realizar el canje:', error);
      Alert.alert('Error', 'Ocurrió un problema al intentar realizar el canje.');
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    const contactoCelular = premio.contacto_celular;
    if (!contactoCelular) {
      Alert.alert('Error', 'No se encontró un número de contacto.');
      return;
    }

    let phoneNumber = contactoCelular.trim();
    if (phoneNumber.startsWith('0')) {
      phoneNumber = '595' + phoneNumber.substring(1);
    }
    phoneNumber = phoneNumber.replace(/\D/g, ''); 

    const url = `https://wa.me/${phoneNumber}`;

    Linking.openURL(url).catch((err) => {
      console.error('Error al abrir WhatsApp:', err);
      Alert.alert('Error', 'No se pudo abrir WhatsApp');
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Image source={{ uri: premio.foto_enlace }} style={styles.premioImage} />

      <View style={styles.detailsContainer}>
        {premio.logo_url && <Image source={{ uri: premio.logo_url }} style={styles.comercioLogo} />}
        <Text style={styles.premioTitle}>{premio.premio}</Text>
        <Text style={styles.premioCategory}>Categoría: {premio.categoria_nombre}</Text>
        <Text style={styles.premioPoints}>{premio.puntos} Puntos</Text>
        <Text style={styles.userPoints}>Tus puntos: {puntosUsuario}</Text>

        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Sucursal:</Text>
          <Text style={styles.infoText}>{premio.nombre_comercio + ' - ' + premio.sucursal}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Dirección:</Text>
          <Text style={styles.infoText}>{premio.direccion}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Observación:</Text>
          <Text style={styles.infoText}>{premio.premio_observacion}</Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.infoLabel}>Número de teléfono:</Text>
          <Text style={styles.infoText}>{premio.contacto_celular}</Text>
        </View>

        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <FontAwesome name="whatsapp" size={24} color="white" style={{ marginRight: 10 }} />
          <Text style={styles.whatsappButtonText}>Contactar por WhatsApp</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#2c9dd1" style={styles.loadingIndicator} />
        ) : (
          <TouchableOpacity
            style={[styles.redeemButton, canCanje ? styles.activeButton : styles.disabledButton]}
            onPress={handleCanje}
            disabled={!canCanje}
          >
            <Text style={styles.redeemButtonText}>Confirmar Canje</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

export default VerPremio;

const styles = StyleSheet.create({
  loadingIndicator: { marginTop: 20 },
  container: { padding: 20, backgroundColor: '#f8f8f8' },
  backButton: { marginBottom: 10 },
  backButtonText: { fontSize: 24 },
  premioImage: { width: '100%', height: 200, borderRadius: 10, marginBottom: 20 },
  detailsContainer: { backgroundColor: '#ffffff', borderRadius: 10, padding: 20 },
  comercioLogo: { width: 50, height: 50, borderRadius: 25, marginBottom: 10, alignSelf: 'center' },
  premioTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  premioCategory: { fontSize: 18, color: 'gray', marginBottom: 10 },
  premioPoints: { fontWeight: 'bold', fontSize: 18, marginBottom: 20 },
  userPoints: { fontSize: 16, color: 'gray', marginBottom: 20 },
  infoContainer: { marginBottom: 20 },
  infoLabel: { color: '#14D3A7', fontSize: 16, fontWeight: 'bold' },
  infoText: { fontSize: 16, color: 'gray', marginBottom: 10 },
  whatsappButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#25D366', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 25, marginTop: 20, alignSelf: 'center' },
  whatsappButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  redeemButton: { borderRadius: 20, padding: 15, alignItems: 'center', marginTop: 30 },
  activeButton: { backgroundColor: '#2c9dd1' },
  disabledButton: { backgroundColor: '#b0c4de' },
  redeemButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
