import { Injectable, signal } from '@angular/core';
import { Patient, Appointment } from '../models/models';
import { MOCK_PATIENTS, MOCK_APPOINTMENTS } from '../data/mock-data';

@Injectable({ providedIn: 'root' })
export class DataService {
  patients = signal<Patient[]>([]);
  appointments = signal<Appointment[]>([]);

  constructor() {
    const p = localStorage.getItem('patients');
    const a = localStorage.getItem('appointments');
    this.patients.set(p ? JSON.parse(p) : structuredClone(MOCK_PATIENTS));
    this.appointments.set(a ? JSON.parse(a) : structuredClone(MOCK_APPOINTMENTS));
  }

  private persist() {
    localStorage.setItem('patients', JSON.stringify(this.patients()));
    localStorage.setItem('appointments', JSON.stringify(this.appointments()));
  }

  addPatient(p: Omit<Patient, 'id' | 'consultas'>) {
    const id = Math.max(0, ...this.patients().map(x => x.id)) + 1;
    this.patients.update(list => [...list, { ...p, id, consultas: [] }]);
    this.persist();
  }

  addConsultation(patientId: number, c: { fecha: string; motivo: string; peso: number; observaciones: string }) {
    this.patients.update(list =>
      list.map(p => (p.id === patientId ? { ...p, consultas: [...p.consultas, c].sort((a, b) => a.fecha.localeCompare(b.fecha)) } : p))
    );
    this.persist();
  }

  addAppointment(a: Omit<Appointment, 'id'>) {
    const id = Math.max(0, ...this.appointments().map(x => x.id)) + 1;
    this.appointments.update(list => [...list, { ...a, id }].sort((x, y) => (x.fecha + x.hora).localeCompare(y.fecha + y.hora)));
    this.persist();
  }

  patientName(id: number): string {
    return this.patients().find(p => p.id === id)?.nombre ?? 'Desconocido';
  }

  getPatient(id: number): Patient | undefined {
    return this.patients().find(p => p.id === id);
  }

  resetDemo() {
    localStorage.removeItem('patients');
    localStorage.removeItem('appointments');
    this.patients.set(structuredClone(MOCK_PATIENTS));
    this.appointments.set(structuredClone(MOCK_APPOINTMENTS));
    this.persist();
  }
}
