import { initialize, readRecords } from 'react-native-health-connect';

type FechaStats = {
  fecha: string;
  pasos: number;
  calorias: number;
};

export const obtenerPasosYCaloriasPorFechaAndroid = async (
  fecha: Date
): Promise<FechaStats> => {
  try {
    await initialize();

    const startOfDay = new Date(fecha);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(fecha);
    endOfDay.setHours(23, 59, 59, 999);

    const timeRangeFilter = {
      operator: "between" as const,
      startTime: startOfDay.toISOString(),
      endTime: endOfDay.toISOString(),
    };

    const stepsResponse = await readRecords('Steps', { timeRangeFilter });
    const stepsRecords = stepsResponse.records ?? [];
    const totalSteps = stepsRecords.reduce(
      (total: number, record: { count?: number }) => total + (record.count ?? 0),
      0
    );

    const caloriesResponse = await readRecords('TotalCaloriesBurned', { timeRangeFilter });
    const caloriesRecords = caloriesResponse.records ?? [];
    const totalCalories = caloriesRecords.reduce(
      (total: number, record: { energy?: { inKilocalories?: number } }) =>
        total + (record.energy?.inKilocalories ?? 0),
      0
    );

    let calorias = totalCalories;
    if (calorias > totalSteps) {
      calorias = calorias / 100;
    }
    if (calorias === 0) {
      const caloriasPorPaso = 0.04;
      calorias = totalSteps * caloriasPorPaso;
    }

    return {
      fecha: fecha.toISOString().split('T')[0],
      pasos: Math.round(totalSteps),
      calorias: Math.round(calorias),
    };
  } catch (error) {
    console.error('Error al obtener los datos de pasos y calorías:', error);
    throw error;
  }
};
