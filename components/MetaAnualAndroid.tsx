import { initialize, readRecords, StepsRecord, TotalCaloriesBurnedRecord } from "react-native-health-connect";

// 📌 Tipo para los datos de cada mes
export interface DatosMensuales {
  mes: number;     // 1 - 12
  pasos: number;
  calorias: number;
}

// 📌 Función para obtener pasos y calorías de cada mes del año actual
export const obtenerPasosYCaloriasDelAnoAndroid = async (): Promise<DatosMensuales[]> => {
  try {
    // Inicializar Health Connect
    await initialize();

    // Año actual
    const currentYear = new Date().getFullYear();

    // Rango de tiempo: inicio y fin del año
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const timeRangeFilter = {
      operator: "between" as const,
      startTime: startOfYear.toISOString(),
      endTime: endOfYear.toISOString(),
    };

    // Leer registros de pasos
    const stepsResponse = await readRecords<"Steps">("Steps", { timeRangeFilter });
    const stepsRecords = stepsResponse.records ?? [];

    // Leer registros de calorías
    const caloriesResponse = await readRecords<"TotalCaloriesBurned">("TotalCaloriesBurned", { timeRangeFilter });
    const caloriesRecords = caloriesResponse.records ?? [];

    // Objeto para acumular datos por mes
    const datosPorMes: Record<number, { pasos: number; calorias: number }> = {};

    for (let mes = 0; mes < 12; mes++) {
      datosPorMes[mes] = { pasos: 0, calorias: 0 };
    }

    // Agrupar pasos por mes
    stepsRecords.forEach((record: any) => {
      const date = new Date(record.startTime);
      const month = date.getMonth();
      datosPorMes[month].pasos += record.count ?? 0;
    });

    // Agrupar calorías por mes
    caloriesRecords.forEach((record: any) => {
      const date = new Date(record.startTime);
      const month = date.getMonth();
      datosPorMes[month].calorias += record.energy.inKilocalories ?? 0;
    });

    // Si no hay calorías, calcular en base a pasos
    const caloriasPorPaso = 0.04; // ≈ 0.04 kcal por paso
    const resultadoMensual: DatosMensuales[] = Object.keys(datosPorMes).map((mesStr) => {
      const mes = Number(mesStr);
      let calorias = datosPorMes[mes].calorias;

      if (calorias === 0) {
        calorias = datosPorMes[mes].pasos * caloriasPorPaso;
      }

      return {
        mes: mes + 1, // devolver mes 1-12
        pasos: Math.round(datosPorMes[mes].pasos),
        calorias: Math.round(calorias),
      };
    });

    return resultadoMensual;
  } catch (error) {
    console.error("Error al obtener los datos de pasos y calorías:", error);
    throw error;
  }
};
