import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Platform,  
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Progress from 'react-native-progress';
import api from './api';
import * as Font from 'expo-font';
import { MetaAndroid } from './MetaAndroid';
import { MetaIOS } from './MetaIOS';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

type RootStackParamList = {
  MetaScreen: undefined;
  DailyHistory: { dailyGoals: Record<string, DailyData> };
  MetaAnual: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, 'MetaScreen'>;

interface DailyData {
  steps: number;
  calories: number;
}

interface DailyGoals {
  [date: string]: DailyData;
}

const MetaScreen: React.FC<Props> = ({ navigation }) => {
  const [nombre, setNombre] = useState<string>('');
  const [goalProgress, setGoalProgress] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [dailyData, setDailyData] = useState<DailyData>({ steps: 0, calories: 0 });
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>({});
  const [weeklyCalories, setWeeklyCalories] = useState<number>(0);
  const [monthlyCalories, setMonthlyCalories] = useState<number>(0);
  const [yearlyCalories, setYearlyCalories] = useState<number>(0);
  const [fontsLoaded, setFontsLoaded] = useState<boolean>(false);

  const currentTime = new Date();
  const currentHour = currentTime.getHours();
  const currentDate = `${["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"][currentTime.getDay()]}, ${currentTime.getDate()} de ${["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"][currentTime.getMonth()]}`;

  const greeting = currentHour < 12 ? '🌞 Buenos días' : currentHour < 18 ? '🌞 Buenas tardes' : '🌜 Buenas noches';

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

  // Fetch datos del usuario y metas
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (Platform.OS === 'android') {
          await MetaAndroid(setDailyGoals, setWeeklyCalories, setMonthlyCalories, setYearlyCalories);
        } else if (Platform.OS === 'ios') {
          MetaIOS(setDailyGoals, setWeeklyCalories, setMonthlyCalories, setYearlyCalories);
        }

        const idUsuario = await AsyncStorage.getItem('idUsuario');
        if (idUsuario) {
          const patientResponse = await api.get(`/paciente/${idUsuario}`);
          const patientData = patientResponse.data;
          setNombre(patientData.nombre);
          setGoalProgress(patientData.metaSemana);
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDayPress = (date: string) => {
    setSelectedDate(date);
    setSelectedDay(date);
    setDailyData(dailyGoals[date] ?? { steps: 0, calories: 0 });
  };

  const orderedDays = Object.keys(dailyGoals);

  if (!fontsLoaded) {
    return (
      <View style={styles.container}>
        <Text>Cargando fuentes...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 140 }} keyboardShouldPersistTaps="handled">
         <View style={styles.headerContainer}>
          <Image source={require('../assets/isologovariante_2.png')} style={styles.logo} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>{greeting}, {nombre || 'Usuario'}</Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
        </View>

        {loading ? (
          <Text>Cargando...</Text>
        ) : (
          <>
            {/* Meta Semanal */}
            <View style={styles.goalContainer}>
              <View style={styles.header}>
                <Text style={styles.goalTitle}>Meta de la semana</Text>
                <View style={styles.iconContainer}>
                  <Image source={require('../assets/objetivo_icono.png')} style={styles.icon} />
                  <Text style={styles.iconText}>Realizado {Math.min(Math.round((weeklyCalories / 2800) * 100), 100)}%</Text>
                </View>
              </View>
              <View style={styles.progressContainer}>
                <Text style={styles.goalProgress}>
                  <Text style={styles.progressTextGreen}>{weeklyCalories.toLocaleString()} / </Text>
                  <Text style={styles.progressTextBlack}>2,800 kcal</Text>
                </Text>
                <View style={styles.progressBarContainer}>
                  <View style={[styles.progressBar, { width: `${Math.min(Math.round((weeklyCalories / 2800) * 100), 100)}%` }]} />
                </View>
              </View>
            </View>

            {/* Detalle últimos 7 días */}
            <View style={styles.weeklyGoalContainer}>
              <Text style={styles.weeklyGoalTitle}>Detalle de los últimos 7 días</Text>
              <TouchableOpacity style={styles.historyButton} onPress={() => navigation.navigate('DailyHistory', { dailyGoals })}>
                <Text style={styles.historyButtonText}>Ver mi historial</Text>
              </TouchableOpacity>

              <View style={styles.weeklyGoalCirclesContainer}>
                {orderedDays.map((day, index) => {
                  const dayOfMonth = day.split('/')[0];
                  const percent = Math.min(((dailyGoals[day]?.steps ?? 0) / 5000) * 100, 100);
                  return (
                    <TouchableOpacity key={index} style={styles.weeklyGoalCircle} onPress={() => handleDayPress(day)}>
                      <Progress.Circle
                        size={36}
                        progress={percent / 100}
                        thickness={3}
                        color="#14D3A7"
                        unfilledColor="#E8EEF2"
                        borderWidth={0}
                      />
                      <View style={styles.weeklyGoalDayOverlay}>
                        <Text style={styles.weeklyGoalDay}>{dayOfMonth}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedDay && (
                <View style={styles.dailyDataContainer}>
                  <Text style={styles.dailyDataText}>Fecha: {selectedDate}</Text>
                  <View style={styles.dailyDataItem}>
                    <Text style={styles.dailyDataText}>Pasos: {dailyData.steps}</Text>
                  </View>
                  <View style={styles.dailyDataItem}>
                    <Text style={styles.dailyDataText}>Calorías: {Math.round(dailyData.calories).toLocaleString()}</Text>
                  </View>
                </View>
              )}
            </View>

            {/* Meta Mensual y Anual */}
            <View>
              <View style={styles.goalContainer}>
                <View style={styles.header}>
                  <Text style={styles.goalTitle}>Meta Mensual</Text>
                  <View style={styles.iconContainer}>
                    <Image source={require('../assets/objetivo_icono.png')} style={styles.icon} />
                    <Text style={styles.iconText}>Realizado {Math.round((monthlyCalories / 25710) * 100)}%</Text>
                  </View>
                </View>
                <View style={styles.progressContainer}>
                  <Text style={styles.goalProgress}>
                    <Text style={styles.progressTextGreen}>{monthlyCalories.toLocaleString()} / </Text>
                    <Text style={styles.progressTextBlack}>25,710 kcal</Text>
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${Math.min(Math.round((monthlyCalories / 25710) * 100), 100)}%` }]} />
                  </View>
                </View>
              </View>
            </View>

            <View>
              <View style={styles.goalContainer}>
                <View style={styles.header}>
                  <Text style={styles.goalTitle}>Meta Anual</Text>
                  <View style={styles.iconContainer}>
                    <Image source={require('../assets/objetivo_icono.png')} style={styles.icon} />
                    <Text style={styles.iconText}>Realizado {Math.min(Math.round((yearlyCalories / 312805) * 100), 100)}%</Text>
                  </View>
                </View>
                <View style={styles.progressContainer}>
                  <Text style={styles.goalProgress}>
                    <Text style={styles.progressTextGreen}>{yearlyCalories.toLocaleString()} / </Text>
                    <Text style={styles.progressTextBlack}>312,805 kcal</Text>
                  </Text>
                  <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${Math.round((yearlyCalories / 312805) * 100)}%` }]} />
                  </View>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MetaScreen;

// Mantener el mismo StyleSheet
const styles = StyleSheet.create({
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
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    color: '#171717',
  },
  date: {
    fontSize: 16,
    color: '#6b7280',
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
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    fontWeight: 'bold'
  },
  progressTextBlack: {
    color: '#000000',
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
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
  progressBar2: {
    height: '100%',
    backgroundColor: '#3A90E6',
    borderRadius: 5,
  },
  weeklyGoalContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  weeklyGoalTitle: {
    fontSize: 16,
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    color: '#616878',
  },
  historyButton: {
    backgroundColor: 'rgba(58, 144, 230, 0.25)', // Color con 25% de opacidad
    borderRadius: 20,
    padding: 5,
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  historyButtonText: {
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    color: '#3A90E6',
    fontSize: 14,
    fontWeight: 'bold',
  },
  weeklyGoalCirclesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  weeklyGoalCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#D3D3D3',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3, // Para Android
  },
  weeklyGoalDay: {
    fontSize: 16,
    color: '#000000', // Texto negro
    fontWeight: 'bold', // Texto en negrita
  },
  weeklyGoalDayOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyDataContainer: {
    marginTop: 10,
    backgroundColor: '#f8f8f8',
    padding: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dailyDataItem: {
    flex: 1,
    alignItems: 'center',
  },
  dailyDataText: {
    fontSize: 14,
    color: '#6b7280',
  },
  missingSteps: {
    fontSize: 14,
    color: '#8C96AB',
    fontWeight: 'bold'
  },
  accumulatedPoints: {
    fontSize: 14,
    color: '#8C96AB',
    marginBottom: 10,
    fontWeight: 'bold'
  },
  redeemPointsButton: {
    backgroundColor: '#2c9dd1',
    borderRadius: 5,
    padding: 10,
  },
  redeemPointsButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  iconText: {
    marginTop: 5,
    fontFamily: 'Gotham-Regular', // Aplica Gotham-Regular
    color: '#616878',
    fontSize: 15,
  },
  progressTextBlue: {
    color: '#3A90E6',
    fontWeight: 'bold'
  },
  steps: {
    fontSize: 14,
    color: '#8C96AB',
    fontWeight: 'bold'
  },
});
