import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";
import * as Font from 'expo-font';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// --------------------------
// Tipos
// --------------------------
interface Canje {
  id: number;
  id_usuario: number;
  premio: string;
  comercio: string;
  fecha: string;
  estado: string;
  [key: string]: any; // Para campos opcionales
}

type RootStackParamList = {
  ListadoCanje: undefined;
  PremiosScreen: undefined;
  CanjePremio: { premio: Canje };
};

type Props = NativeStackScreenProps<RootStackParamList, 'ListadoCanje'>;

// --------------------------
// Componente
// --------------------------
const ListadoCanje: React.FC<Props> = ({ navigation }) => {
  const [canjes, setCanjes] = useState<Canje[]>([]);
  const [puntos, setPuntos] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  // Cargar fuentes
  useEffect(() => {
    const loadFonts = async () => {
      try {
        await Font.loadAsync({
          'Gotham-Regular': require('../assets/Fonts/gotham2/GothamRegular.otf'),
          'Gotham-Bold': require('../assets/Fonts/gotham2/GothamBold.ttf'),
          'Gotham-Book': require('../assets/Fonts/gotham2/GothamBook.ttf'),
          'Gotham-Thin': require('../assets/Fonts/gotham2/Gotham-Thin.otf'),
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Error loading fonts:', error);
      }
    };
    loadFonts();
  }, []);

  // Cargar canjes y puntos
  useEffect(() => {
    const fetchCanjes = async () => {
      try {
        const idUsuario = await AsyncStorage.getItem("idUsuario");
        if (idUsuario) {
          const response = await api.get<Canje[]>("/canje");
          const canjesUsuario = response.data.filter(
            (canje) => canje.id_usuario === parseInt(idUsuario)
          );
          setCanjes(canjesUsuario.reverse());

          const puntosResponse = await api.get(`/calcular_puntos/${idUsuario}`);
          setPuntos(Math.trunc(puntosResponse.data.puntos_actuales));
        }
      } catch (error) {
        console.error("Error al obtener los canjes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCanjes();
  }, []);

  const getStatusStyle = (status: string) => {
    if (status === "PENDIENTE") return styles.cardStatusPending;
    if (status === "CANCELADO") return styles.cardStatusCancelled;
    return styles.cardStatus;
  };

  if (isLoading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c9dd1" />
        <Text style={styles.loadingText}>Cargando...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingBottom: 140 }]}
        keyboardShouldPersistTaps="handled"
      >
         <View style={styles.header}>
           <Text style={styles.title}>Premios</Text>
           <View style={styles.pointsContainer}>
             <Text style={styles.pointsText}>🌞 Puntos: {puntos}</Text>
           </View>
         </View>

         <View style={styles.tabs}>
           <TouchableOpacity
             style={styles.tabButton}
             onPress={() => navigation.navigate('PremiosScreen')}
           >
             <Text style={styles.tabText}>Disponibles</Text>
           </TouchableOpacity>
           <TouchableOpacity onPress={() => navigation.navigate('ListadoCanje')}>
             <Text style={[styles.tabText, styles.activeTab]}>Mis Canjes</Text>
           </TouchableOpacity>
         </View>

         {canjes.map((canje) => (
           <View key={canje.id} style={styles.card}>
             <Text style={styles.cardTitle}>{canje.premio}</Text>
             <Text style={styles.cardSubtitle}>{canje.comercio}</Text>
             <Text style={styles.cardDate}>Fecha: {canje.fecha}</Text>
             <Text style={getStatusStyle(canje.estado)}>{canje.estado}</Text>
             <TouchableOpacity
               style={styles.button}
               onPress={() => navigation.navigate('CanjePremio', { premio: canje })}
             >
               <Text style={styles.buttonText}>Ver Código</Text>
             </TouchableOpacity>
           </View>
         ))}
       </ScrollView>
    </SafeAreaView>
  );
};

// --------------------------
// Styles
// --------------------------
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f8f8',
    flexGrow: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#2c9dd1',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Gotham-Regular',
    color: 'black',
  },
  pointsContainer: {
    borderRadius: 16,
    paddingVertical: 4,
  },
  pointsText: {
    color: 'black',
    fontSize: 15,
    fontFamily: 'Gotham-Regular',
  },
  tabs: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tabButton: {
    marginHorizontal: 20,
  },
  tabText: {
    fontSize: 15,
    fontFamily: 'Gotham-Regular',
    color: '#8c96ab',
  },
  activeTab: {
    fontSize: 15,
    fontFamily: 'Gotham-Regular',
    color: '#2c9dd1',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Gotham-Regular',
    fontWeight: '600',
    color: '#101e5a',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#101e5a',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 12,
    color: '#101e5a',
    fontFamily: 'Gotham-Regular',
    marginBottom: 8,
  },
  cardStatus: {
    fontSize: 14,
    color: '#14d3a7',
    fontFamily: 'Gotham-Regular',
    marginBottom: 16,
  },
  cardStatusPending: {
    fontSize: 14,
    color: '#ff5766',
    fontFamily: 'Gotham-Regular',
    marginBottom: 16,
  },
  cardStatusCancelled: {
    fontSize: 14,
    color: '#ff0000',
    fontFamily: 'Gotham-Regular',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#D3D3D3',
    borderRadius: 22,
    paddingVertical: 8,
    paddingHorizontal: 24,
    alignSelf: 'flex-end',
  },
  buttonText: {
    color: 'black',
    fontFamily: 'Gotham-Regular',
    fontSize: 14,
  },
});

export default ListadoCanje;
