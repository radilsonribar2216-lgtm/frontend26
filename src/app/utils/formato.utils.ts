import { EstadoCita } from '../models/api.models';

/** Etiquetas legibles de los estados de cita. */
const ETIQUETAS_CITA: Record<EstadoCita, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  ATENDIDA: 'Atendida',
  CANCELADA: 'Cancelada',
  PROGRAMADA: 'Programada',
};

/** Lista de estados de cita para los selects de filtro. */
export const ESTADOS_CITA: EstadoCita[] = ['PENDIENTE', 'CONFIRMADA', 'PROGRAMADA', 'ATENDIDA', 'CANCELADA'];

/**
 * Devuelve la etiqueta legible de un estado de cita.
 *
 * @param estado estado de la cita.
 * @returns texto para mostrar al usuario.
 */
export function etiquetaEstadoCita(estado: EstadoCita): string {
  return ETIQUETAS_CITA[estado] ?? estado;
}

/**
 * Recorta una hora "HH:mm:ss" a "HH:mm".
 *
 * @param hora hora completa.
 * @returns hora sin segundos.
 */
export function horaCorta(hora: string | null | undefined): string {
  return hora ? hora.substring(0, 5) : '';
}

/**
 * Convierte una fecha-hora del backend a el formato que espera un
 * input datetime-local ("yyyy-MM-ddTHH:mm").
 *
 * @param fechaHora fecha-hora ISO.
 * @returns texto compatible con datetime-local.
 */
export function aDatetimeLocal(fechaHora: string | null | undefined): string {
  return fechaHora ? fechaHora.substring(0, 16) : '';
}

/**
 * Devuelve el momento actual en formato datetime-local.
 *
 * @returns fecha y hora actuales ("yyyy-MM-ddTHH:mm").
 */
export function ahoraDatetimeLocal(): string {
  const d = new Date();
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}T${dos(d.getHours())}:${dos(d.getMinutes())}`;
}

/**
 * Devuelve la fecha de hoy en formato yyyy-MM-dd (útil como mínimo de un input date).
 *
 * @returns fecha actual.
 */
export function hoyISO(): string {
  return ahoraDatetimeLocal().substring(0, 10);
}
