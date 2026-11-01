export interface Jornada {
  id: string; fecha: string; entrada?: string; salida?: string; descansoMin: number;
  horasNormales: number; horasExtra: number; tarifaAplicada: number; multiplicadorAplicado: number; monto: number; nota?: string;
}
export interface VistaPrevia { horasNormales: number; horasExtra: number; monto: number; totalHoras: number; tarifa: number; multiplicador: number; }
export interface Resumen { horasNormales: number; horasExtra: number; totalGanado: number; promedioPorDia: number; variacionPct?: number; }
export interface Prediccion { minimo: number; esperado: number; maximo: number; ganadoActual: number; diasLaborablesRestantes: number; explicacion: string; }
