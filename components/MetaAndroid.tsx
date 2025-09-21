import { initialize, readRecords } from 'react-native-health-connect';

export interface DailyData {
  steps: number;
  calories: number;
}

type SetDailyGoals = React.Dispatch<React.SetStateAction<Record<string, DailyData>>>;
type SetNumber = React.Dispatch<React.SetStateAction<number>>;

export const MetaAndroid = async (
  setDailyGoals: SetDailyGoals,
  setWeeklyCalories: SetNumber,
  setMonthlyCalories: SetNumber,
  setYearlyCalories: SetNumber
) => {
  try {
    console.log('Inicializando Health Connect...');
    await initialize();

    const today = new Date();
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const newDailyGoals: Record<string, DailyData> = {};
    let weeklyCalories = 0;
    let monthlyCalories = 0;
    let yearlyCalories = 0;

    // Función para calcular calorías en un rango de fechas
    const calculateCalories = async (startDate: Date, endDate: Date): Promise<number> => {
      const timeRangeFilter = {
        operator: 'between' as const,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      };

      const caloriesResponse = await readRecords('TotalCaloriesBurned', { timeRangeFilter });
      const caloriesRecords = caloriesResponse.records || [];
      return caloriesRecords.reduce((total, record) => total + (record.energy?.inKilocalories || 0), 0);
    };

    // Calorías de la semana actual
    weeklyCalories = await calculateCalories(startOfWeek, endOfToday);
    // Calorías del mes actual
    monthlyCalories = await calculateCalories(startOfMonth, endOfToday);
    // Calorías del año actual
    yearlyCalories = await calculateCalories(startOfYear, endOfToday);

    // Calcular pasos y calorías para los últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const day = new Date(today);
      day.setDate(today.getDate() - i);

      const startOfDay = new Date(day);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(day);
      endOfDay.setHours(23, 59, 59, 999);

      const stepsResponse = await readRecords('Steps', {
        timeRangeFilter: { operator: 'between' as const, startTime: startOfDay.toISOString(), endTime: endOfDay.toISOString() },
      });

      const stepsRecords = stepsResponse.records || [];
      const totalSteps = stepsRecords.reduce((total, record) => total + (record.count || 0), 0);

      const dayCalories = await calculateCalories(startOfDay, endOfDay);

      const formattedDate = `${day.getDate()}/${day.getMonth() + 1}`;
      newDailyGoals[formattedDate] = {
        steps: totalSteps,
        calories: dayCalories,
      };
    }

    setDailyGoals(newDailyGoals);
    setWeeklyCalories(Math.round(weeklyCalories / 100));
    setMonthlyCalories(Math.round(monthlyCalories / 100));
    setYearlyCalories(Math.round(yearlyCalories / 100));
  } catch (error) {
    console.error('Error en MetaAndroid:', error);
  }
};
