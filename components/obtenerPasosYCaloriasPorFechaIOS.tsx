// obtenerPasosYCaloriasPorFechaIOS.ts
import AppleHealthKit, { HealthKitPermissions, HealthValue } from 'react-native-health';

type ResultPasosYCalorias = {
  fecha: string;   // 'YYYY-MM-DD'
  pasos: number;
  calorias: number;
};

/**
 * Obtener pasos y calorías para una fecha (iOS - HealthKit).
 * @param fecha Date (ej: new Date())
 * @returns Promise<ResultPasosYCalorias>
 */
export const obtenerPasosYCaloriasPorFechaIOS = async (
  fecha: Date
): Promise<ResultPasosYCalorias> => {
  try {
    // Normalizar inicio y fin del día
    const startOfDay = new Date(fecha);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(fecha);
    endOfDay.setHours(23, 59, 59, 999);

    // Permisos (tipado proporcionado por la lib)
    const permissions: HealthKitPermissions = {
      permissions: {
          read: [
              AppleHealthKit.Constants.Permissions.StepCount,
              AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
          ],
          write: []
      },
    };

    // Inicializar HealthKit y solicitar permisos (si ya están, init devuelve ok)
    await new Promise<void>((resolve, reject) => {
      AppleHealthKit.initHealthKit(permissions, (err: string | null) => {
        if (err) {
          console.error('Error al inicializar Apple HealthKit: ', err);
          return reject(err);
        }
        resolve();
      });
    });

    // --- Obtener pasos ---
    // tipo local para el resultado de getStepCount (la librería no exporta StepCountValue)
    interface StepCountResult {
      value?: number;
    }

    const pasos: number = await new Promise<number>((resolve, reject) => {
      AppleHealthKit.getStepCount(
        {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
        },
        (err: string | null, result?: StepCountResult) => {
          if (err) {
            return reject(err);
          }
          // result?.value puede ser undefined -> usar 0 por defecto
          resolve(Math.round(result?.value ?? 0));
        }
      );
    });

    // --- Obtener calorías (Active Energy Burned) ---
    // getActiveEnergyBurned devuelve ARRAY de muestras (usar HealthValue)
    const calorias: number = await new Promise<number>((resolve, reject) => {
      AppleHealthKit.getActiveEnergyBurned(
        {
          startDate: startOfDay.toISOString(),
          endDate: endOfDay.toISOString(),
          ascending: true,
          includeManuallyAdded: true,
        },
        (err: string | null, results?: HealthValue[]) => {
          if (err) {
            return reject(err);
          }

          if (!results || results.length === 0) {
            return resolve(0);
          }

          // Sumar valores (result.value suele ser number)
          const total = results.reduce((sum, r) => {
            const v = typeof r.value === 'number' ? r.value : Number(r.value ?? 0);
            return sum + (isNaN(v) ? 0 : v);
          }, 0);

          resolve(Math.round(total));
        }
      );
    });

    // Formatear fecha como YYYY-MM-DD
    const fechaFormateada = startOfDay.toISOString().split('T')[0];

    return {
      fecha: fechaFormateada,
      pasos,
      calorias,
    };
  } catch (error) {
    console.error('Error al obtener los datos de pasos y calorías en iOS:', error);
    throw error;
  }
};
