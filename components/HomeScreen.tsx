// HomeScreen.tsx
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Platform,
  Share,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { getCaloriesAndroid } from './caloriesAndroid';
import { getCaloriesIOS } from './caloriesIOS';
import { obtenerPasosYCaloriasPorFechaAndroid } from './obtenerPasosYCaloriasPorFechaAndroid';
import { obtenerPasosYCaloriasPorFechaIOS } from './obtenerPasosYCaloriasPorFechaIOS';
import * as Font from 'expo-font';
import { Buffer } from 'buffer';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface Publicidad {
  foto_enlace: string;
}

interface PasosYCalorias {
  fecha: string;
  pasos: number;
  calorias: number;
}

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [nombre, setNombre] = useState<string>('');
  const [points, setPoints] = useState<number>(0);
  const [publicidad, setPublicidad] = useState<Publicidad[]>([]);
  const [consejoDelDia, setConsejoDelDia] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [currentAdIndex, setCurrentAdIndex] = useState<number>(0);
  const [totalCalories, setTotalCalories] = useState<number>(0);
  const [todayCalories, setTodayCalories] = useState<number>(0);
  const [todaySteps, setTodaySteps] = useState<number>(0);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    async function loadFonts() {
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
    }
    loadFonts();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idUsuario = await AsyncStorage.getItem('idUsuario');
        if (idUsuario) {
          const patientResponse = await api.get(`/paciente/${idUsuario}`);
          const patientData = patientResponse.data;
          setNombre(patientData.nombre);
          setPoints(patientData.puntos);
        }

        const publicidadResponse = await api.get('/publicidad/activo');
        setPublicidad(publicidadResponse.data);

        const consejoResponse = await api.get('/consejo/consejo_del_dia');
        setConsejoDelDia(consejoResponse.data);

        const consejoImageResponse = await api.get('/consejo/consejo_del_dia_png', {
          responseType: 'arraybuffer',
        });
        const base64Image = Buffer.from(consejoImageResponse.data).toString('base64');
        setImageUrl(`data:image/png;base64,${base64Image}`);

        let totalCalories = 0;
        if (Platform.OS === 'android') {
          totalCalories = await getCaloriesAndroid();
        } else if (Platform.OS === 'ios') {
          totalCalories = await getCaloriesIOS();
        }
        setTotalCalories(totalCalories);

        const today = new Date();
        const lastFiveDays: Date[] = [];
        for (let i = 1; i <= 5; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          lastFiveDays.push(date);
        }

        const pasosYCaloriasDeLosUltimos5: PasosYCalorias[] = [];
        for (const fecha of lastFiveDays) {
          let pasosYCalorias: PasosYCalorias | undefined;
          if (Platform.OS === 'android') {
            pasosYCalorias = await obtenerPasosYCaloriasPorFechaAndroid(fecha);
          } else if (Platform.OS === 'ios') {
            pasosYCalorias = await obtenerPasosYCaloriasPorFechaIOS(fecha);
          }

          if (pasosYCalorias) pasosYCaloriasDeLosUltimos5.push(pasosYCalorias);
        }

        if (idUsuario && pasosYCaloriasDeLosUltimos5.length > 0) {
          for (const data of pasosYCaloriasDeLosUltimos5) {
            await api.post('/actividad_semana/actividad', {
              fecha: data.fecha,
              paciente_id: idUsuario,
              pasos: data.pasos,
              calorias: data.calorias,
            });
            console.log(`Datos guardados para la fecha: ${data.fecha}`);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const intervalId = setInterval(fetchData, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const updatePoints = async () => {
    try {
      const idUsuario = await AsyncStorage.getItem('idUsuario');
      if (idUsuario) {
        const response = await api.get(`/paciente/puntos/${idUsuario}`);
        setPoints(response.data.puntos);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const interval = setInterval(updatePoints, 10000);
    return () => clearInterval(interval);
  }, []);

  const shareConsejo = async () => {
    try {
      await Share.share({
        title: 'Consejo del día',
        message: consejoDelDia,
        url: imageUrl,
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % publicidad.length;
        scrollViewRef.current?.scrollTo({ x: nextIndex * width, animated: true });
        return nextIndex;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [publicidad.length]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    setCurrentAdIndex(Math.round(contentOffsetX / width));
  };

  useEffect(() => {
    const fetchStepsAndCalories = async () => {
      try {
        const today = new Date();
        let data: { pasos: number; calorias: number } = { pasos: 0, calorias: 0 };
        if (Platform.OS === 'android') {
          data = await obtenerPasosYCaloriasPorFechaAndroid(today);
        } else if (Platform.OS === 'ios') {
          data = await obtenerPasosYCaloriasPorFechaIOS(today);
        }
        setTodaySteps(data.pasos);
        setTodayCalories(data.calorias);
      } catch (error) {
        console.error(error);
      }
    };
    fetchStepsAndCalories();
    const intervalId = setInterval(fetchStepsAndCalories, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const greeting = currentHour < 12 ? '🌞 Buenos días' : currentHour < 18 ? '🌞 Buenas tardes' : '🌜 Buenas noches';

  const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const monthsOfYear = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const currentDate = `${daysOfWeek[currentTime.getDay()]}, ${currentTime.getDate()} de ${monthsOfYear[currentTime.getMonth()]}`;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
 <View style={styles.headerContainer}>
          <Image source={require('../assets/isologovariante_2.png')} style={styles.logo} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>{greeting}, {nombre || 'Usuario'}</Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
        </View>
        <View style={styles.goalContainer}>
          <View style={styles.header}>
            <Text style={styles.goalTitle}>Meta de la semana</Text>
            <View style={styles.iconContainer}>
              <Image
                source={require('../assets/objetivo_icono.png')}
                style={styles.icon}
              />
              <Text style={styles.iconText}>Realizado {Math.min(Math.round((totalCalories / 2800) * 100), 100)}%</Text>
            </View>
          </View>
          <View style={styles.progressContainer}>
            <Text style={styles.goalProgress}>
              <Text style={styles.progressTextGreen}>{totalCalories.toLocaleString()} / </Text>
              <Text style={styles.progressTextBlack}>2,800 kcal</Text>
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${Math.min(Math.round((totalCalories / 2800) * 100), 100)}%` }]} />
            </View>
          </View>
        </View>
        <View style={styles.adContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
          >
            {publicidad.map((ad, index) => (
              <Image key={index} source={{ uri: ad.foto_enlace }} style={styles.adImage} />
            ))}
          </ScrollView>
          <View style={styles.dotContainer}>
            {publicidad.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, index === currentAdIndex && styles.activeDot]}
              />
            ))}
          </View>
        </View>
        <View style={styles.pointsContainer}>
          <View style={styles.pointsInfoContainer}>
            <Text style={styles.pointsTitle}>Mis puntos</Text>
            <Image
              source={require('../assets/puntos_acumulados.png')}
              style={styles.pointsImage}
            />
          </View>
          <View style={styles.pointsDetailsContainer}>
            <Text style={styles.points}>{points.toLocaleString()}</Text>
            <Text style={styles.pointsSubtitle}>Puntos acumulados</Text>
          </View>
          <View style={styles.pointsButtonsContainer}>
            <TouchableOpacity style={styles.pointsButton} onPress={() => navigation.navigate('PremiosScreen')}>
              <Text style={styles.pointsButtonText}>Canjear mis puntos</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Estadísticas de hoy</Text>
          <View style={styles.statsInfo}>
            <View style={styles.statItem}>
              <FontAwesome5 name="walking" size={24} color="#14D3A7" />
              <Text style={styles.statText}>Pasos: {todaySteps.toFixed(0)}</Text>
            </View>
            <View style={styles.statItem}>
              <MaterialIcons name="local-fire-department" size={24} color="#FF6347" />
              <Text style={styles.statText}>Calorías: {todayCalories}</Text>
            </View>
          </View>
        </View>
        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>Consejo del día</Text>
          <TouchableOpacity style={styles.shareButton} onPress={shareConsejo}>
            <Image source={require('../assets/share.png')} style={styles.shareIcon} />
          </TouchableOpacity>
          {loading ? (
            <ActivityIndicator size="large" color="#14D3A7" />
          ) : (
            <View style={styles.tipContainerConsejo}>
              <Image
                source={require('../assets/consejo_icono.png')}
                style={styles.consejoImage}
              />
              <Text style={styles.tipText}>{consejoDelDia}</Text>
            </View>
          )}
        </View>
        <View style={styles.tipContainer}>
          <Text style={styles.tipTitle}>Novedades</Text>
          <View style={styles.tipContainerConsejo}>
            <Image
              source={require('../assets/novedades_icono.png')}
              style={styles.pointsImage}
            />
            <Text style={styles.tipText}>
              Ver otras novedades{" "}
              <Text
                style={{ color: '#3a90e6', textDecorationLine: 'underline' }}
                onPress={() => Linking.openURL('http://medcheck.com.py/blog/el-blog-de-medcheck-1')}
              >
                ver más
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#ffffff',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 125,
    height: 50,
  },
  headerTextContainer: {
    alignItems: 'flex-end',
  },
  greeting: {
    fontSize: 18,
    color: 'black',
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    fontWeight: 'bold',
  },
  date: {
    fontSize: 16,
    color: 'gray',
  },
  dateLarge: {
    fontSize: 18,
    marginBottom: 20,
  },
  goalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10, // Separar del contenido de progreso
  },
  goalTitle: {
    fontSize: 15,
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    flex: 1, // Ocupa el espacio disponible
    color: '#616878', // Gris oscuro para el título
  },
  iconContainer: {
    alignItems: 'center', // Alinea el ícono y el texto en el centro horizontalmente
  },
  icon: {
    width: 24, // Ajusta el tamaño del ícono
    height: 24,
  },
  progressContainer: {
    flex: 1,
  },
  goalProgress: {
    fontSize: 16,
    marginBottom: 5,
  },
  progressTextGreen: {
    color: '#14D3A7',
    fontWeight: 'bold'
  },
  progressTextBlack: {
    color: '#000000',
    fontWeight: 'bold'
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#14D3A7',
    borderRadius: 5,
  },
  adContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden', // Asegura que el contenido se mantenga dentro del contenedor
  },
  adImage: {
    width: width - 40,
    height: 150,
    borderRadius: 10,
    resizeMode: 'cover',
  },
  dotContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#cccccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#14D3A7',
  },
  pointsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    flex: 1,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pointsInfoContainer: {
    flexDirection: 'column',
    width: '18%',
  },
  pointsTitle: {
    fontSize: 15,
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    color: '#616878',
  },
  pointsImage: {
    width: 30,
    height: 30,
    marginTop: 5,
  },
  pointsDetailsContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  points: {
    fontSize: 25,
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    color: '#000000',
  },
  pointsSubtitle: {
    fontSize: 12,
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    color: '#8C96AB',
  },
  pointsButtonsContainer: {
    flexDirection: 'column',
    alignItems: 'baseline',
  },
  pointsButton: {
    backgroundColor: 'rgba(58, 144, 230, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 20,
    marginBottom: 10,
  },
  pointsButton2: {
    backgroundColor: 'rgba(20, 211, 167, 0.25)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  pointsButtonText: {
    color: '#3A90E6',
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    fontSize: 11,
  },
  pointsButtonText2: {
    color: '#14D3A7',
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    fontSize: 11,
  },
  tipContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    position: 'relative', // Needed for absolute positioning of the share button
  },
  tipTitle: {
    fontSize: 14,
    fontFamily: 'Gotham-Regular',
    marginBottom: 10,
    color: '#616878',
  },
  tipText: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    flexShrink: 1, // Permite que el texto se ajuste si es muy largo
  },
  consejoImage: {
    width: 30,
    height: 30,
    marginTop: 5,
  },
  tipContainerConsejo: {
    flexDirection: 'row',
    alignItems: 'center',
  flexWrap: 'wrap', // Permite que el contenido se ajuste a múltiples líneas si es necesario
  marginTop: 8,
  },
  iconText: {
    marginTop: 5,
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    color: '#616878',
    fontSize: 15,
  },
  shareButton: {
    position: 'absolute', // Position the button absolutely
    top: 10, // Adjust as necessary
    right: 20, // Adjust as necessary
  },
  shareIcon: {
    width: 24,
    height: 24,
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2, // Para Android
  },
  statsTitle: {
    fontSize: 18,
    fontFamily: 'Gotham-Bold', // Usa la versión negrita para el título
    color: '#616878',
    marginBottom: 10,
  },
  statsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 16,
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    color: '#000000',
    marginLeft: 8, // Espacio entre ícono y texto
  },
});

