// caloriesAndroid.ts
import { initialize, requestPermission, readRecords } from 'react-native-health-connect';

export const getCaloriesAndroid = async (): Promise<number> => {
  try {
    // Inicializar Health Connect
    await initialize();

    // Solicitar permisos de lectura
    await requestPermission([
      { accessType: 'read', recordType: 'TotalCaloriesBurned' },
      { accessType: 'read', recordType: 'Steps' },
    ]);

    const today = new Date();
    const dayOfWeek = today.getDay();

    // Calcular inicio de semana (lunes)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // Calcular fin de semana (domingo)
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - dayOfWeek) % 7);
    endOfWeek.setHours(23, 59, 59, 999);

    // Leer registros de calorías
    const { records } = await readRecords('TotalCaloriesBurned', {
      timeRangeFilter: {
        operator: 'between',
        startTime: startOfWeek.toISOString(),
        endTime: endOfWeek.toISOString(),
      },
    });

    // Asegurar tipado de los registros
    const totalCalories = (records as Array<{ energy: { inKilocalories: number } }>).reduce(
      (total, record) => total + (record.energy.inKilocalories || 0),
      0
    );

    // Redondear a entero y dividir entre 100 (como en tu código original)
    return Math.round(totalCalories / 100);
  } catch (error) {
    console.error('Error al obtener calorías en Android:', error);
    throw error;
  }
};
