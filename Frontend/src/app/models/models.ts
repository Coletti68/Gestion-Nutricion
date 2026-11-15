export type EstadoTurno = 'Pendiente' | 'Confirmado' | 'Realizado' | 'Cancelado';

export interface Consulta {
  id?: number;
  pacienteId?: number;
  fecha: string; // ISO date
  motivo: string;
  peso: number; // kg
  observaciones: string;
  activo?: boolean;
}

// Objetivo del catálogo editable que alimenta el select del paciente.
export interface Objetivo {
  id: number;
  nombre: string;
  orden: number;
  activo?: boolean;
}

export interface Paciente {
  id: number;
  nombre: string;
  edad: number | null;
  sexo: string | null;
  telefono: string | null;
  email: string | null;
  objetivo: string | null;
  alergias: string | null;
  patologias: string | null;
  preferencias: string | null;
  gustos: string | null;
  evita: string | null;
  pesoInicial: number | null;
  altura: number | null; // cm
  consultas: Consulta[];
}

export interface Turno {
  id: number;
  fecha: string; // ISO date
  hora: string; // HH:mm
  duracionMinutos: number;
  pacienteId: number;
  motivo: string;
  estado: EstadoTurno;
  ordenManual: number | null;
  recordatorio: boolean;
  reprogramado: boolean;
  observaciones: string | null;
}

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
}

export interface RespuestaLogin {
  token: string;
  usuario: Usuario;
}

// --- Disponibilidad horaria ---

export interface RangoHorario {
  horaInicio: string; // HH:mm
  horaFin: string; // HH:mm
  duracionMinutos: number;
}

export interface RangoSemanal extends RangoHorario {
  id?: number;
  diaSemana: number; // 1 = Lunes ... 7 = Domingo
}

export interface DiaDisponibilidad {
  fecha: string;
  esExcepcion: boolean;
  cerrado: boolean;
  rangos: RangoHorario[];
}

export interface Slot {
  hora: string;
  duracionMinutos: number;
  disponible: boolean;
  rango: string;
}

export interface DiaConSlots extends DiaDisponibilidad {
  slots: Slot[];
}

// Día con horario propio que pisa la plantilla semanal.
export interface ExcepcionDia {
  fecha: string;
  cerrado: boolean;
  rangos: RangoHorario[];
}

// Solo el nombre es obligatorio: el resto puede completarse después.
export type NuevoPaciente = Partial<Omit<Paciente, 'id' | 'consultas'>> & { nombre: string };

export interface NuevoTurno {
  pacienteId: number;
  fecha: string;
  hora: string;
  motivo: string;
  recordatorio: boolean;
}
