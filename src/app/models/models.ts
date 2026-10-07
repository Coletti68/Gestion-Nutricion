export interface Consultation {
  fecha: string; // ISO date
  motivo: string;
  peso: number; // kg
  observaciones: string;
}

export interface Patient {
  id: number;
  nombre: string;
  edad: number;
  sexo: string;
  telefono: string;
  email: string;
  objetivo: string;
  alergias: string;
  patologias: string;
  preferencias: string;
  gustos: string;
  evita: string;
  pesoInicial: number;
  altura: number; // cm
  consultas: Consultation[];
}

export interface Appointment {
  id: number;
  fecha: string; // ISO date
  hora: string; // HH:mm
  pacienteId: number;
  motivo: string;
  estado: 'Confirmado' | 'Pendiente' | 'Realizado' | 'Cancelado';
}
