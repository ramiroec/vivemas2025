import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ScrollView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BarChart } from "react-native-chart-kit";
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context"; // mejor usar este en lugar de react-native
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import api from "./api";
import { obtenerPasosYCaloriasDelAnoAndroid } from "./MetaAnualAndroid";
import { obtenerPasosYCaloriasDelAnoIOS } from "./MetaAnualIOS";

// 📌 Tipos para los datos mensuales
type MonthlyData = {
  pasos: number;
  calorias: number;
};

type RootStackParamList = {
  MetaAnual: undefined;
};

type MetaAnualProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "MetaAnual">;
};

export default function MetaAnual({ navigation }: MetaAnualProps) {
  const [greeting, setGreeting] = useState<string>("");
  const [name, setName] = useState<string>("Usuario");
  const [date, setDate] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState<number>(
    new Date().getMonth()
  );

  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);

  const monthsOfYear = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  const fetchYearlyData = async () => {
    try {
      const isAndroid = Platform.OS === "android";
      const fetchData = isAndroid
        ? obtenerPasosYCaloriasDelAnoAndroid
        : obtenerPasosYCaloriasDelAnoIOS;

      const data = await fetchData();
      setMonthlyData(data);
    } catch (error) {
      console.error("Error al obtener los datos anuales:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const idUsuario = await AsyncStorage.getItem("idUsuario");
        if (idUsuario) {
          const patientResponse = await api.get(`/paciente/${idUsuario}`);
          const patientData = patientResponse.data;
          setName(patientData.nombre);
        }
      } catch (error) {
        console.error("Error al obtener el nombre del paciente:", error);
      }
    };

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const daysOfWeek = [
      "Domingo",
      "Lunes",
      "Martes",
      "Miércoles",
      "Jueves",
      "Viernes",
      "Sábado",
    ];

    setGreeting(
      currentHour < 12
        ? "🌞 Buenos días"
        : currentHour < 18
        ? "🌞 Buenas tardes"
        : "🌜 Buenas noches"
    );
    setDate(
      `${daysOfWeek[currentTime.getDay()]}, ${currentTime.getDate()} de ${
        monthsOfYear[currentTime.getMonth()]
      }`
    );

    fetchData();
    fetchYearlyData();
  }, []);

  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 0 ? 11 : prevMonth - 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => (prevMonth === 11 ? 0 : prevMonth + 1));
  };

  const calculateTotalCalories = () => {
    return monthlyData.reduce(
      (total, month) => total + (month?.calorias || 0),
      0
    );
  };

  const barData = {
    labels: [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ],
    datasets: [
      {
        data:
          monthlyData.length > 0
            ? monthlyData.map((item) => item.calorias)
            : [15000, 25000, 33000, 45000, 50000, 42000, 31000, 46000, 39000, 48000, 52000, 56000],
      },
    ],
  };

  const totalCalories = calculateTotalCalories();

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>
          <Ionicons
            name="chevron-back-outline"
            size={24}
            color="#4A4A4A"
            onPress={() => navigation.goBack()}
          />
          <Image
            source={require("../assets/isologovariante_2.png")}
            style={styles.logo}
          />
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting}>
              {greeting}, {name || "Usuario"}
            </Text>
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>

        <View style={styles.container}>
          <Text style={styles.comingSoonText}>
            🚀¡Datos obtenidos directamente desde el dispositivo!🚀
          </Text>
        </View>

        <View style={styles.goalContainer}>
          <View style={styles.goalHeader}>
            <Text style={styles.goalTitle}>Meta Anual</Text>
            <Image
              source={require("../assets/objetivo_icono.png")}
              style={styles.icon}
            />
          </View>
          <Text style={styles.goalProgress}>
            {totalCalories} / 312,805 kcal
          </Text>
          <View style={styles.progressBarContainer}>
            <View
              style={[
                styles.progressBar,
                { width: `${(totalCalories / 312805) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Progreso {Math.round((totalCalories / 312805) * 100)}%
          </Text>
        </View>

        <ScrollView horizontal>
          <View style={styles.chartContainer}>
            <BarChart
              data={barData}
              width={Dimensions.get("window").width - 40}
              height={220}
              fromZero
              showValuesOnTopOfBars={false}
              yAxisLabel=""
              yAxisSuffix="kcal"
              chartConfig={{
                backgroundColor: "#ffffff",
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(44, 157, 209, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                style: { borderRadius: 10 },
                barPercentage: 0.5,
              }}
              style={{
                marginVertical: 10,
                borderRadius: 10,
                overflow: "hidden",
              }}
            />
          </View>
        </ScrollView>

        <View style={styles.monthlyDetailContainer}>
          <Text style={styles.monthlyDetailTitle}>Detalle Mensual</Text>
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={goToPreviousMonth}>
                            <MaterialIcons
                                name="arrow-back"
                                size={56}
                                color="#3a90e6"
                                style={styles.appbar}
                            />
            </TouchableOpacity>
            <Text style={styles.monthText}>{monthsOfYear[currentMonth]}</Text>
            <TouchableOpacity onPress={goToNextMonth}>
                            <MaterialIcons
                                name="arrow-back"
                                size={56}
                                color="#3a90e6"
                                style={styles.appbar}
                            />
            </TouchableOpacity>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailText}>Pasos realizados (pasos):</Text>
            <Text style={styles.detailValue}>
              {monthlyData[currentMonth]?.pasos ?? "Próximamente"}
            </Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailText}>Calorías quemadas (kcal):</Text>
            <Text style={styles.detailValue}>
              {monthlyData[currentMonth]?.calorias ?? "Próximamente"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ✅ estilos no requieren cambios
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8f8f8" },
  comingSoonText: { fontSize: 13, padding: 7 },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logo: { width: 125, height: 50 },
  headerTextContainer: { flexDirection: "column", alignItems: "flex-end", flex: 1 },
  greeting: { fontSize: 18, color: "black", fontWeight: "bold" },
  date: { fontSize: 16, color: "#6b7280" },
  goalContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  goalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  goalTitle: { fontSize: 18, fontWeight: "bold" },
  icon: { width: 24, height: 24, resizeMode: "contain" },
  goalProgress: { fontSize: 16, marginBottom: 10 },
  progressBarContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
    marginBottom: 10,
    overflow: "hidden",
  },
  progressBar: { height: "100%", backgroundColor: "#2c9dd1", borderRadius: 5 },
  progressText: { fontSize: 16, color: "#6b7280" },
  chartContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  monthlyDetailContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  monthlyDetailTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  monthNavigation: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  navIcon: { width: 24, height: 24, resizeMode: "contain" },
  monthText: { fontSize: 16, fontWeight: "bold" },
  detailItem: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  detailText: { fontSize: 14, color: "#6b7280" },
  detailValue: { fontSize: 14, fontWeight: "bold", color: "#14D3A7" },
      appbar: {
        height: 56,
        resizeMode: 'contain',
        marginBottom: 20,
    },
});
