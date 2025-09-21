import AppleHealthKit, { HealthKitPermissions, HealthValue, HealthObserver } from 'react-native-health';

export interface DailyData {
  steps: number;
  calories: number;
}

type SetDailyGoals = React.Dispatch<React.SetStateAction<Record<string, DailyData>>>;
type SetNumber = React.Dispatch<React.SetStateAction<number>>;

export const MetaIOS = async (
  setDailyGoals: SetDailyGoals,
  setWeeklyCalories: SetNumber,
  setMonthlyCalories: SetNumber,
  setYearlyCalories: SetNumber
) => {
  // Asumimos que los permisos ya han sido otorgados
  fetchHealthData(setDailyGoals, setWeeklyCalories, setMonthlyCalories, setYearlyCalories);
};

const fetchHealthData = (
  setDailyGoals: SetDailyGoals,
  setWeeklyCalories: SetNumber,
  setMonthlyCalories: SetNumber,
  setYearlyCalories: SetNumber
) => {
  const today = new Date();
  const endOfToday = new Date(today);
  endOfToday.setHours(23, 59, 59, 999);

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1));
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  const options = {
    startDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6).toISOString(),
    endDate: endOfToday.toISOString(),
  };

  // Obtener pasos
  AppleHealthKit.getSamples({ ...options, type: 'StepCount' as HealthObserver }, (stepsErr, stepsResults) => {
    if (stepsErr) {
      console.error('Error fetching steps:', stepsErr);
      return;
    }

    // Obtener calorías
    AppleHealthKit.getActiveEnergyBurned(
      { ...options, ascending: true, includeManuallyAdded: true },
      (caloriesErr, caloriesResults) => {
        if (caloriesErr) {
          console.error('Error fetching calories:', caloriesErr);
          return;
        }

        // Función para calcular calorías en un periodo
        const calculateCalories = (results: HealthValue[], startDate: Date, endDate: Date): number => {
          return results.reduce((total, record) => {
            const recordDate = new Date(record.startDate as string);
            if (recordDate >= startDate && recordDate <= endDate) {
              return total + (record.value || 0);
            }
            return total;
          }, 0);
        };

        const weeklyCalories = calculateCalories(caloriesResults, startOfWeek, endOfToday);
        const monthlyCalories = calculateCalories(caloriesResults, startOfMonth, endOfToday);
        const yearlyCalories = calculateCalories(caloriesResults, startOfYear, endOfToday);

        // Agrupar datos por día
        const groupedData = groupDataByDay(stepsResults, caloriesResults);
        setDailyGoals(groupedData);
        setWeeklyCalories(Math.round(weeklyCalories));
        setMonthlyCalories(Math.round(monthlyCalories));
        setYearlyCalories(Math.round(yearlyCalories));
      }
    );
  });
};

// Agrupar pasos y calorías por día
const groupDataByDay = (
  steps: HealthValue[],
  calories: HealthValue[]
): Record<string, DailyData> => {
  const groupedData: Record<string, DailyData> = {};
  const today = new Date();

  // Inicializar últimos 7 días
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
    groupedData[formattedDate] = { steps: 0, calories: 0 };
  }

  // Sumar pasos
  steps.forEach(step => {
    const date = new Date(step.startDate as string);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
    if (groupedData[formattedDate]) {
      // quantity puede no existir en los tipos; intentamos quantity o value como fallback
      const qty = (step as any).quantity ?? (step as any).value ?? 0;
      groupedData[formattedDate].steps += Number(qty) || 0;
    }
  });
  
  // Sumar calorías
  calories.forEach(calorie => {
    const date = new Date(calorie.startDate as string);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
    if (groupedData[formattedDate]) {
      groupedData[formattedDate].calories += Number((calorie as any).value ?? 0);
    }
  });
  
  return groupedData;
};
