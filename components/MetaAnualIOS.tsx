import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
  HealthInputOptions,
} from "react-native-health";

// 📌 Tipo común para Android e iOS
export interface DatosMensuales {
  mes: number; // 1 - 12
  pasos: number;
  calorias: number;
}

export const obtenerPasosYCaloriasDelAnoIOS = async (): Promise<DatosMensuales[]> => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    // Definir permisos
    const permissions: HealthKitPermissions = {
      permissions: {
        read: [
          AppleHealthKit.Constants.Permissions.StepCount,
          AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
        ],
        write: [],
      },
    };

    // Inicializar HealthKit
    const healthKitInitialized = await new Promise<boolean>((resolve, reject) => {
      AppleHealthKit.initHealthKit(permissions, (err: string) => {
        if (err) {
          console.error("Error al inicializar Apple HealthKit: ", err);
          return reject(err);
        }
        resolve(true);
      });
    });

    if (!healthKitInitialized) {
      throw new Error("No se pudo inicializar Apple HealthKit");
    }

    // Objeto para acumular datos por mes
    const datosPorMes: Record<number, { pasos: number; calorias: number }> = {};

    for (let mes = 0; mes < 12; mes++) {
      datosPorMes[mes] = { pasos: 0, calorias: 0 };

      const startOfMonth = new Date(currentYear, mes, 1);
      const endOfMonth = new Date(currentYear, mes + 1, 0);

      const options: HealthInputOptions = {
        startDate: startOfMonth.toISOString(),
        endDate: endOfMonth.toISOString(),
      };

      // Obtener pasos
      const steps: number = await new Promise((resolve, reject) => {
        AppleHealthKit.getStepCount(options, (err: string, results: HealthValue) => {
          if (err) return reject(err);
          resolve(results?.value ?? 0);
        });
      });

      // Obtener calorías activas
      const calories: number = await new Promise((resolve, reject) => {
        AppleHealthKit.getActiveEnergyBurned(options, (err: string, results: HealthValue[]) => {
          if (err) return reject(err);
          if (results && Array.isArray(results) && results.length > 0) {
            const totalCalories = results.reduce((sum, record) => sum + (record.value ?? 0), 0);
            resolve(totalCalories);
          } else {
            resolve(0);
          }
        });
      });

      datosPorMes[mes].pasos = Math.round(steps);
      datosPorMes[mes].calorias = Math.round(calories);
    }

    // Convertir a array de salida
    const resultadoMensual: DatosMensuales[] = Object.keys(datosPorMes).map((mesStr) => {
      const mes = Number(mesStr);
      return {
        mes: mes + 1,
        pasos: datosPorMes[mes].pasos,
        calorias: datosPorMes[mes].calorias,
      };
    });

    return resultadoMensual;
  } catch (error) {
    console.error("Error al obtener los datos de pasos y calorías en iOS:", error);
    throw error;
  }
};
