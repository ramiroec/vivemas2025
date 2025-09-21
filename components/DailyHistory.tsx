import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Image, Alert } from 'react-native';
import { Circle } from 'react-native-progress';
import { Ionicons } from '@expo/vector-icons';
// react-native-view-shot is a native module. In Expo Go it may not be available
// so we require it dynamically and fall back to a plain View when it's missing.
let ViewShot: any = null;
try {
  // require at runtime so Metro doesn't try to load native module when running in Expo Go
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ViewShot = require('react-native-view-shot').default;
} catch (e) {
  ViewShot = null;
}
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// --------------------------
// Tipos
// --------------------------
type RootStackParamList = {
  DailyHistory: { dailyGoals: Record<string, { steps: number; calories: number }> };
};

type Props = NativeStackScreenProps<RootStackParamList, 'DailyHistory'>;

// --------------------------
// Componente
// --------------------------
const DailyHistory: React.FC<Props> = ({ route, navigation }) => {
  const { dailyGoals } = route.params || {};
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedDayData, setSelectedDayData] = useState<{ steps: number; calories: number } | null>(null);
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);

  const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const viewShotRef = useRef<any>(null);

  useEffect(() => {
    if (dailyGoals && Object.keys(dailyGoals).length > 0) {
      const firstDay = Object.keys(dailyGoals)[0];
      setSelectedDay(firstDay);
      setSelectedDayData(dailyGoals[firstDay]);
      setFormattedDate(formatDate(firstDay));
    }
  }, [dailyGoals]);

  useEffect(() => {
    if (selectedDay) {
      setFormattedDate(formatDate(selectedDay));
    }
  }, [selectedDay]);

  const handleDayPress = (day: string) => {
    setSelectedDay(day);
    setSelectedDayData(dailyGoals[day]);
  };

  const formatDate = (day: string): string => {
    const currentDayIndex = new Date().getDay();
    const selectedDayIndex = weekdays.findIndex((d) => d.startsWith(day));

    if (selectedDayIndex !== -1) {
      const difference = selectedDayIndex - currentDayIndex;
      const selectedDate = new Date();
      selectedDate.setDate(selectedDate.getDate() + difference);

      return selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    return '';
  };

  const handleShare = async () => {
    // If view-shot isn't available (e.g. running in Expo Go) inform the user
    if (!viewShotRef.current || typeof viewShotRef.current.capture !== 'function') {
      Alert.alert(
        'No disponible',
        'La función de captura no está disponible en esta versión (Expo Go). Para usarla instala el paquete react-native-view-shot y reconstruye la app (o usa un dev client).'
      );
      return;
    }

    try {
      setIsCapturing(true);
      const uri = await viewShotRef.current.capture();
      if (uri) {
        await Share.share({ url: uri, title: 'Compartir captura de pantalla' });
      }
    } catch (error) {
      console.error('Error compartiendo', error);
    } finally {
      setIsCapturing(false);
    }
  };

  // Use ViewShot when available, otherwise fallback to a plain View so the
  // app doesn't crash in environments where the native module isn't linked.
  const ViewShotComp = ViewShot ?? View;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ViewShotComp ref={viewShotRef} style={[styles.viewShot, { backgroundColor: '#ffffff' }]}>
        <View style={styles.header}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color="#4A4A4A"
            onPress={() => navigation.goBack()}
            style={{ opacity: isCapturing ? 0 : 1 }}
          />
          <Text style={styles.headerText}>{formattedDate || 'Historial Diario'}</Text>
          <Ionicons
            name="share-social-outline"
            size={24}
            color="#4A4A4A"
            onPress={handleShare}
            style={{ opacity: isCapturing ? 0 : 1 }}
          />
        </View>

        <View style={styles.content}>
          {dailyGoals ? (
            <>
              <View style={styles.weekdaysContainer}>
                {Object.keys(dailyGoals).map((day) => (
                  <TouchableOpacity key={day} onPress={() => handleDayPress(day)}>
                    <View style={[styles.dayCircle, selectedDay === day && styles.selectedDayCircle]}>
                      <Text style={[styles.dayText, selectedDay === day && styles.selectedDayText]}>{day}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedDayData && (
                <>
                  <View style={styles.progressContainer}>
                    <Circle
                      size={200}
                      progress={selectedDayData.calories / 857}
                      showsText
                      formatText={() => `${Math.round(selectedDayData.calories).toLocaleString()} / 857 kcal`}
                      textStyle={styles.progressText}
                      color="#00cc99"
                      thickness={15}
                      strokeCap="round"
                    />
                  </View>

                  <View style={styles.statsContainer}>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{selectedDayData.steps}</Text>
                      <Text style={styles.statLabel}>Pasos</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{(selectedDayData.steps * 0.000762).toFixed(2)} km</Text>
                      <Text style={styles.statLabel}>Distancia</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{Math.round(selectedDayData.calories).toLocaleString()}</Text>
                      <Text style={styles.statLabel}>Calorías</Text>
                    </View>
                    <View style={styles.statBox}>
                      <Text style={styles.statValue}>{Math.floor(selectedDayData.calories / 10)}</Text>
                      <Text style={styles.statLabel}>Puntos</Text>
                    </View>
                  </View>
                </>
              )}
            </>
          ) : (
            <Text style={styles.noDataText}>No hay datos disponibles para mostrar.</Text>
          )}
        </View>

        <View style={styles.logoContainer}>
          <Image source={require('../assets/isologovariante_2.png')} style={styles.logo} />
        </View>
  </ViewShotComp>
    </ScrollView>
  );
};

export default DailyHistory;

// --------------------------
// Estilos
// --------------------------
const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f7f8fa' },
  viewShot: { flex: 1 },
  content: { transform: [{ scale: 0.9 }] },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerText: { fontSize: 22, fontWeight: '600', color: '#4A4A4A' },
  weekdaysContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  dayCircle: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#e6f5f4',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  selectedDayCircle: {
    backgroundColor: '#00cc99',
    shadowColor: '#00cc99',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  dayText: { fontSize: 16, fontWeight: '500', color: '#00cc99' },
  selectedDayText: { color: '#ffffff' },
  progressContainer: { alignItems: 'center', marginBottom: 40 },
  progressText: { fontSize: 18, fontWeight: '600', color: '#4A4A4A' },
  statsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statBox: {
    width: '48%',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.5,
  },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#00cc99' },
  statLabel: { fontSize: 16, color: '#7b7b7b' },
  noDataText: { fontSize: 16, color: '#999', textAlign: 'center', marginTop: 20 },
  logoContainer: { alignItems: 'center', marginTop: 20, marginBottom: 10 },
  logo: { width: 100, height: 100, resizeMode: 'contain' },
});
