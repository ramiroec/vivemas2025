import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Font from 'expo-font';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

const { width } = Dimensions.get('window');

// --------------------------
// Tipos
// --------------------------
interface Premio {
  id: number;
  premio: string;
  puntos: number;
  foto_enlace: string;
  categoria_nombre: string;
  comercio_id: number;
  sucursal: string;
  logo_url?: string;
  contacto_celular?: string;
  direccion?: string;
  [key: string]: any;
}

interface Categoria {
  id: number;
  nombre: string;
}

type RootStackParamList = {
  PremiosScreen: undefined;
  VerPremio: { premio: Premio };
  ListadoCanje: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'PremiosScreen'>;

// --------------------------
// Componente
// --------------------------
const PremiosScreen: React.FC<Props> = ({ navigation }) => {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [points, setPoints] = useState<number>(0);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [userType, setUserType] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

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

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      const idUsuario = await AsyncStorage.getItem('idUsuario');
      if (!idUsuario) return;

      // Datos del usuario
      const patientResponse = await api.get(`/paciente/${idUsuario}`);
      const patientData = patientResponse.data;
      setPoints(patientData.puntos);
      setUserType(patientData.descripcion_tipo_usuario);

      // Premios según tipo de usuario
      const premiosResponse = await api.get<Premio[]>(
        patientData.descripcion_tipo_usuario === 'Premium' ? '/premio/premium' : '/premio'
      );
      const premiosData = premiosResponse.data;

      // Sucursales
      const sucursalesResponse = await api.get('/sucursal');
      const sucursalesData = sucursalesResponse.data;
      const sucursalesMap: Record<string, any> = {};
      sucursalesData.forEach((sucursal: any) => {
        sucursalesMap[sucursal.sucursal] = sucursal;
      });

      // Agregar detalles adicionales a cada premio
      const premiosWithDetails: Premio[] = await Promise.all(
        premiosData.map(async (premio) => {
          try {
            const comercioResponse = await api.get(`/comercio/${premio.comercio_id}`);
            const comercioData = comercioResponse.data;
            const sucursal = sucursalesMap[premio.sucursal];
            return {
              ...premio,
              logo_url: comercioData?.logo_url ?? null,
              contacto_celular: sucursal?.contacto_celular ?? null,
              direccion: sucursal?.direccion ?? null,
            };
          } catch (error) {
            console.error(`Error al obtener detalles para el premio ${premio.id}:`, error);
            return premio;
          }
        })
      );

      // Categorías
      const categoriasUnicas = Array.from(new Set(premiosData.map(p => p.categoria_nombre)));
      const categorias: Categoria[] = categoriasUnicas.map((nombre, idx) => ({ id: idx + 1, nombre }));

      setCategorias(categorias);
      setPremios(premiosWithDetails);
    } catch (error) {
      console.error('Error al obtener datos:', error);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    fetchData();
  };

  const filtrarPremiosPorCategoria = (categoriaNombre: string | null) => {
    setCategoriaSeleccionada(categoriaNombre);
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
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2c9dd1']} />}
      >
        <View style={styles.userTypeContainer}>
          <Text style={[styles.userType, userType === 'Premium' ? styles.premium : styles.free]}>
            {userType === 'Premium' ? '🌟 Usuario Premium' : '🆓 Usuario Free'}
          </Text>
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.header}>Premios</Text>
          <Text style={styles.points}>🌞Puntos: {points}</Text>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity style={styles.tabButton} onPress={() => filtrarPremiosPorCategoria(null)}>
            <Text style={styles.tabTextActive}>Disponibles</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tabButton} onPress={() => navigation.navigate('ListadoCanje')}>
            <Text style={styles.tabText}>Mis Canjes</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, !categoriaSeleccionada && styles.filterButtonActive]}
            onPress={() => filtrarPremiosPorCategoria(null)}
          >
            <Text style={!categoriaSeleccionada ? styles.filterTextActive : styles.filterText}>Todos</Text>
          </TouchableOpacity>
          {categorias.map(categoria => (
            <TouchableOpacity
              key={categoria.id}
              style={[styles.filterButton, categoriaSeleccionada === categoria.nombre && styles.filterButtonActive]}
              onPress={() => filtrarPremiosPorCategoria(categoria.nombre)}
            >
              <Text style={categoriaSeleccionada === categoria.nombre ? styles.filterTextActive : styles.filterText}>
                {categoria.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.premiosContainer}>
          {premios
            .filter(item => !categoriaSeleccionada || item.categoria_nombre === categoriaSeleccionada)
            .map(item => (
              <TouchableOpacity
                key={item.id}
                style={[styles.premioCard, { width: width * 0.45 }]}
                onPress={() => navigation.navigate('VerPremio', { premio: item })}
              >
                <Image source={{ uri: item.foto_enlace }} style={styles.premioImage} />
                {item.logo_url && <Image source={{ uri: item.logo_url }} style={styles.premioLogo} />}
                <Text style={styles.premioTitle}>{item.premio}</Text>
                <Text style={styles.premioPoints}>{item.puntos} Puntos</Text>
              </TouchableOpacity>
            ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PremiosScreen;

// --------------------------
// Styles
// --------------------------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8f8f8' },
  loadingText: { marginTop: 10, fontSize: 18, color: '#2c9dd1' },
  userTypeContainer: { padding: 10 },
  userType: { fontSize: 16, fontFamily: 'Gotham-Regular' },
  premium: { color: '#ffd700' },
  free: { color: '#2c9dd1' },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold' },
  points: { fontSize: 16, color: '#2c9dd1' },
  tabsContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 10 },
  tabButton: { marginHorizontal: 10, paddingVertical: 5 },
  tabTextActive: { fontSize: 15, fontFamily: 'Gotham-Regular', color: '#2c9dd1' },
  tabText: { fontSize: 15, fontFamily: 'Gotham-Regular', color: 'gray' },
  filterContainer: { flexDirection: 'row', marginBottom: 10, paddingHorizontal: 10 },
  filterButtonActive: { backgroundColor: '#2c9dd1', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 5, marginRight: 10 },
  filterButton: { backgroundColor: '#e0e0e0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 5, marginRight: 10 },
  filterTextActive: { fontSize: 16, color: 'white' },
  filterText: { fontSize: 16, color: 'gray' },
  premiosContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 10 },
  premioCard: { backgroundColor: 'white', borderRadius: 10, padding: 10, marginBottom: 10, alignItems: 'center', position: 'relative' },
  premioImage: { width: '100%', height: 100, borderRadius: 10, marginBottom: 10 },
  premioLogo: { width: 30, height: 30, position: 'absolute', top: 10, left: 10, borderRadius: 15, backgroundColor: 'white', padding: 5 },
  premioTitle: { fontSize: 14, fontFamily: 'Gotham-Regular', marginBottom: 5, textAlign: 'center' },
  premioPoints: { fontSize: 12, color: 'gray', fontFamily: 'Gotham-Regular', textAlign: 'center' },
});
