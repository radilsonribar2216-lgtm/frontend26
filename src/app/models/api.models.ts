/**
 * Modelos (interfaces) que reflejan los DTOs que expone el backend.
 * Mantienen el contrato tipado entre frontend y API REST.
 */

/** Estados posibles de una cita. */
export type EstadoCita = 'PENDIENTE' | 'CONFIRMADA' | 'ATENDIDA' | 'CANCELADA' | 'PROGRAMADA';

/** Estados posibles de una historia clínica. */
export type EstadoHistoria = 'ABIERTA' | 'CERRADA';

/** Respuesta paginada genérica usada por todos los listados. */
export interface Pagina<T> {
  /** Elementos de la página actual. */
  content: T[];
  /** Número de página actual (base 0). */
  page: number;
  /** Tamaño de página. */
  size: number;
  /** Total de registros que cumplen el filtro. */
  totalElements: number;
  /** Total de páginas. */
  totalPages: number;
}

/** Cuerpo de error estándar devuelto por el backend. */
export interface ErrorApi {
  /** Código HTTP. */
  status: number;
  /** Mensaje comprensible para el usuario. */
  message: string;
  /** Errores por campo (cuando falla una validación). */
  errores?: Record<string, string> | null;
}

/** Cliente (propietario de mascotas). */
export interface Cliente {
  id: number;
  documento: string;
  nombres: string;
  apellidos: string;
  nombreCompleto: string;
  telefono?: string;
  email?: string;
  direccion?: string;
}

/** Mascota de un cliente. */
export interface Mascota {
  id: number;
  clienteId: number;
  clienteNombre: string;
  nombre: string;
  especie: string;
  raza?: string;
  sexo?: string;
  fechaNacimiento?: string;
}

/** Veterinario. */
export interface Veterinario {
  id: number;
  documento: string;
  nombreCompleto: string;
  especialidad?: string;
}

/** Cita médica (listado y detalle). */
export interface Cita {
  id: number;
  /** Fecha en formato yyyy-MM-dd. */
  fecha: string;
  /** Hora en formato HH:mm:ss. */
  hora: string;
  fechaHora: string;
  clienteId: number;
  clienteNombre: string;
  mascotaId: number;
  mascotaNombre: string;
  veterinarioId: number;
  veterinarioNombre: string;
  motivo: string;
  estado: EstadoCita;
}

/** Datos para crear una cita. */
export interface CitaCrear {
  clienteId: number;
  mascotaId: number;
  veterinarioId: number;
  fecha: string;
  hora: string;
  motivo: string;
  estado?: EstadoCita;
}

/** Datos editables de una cita. */
export interface CitaEditar {
  veterinarioId: number;
  fecha: string;
  hora: string;
  motivo: string;
}

/** Historia clínica en el listado (información resumida). */
export interface HistoriaResumen {
  id: number;
  fechaHora: string;
  mascotaNombre: string;
  clienteNombre: string;
  veterinarioNombre: string;
  motivoConsulta: string;
  estado: EstadoHistoria;
}

/** Detalle completo de una historia clínica. */
export interface HistoriaDetalle {
  id: number;
  citaId: number;
  clienteId: number;
  clienteNombre: string;
  mascotaId: number;
  mascotaNombre: string;
  veterinarioId: number;
  veterinarioNombre: string;
  fechaHora: string;
  motivoConsulta: string;
  diagnostico: string;
  observaciones?: string;
  estado: EstadoHistoria;
  createdAt: string;
}

/** Datos para crear una historia clínica. */
export interface HistoriaCrear {
  clienteId: number;
  mascotaId: number;
  citaId: number;
  veterinarioId: number;
  fechaHora: string;
  motivoConsulta: string;
  diagnostico: string;
  observaciones?: string;
}

/** Anotación de una historia clínica. */
export interface Anotacion {
  id: number;
  historiaClinicaId: number;
  fechaHora: string;
  veterinarioId: number;
  veterinarioNombre: string;
  descripcion: string;
  observacion?: string;
  diagnosticoEvolucion: string;
}

/** Datos para crear una anotación. */
export interface AnotacionCrear {
  veterinarioId: number;
  fechaHora?: string;
  descripcion: string;
  observacion?: string;
  diagnosticoEvolucion: string;
}

/** Fórmula médica en el listado (información resumida). */
export interface FormulaResumen {
  id: number;
  createdAt: string;
  fechaEmision: string;
  mascotaNombre: string;
  clienteNombre: string;
  veterinarioNombre: string;
  medicamento: string;
  dosis: string;
  duracionDias: number;
  activo: boolean;
}

/** Detalle completo de una fórmula médica. */
export interface FormulaDetalle {
  id: number;
  mascotaId: number;
  mascotaNombre: string;
  clienteId: number;
  clienteNombre: string;
  historiaClinicaId: number;
  fechaConsulta: string;
  motivoConsulta: string;
  veterinarioId: number;
  veterinarioNombre: string;
  fechaEmision: string;
  medicamento: string;
  dosisCantidad: number;
  dosisUnidad: string;
  frecuencia: string;
  duracionDias: number;
  indicaciones: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Datos para crear una fórmula. */
export interface FormulaCrear {
  mascotaId: number;
  historiaClinicaId: number;
  veterinarioId: number;
  fechaEmision: string;
  medicamento: string;
  dosisCantidad: number;
  dosisUnidad: string;
  frecuencia: string;
  duracionDias: number;
  indicaciones: string;
}

/** Datos editables de una fórmula. */
export interface FormulaEditar {
  fechaEmision: string;
  medicamento: string;
  dosisCantidad: number;
  dosisUnidad: string;
  frecuencia: string;
  duracionDias: number;
  indicaciones: string;
}
