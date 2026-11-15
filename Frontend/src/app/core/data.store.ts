import { Injectable, inject, signal } from '@angular/core';
import { ApiClient, mensajeDeError } from './api-client';
import {
  Consulta,
  DiaConSlots,
  DiaDisponibilidad,
  ExcepcionDia,
  NuevoPaciente,
  NuevoTurno,
  Objetivo,
  Paciente,
  RangoHorario,
  RangoSemanal,
  Turno
} from '../models/models';

// Estado único de la app: pacientes, turnos y disponibilidad traídos de la API.
@Injectable({ providedIn: 'root' })
export class DataStore {
  private api = inject(ApiClient);

  pacientes = signal<Paciente[]>([]);
  turnos = signal<Turno[]>([]);
  objetivos = signal<Objetivo[]>([]);
  disponibilidad = signal<RangoSemanal[]>([]);
  excepciones = signal<ExcepcionDia[]>([]);
  ready = signal(false);
  cargando = signal(false);
  error = signal('');

  constructor() {
    void this.cargar();
  }

  async cargar() {
    this.cargando.set(true);
    this.error.set('');
    // El catálogo no bloquea la carga principal si falla.
    void this.cargarObjetivos();
    try {
      const [pacientes, turnos, disponibilidad] = await Promise.all([
        this.api.get<Paciente[]>('/pacientes'),
        this.api.get<Turno[]>('/turnos'),
        this.api.get<RangoSemanal[]>('/disponibilidad')
      ]);
      this.pacientes.set(pacientes);
      this.turnos.set(turnos);
      this.disponibilidad.set(disponibilidad);
    } catch (err) {
      this.error.set(mensajeDeError(err));
    } finally {
      this.cargando.set(false);
      this.ready.set(true);
    }
  }

  // --- Pacientes ---

  async crearPaciente(datos: NuevoPaciente) {
    const paciente = await this.api.post<Paciente>('/pacientes', datos);
    this.pacientes.update((lista) =>
      [...lista, paciente].sort((a, b) => a.nombre.localeCompare(b.nombre))
    );
    return paciente;
  }

  async actualizarPaciente(id: number, datos: Partial<NuevoPaciente>) {
    const paciente = await this.api.put<Paciente>(`/pacientes/${id}`, datos);
    this.pacientes.update((lista) => lista.map((p) => (p.id === id ? paciente : p)));
    return paciente;
  }

  async eliminarPaciente(id: number) {
    await this.api.delete(`/pacientes/${id}`);
    this.pacientes.update((lista) => lista.filter((p) => p.id !== id));
    this.turnos.update((lista) => lista.filter((t) => t.pacienteId !== id));
  }

  async crearConsulta(pacienteId: number, datos: Omit<Consulta, 'id' | 'pacienteId'>) {
    const consulta = await this.api.post<Consulta>(`/pacientes/${pacienteId}/consultas`, datos);
    this.pacientes.update((lista) =>
      lista.map((p) =>
        p.id === pacienteId
          ? { ...p, consultas: [...p.consultas, consulta].sort((a, b) => a.fecha.localeCompare(b.fecha)) }
          : p
      )
    );
    return consulta;
  }

  async actualizarConsulta(id: number, datos: Partial<Consulta>) {
    const consulta = await this.api.put<Consulta>(`/consultas/${id}`, datos);
    const pacienteId = consulta.pacienteId;
    if (pacienteId) {
      this.pacientes.update((lista) =>
        lista.map((p) =>
          p.id === pacienteId
            ? {
                ...p,
                consultas: p.consultas
                  .map((c) => (c.id === id ? consulta : c))
                  .sort((a, b) => a.fecha.localeCompare(b.fecha))
              }
            : p
        )
      );
    }
    return consulta;
  }

  // Baja lógica: la sesión deja de mostrarse pero queda guardada.
  async eliminarConsulta(id: number, pacienteId: number) {
    await this.api.delete(`/consultas/${id}`);
    this.pacientes.update((lista) =>
      lista.map((p) =>
        p.id === pacienteId ? { ...p, consultas: p.consultas.filter((c) => c.id !== id) } : p
      )
    );
  }

  // --- Objetivos ---

  async cargarObjetivos() {
    try {
      this.objetivos.set(await this.api.get<Objetivo[]>('/objetivos'));
    } catch {
      // Si falla, el select conserva el objetivo actual del paciente.
    }
  }

  async crearObjetivo(nombre: string) {
    const objetivo = await this.api.post<Objetivo>('/objetivos', { nombre });
    this.ordenarObjetivos([...this.objetivos(), objetivo]);
    return objetivo;
  }

  async actualizarObjetivo(id: number, nombre: string) {
    const anterior = this.objetivos().find((o) => o.id === id);
    const objetivo = await this.api.put<Objetivo>(`/objetivos/${id}`, { nombre });
    this.ordenarObjetivos(this.objetivos().map((o) => (o.id === id ? objetivo : o)));

    // El backend renombra a los pacientes; se refleja en el estado local.
    if (anterior && anterior.nombre !== objetivo.nombre) {
      this.pacientes.update((lista) =>
        lista.map((p) => (p.objetivo === anterior.nombre ? { ...p, objetivo: objetivo.nombre } : p))
      );
    }
    return objetivo;
  }

  async eliminarObjetivo(id: number) {
    await this.api.delete(`/objetivos/${id}`);
    this.objetivos.update((lista) => lista.filter((o) => o.id !== id));
  }

  private ordenarObjetivos(lista: Objetivo[]) {
    this.objetivos.set(
      [...lista].sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre))
    );
  }

  // --- Turnos ---

  async crearTurno(datos: NuevoTurno) {
    const turno = await this.api.post<Turno>('/turnos', datos);
    this.turnos.update((lista) => [...lista, turno]);
    return turno;
  }

  async actualizarTurno(id: number, cambios: Partial<Turno>) {
    const turno = await this.api.put<Turno>(`/turnos/${id}`, cambios);
    this.turnos.update((lista) => lista.map((t) => (t.id === id ? turno : t)));
    return turno;
  }

  async eliminarTurno(id: number) {
    await this.api.delete(`/turnos/${id}`);
    this.turnos.update((lista) => lista.filter((t) => t.id !== id));
  }

  // Orden visual dentro del mismo día (no cambia horarios).
  async reordenarTurnos(cambios: { id: number; fecha: string; ordenManual: number }[]) {
    await this.api.put('/turnos/reordenar', cambios);
    this.turnos.update((lista) =>
      lista.map((t) => {
        const cambio = cambios.find((c) => c.id === t.id);
        return cambio ? { ...t, fecha: cambio.fecha, ordenManual: cambio.ordenManual } : t;
      })
    );
  }

  // Finaliza el turno y registra la consulta en una sola operación del backend.
  async finalizarTurno(id: number, datos: { peso: number; motivo: string; observaciones: string }) {
    const resultado = await this.api.post<{ turno: Turno; consulta: Consulta }>(
      `/turnos/${id}/finalizar`,
      datos
    );

    this.turnos.update((lista) => lista.map((t) => (t.id === id ? resultado.turno : t)));
    this.pacientes.update((lista) =>
      lista.map((p) =>
        p.id === resultado.turno.pacienteId
          ? {
              ...p,
              consultas: [...p.consultas, resultado.consulta].sort((a, b) => a.fecha.localeCompare(b.fecha))
            }
          : p
      )
    );

    return resultado;
  }

  // --- Disponibilidad horaria ---

  async guardarSemanal(rangos: RangoSemanal[]) {
    const guardada = await this.api.put<RangoSemanal[]>('/disponibilidad', rangos);
    this.disponibilidad.set(guardada);
    return guardada;
  }

  dia(fecha: string) {
    return this.api.get<DiaDisponibilidad>(`/disponibilidad/${fecha}`);
  }

  slots(fecha: string, excluirTurnoId?: number) {
    const consulta = excluirTurnoId ? `?excluirTurnoId=${excluirTurnoId}` : '';
    return this.api.get<DiaConSlots>(`/disponibilidad/${fecha}/slots${consulta}`);
  }

  // Días con horario propio en un rango de fechas (solo lectura).
  listarExcepciones(desde?: string, hasta?: string) {
    const params = new URLSearchParams();
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);
    const consulta = params.toString();
    return this.api.get<ExcepcionDia[]>(`/disponibilidad/excepciones${consulta ? `?${consulta}` : ''}`);
  }

  async guardarDia(fecha: string, datos: { cerrado: boolean; rangos: RangoHorario[] }) {
    const dia = await this.api.put<DiaDisponibilidad>(`/disponibilidad/${fecha}`, datos);
    // Mantiene sincronizado el mapa de excepciones que usa la agenda.
    this.excepciones.update((lista) => [
      ...lista.filter((item) => item.fecha !== fecha),
      { fecha, cerrado: datos.cerrado, rangos: datos.rangos },
    ]);
    return dia;
  }

  async eliminarDia(fecha: string) {
    const dia = await this.api.delete<DiaDisponibilidad>(`/disponibilidad/${fecha}`);
    this.excepciones.update((lista) => lista.filter((item) => item.fecha !== fecha));
    return dia;
  }

  // --- Consultas de estado ---

  paciente(id: number) {
    return this.pacientes().find((p) => p.id === id);
  }

  nombrePaciente(id: number) {
    return this.paciente(id)?.nombre ?? 'Sin paciente';
  }

  turnosDe(pacienteId: number) {
    return this.turnos()
      .filter((t) => t.pacienteId === pacienteId)
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
  }
}
