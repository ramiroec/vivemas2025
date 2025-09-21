// caloriesIOS.ts
import AppleHealthKit, { HealthKitPermissions } from 'react-native-health';
// Definimos un tipo local compatible con lo que devuelve HealthKit
type ActiveEnergyBurnedSampleLocal = {
  value?: number;
  startDate?: string;
};

export const getCaloriesIOS = async (): Promise<number> => {
  return new Promise((resolve, reject) => {
    const options: HealthKitPermissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.Steps,
          AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        ],
        write: []
      },
    };

    AppleHealthKit.initHealthKit(options, (err: string | null) => {
      if (err) {
        console.error('Error initializing HealthKit: ', err);
        reject(err);
        return;
      }

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

      // Obtener calorías activas de la semana
      AppleHealthKit.getActiveEnergyBurned(
        {
          startDate: startOfWeek.toISOString(),
          endDate: endOfWeek.toISOString(),
        },
        (error: string | null, results: ActiveEnergyBurnedSampleLocal[] | undefined) => {
          if (error) {
            console.error('Error fetching calories from Apple HealthKit: ', error);
            reject(error);
          } else {
            const totalCalories = (results || []).reduce(
              (total, record) => total + (record.value || 0),
              0
            );
            resolve(Math.round(totalCalories));
          }
        }
      );
    });
  });
};
