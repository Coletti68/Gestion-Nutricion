import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataStore } from '../../core/data.store';
import { mensajeDeError } from '../../core/api-client';
import { etiquetaLarga } from '../../core/fechas';
import { DiaConSlots, Paciente, Slot, Turno } from '../../models/models';
import { PacienteDialog } from '../clientes/paciente-dialog';
import { HorariosDiaDialog } from './horarios-dialog';

export interface AppointmentDialogData {
  fecha: string;
  hora?: string;
  turno?: Turno;
}

export interface ResultadoTurno {
  pacienteId: number;
  fecha: string;
  hora: string;
  motivo: string;
  recordatorio: boolean;
  cambioHorario: boolean;
}

// Nuevo turno o reprogramación: solo se eligen slots libres del día.
@Component({
  selector: 'app-appointment-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ esEdicion ? 'Editar turno' : 'Nuevo turno' }}</h2>

    <mat-dialog-content>
      <div class="cab">
        <label class="campo-fecha">
          <span>Fecha</span>
          <input type="date" [value]="fecha()" (change)="cambiarFecha($event)" />
        </label>
        <button mat-stroked-button type="button" class="btn-horarios" (click)="editarHorarios()">
          <mat-icon>schedule</mat-icon>
          Horarios
        </button>
      </div>
      <p class="dia">{{ etiquetaLarga(fecha()) }}</p>

      @if (!cargando() && dia()?.esExcepcion) {
        <div class="aviso-dia">
          <mat-icon>event_available</mat-icon>
          <div class="aviso-txt">
            <b>Horario personalizado</b>
            <span>Este día no usa la plantilla semanal. Cambialo en Horarios.</span>
          </div>
          <button mat-button type="button" (click)="volverPlantilla()">Volver a plantilla</button>
        </div>
      }

      @if (cargando()) {
        <p class="nota">Buscando horarios disponibles…</p>
      } @else if (!slots().length) {
        <div class="sin-horarios">
          <mat-icon>event_busy</mat-icon>
          <p>{{ dia()?.cerrado ? 'Este día está cerrado.' : 'Este día no tiene horarios configurados.' }}</p>
          <button mat-button type="button" (click)="editarHorarios()">Configurar horarios</button>
        </div>
      } @else {
        <p class="label">Horario disponible</p>
        <div class="slots">
          @for (slot of slots(); track slot.hora) {
            <button
              type="button"
              class="slot"
              [class.activo]="hora() === slot.hora"
              [class.ocupado]="!slot.disponible"
              [disabled]="!slot.disponible"
              (click)="elegirHora(slot.hora)"
            >
              <b>{{ slot.hora }}</b>
              <small>{{ slot.rango === 'Actual' ? 'actual' : slot.duracionMinutos + ' min' }}</small>
            </button>
          }
        </div>
        <p class="nota">
          {{ dia()?.esExcepcion ? 'Horarios personalizados para este día.' : 'Horarios de la plantilla semanal.' }}
        </p>
      }

      <p class="label">Paciente</p>
      <div class="buscador">
        <mat-icon>search</mat-icon>
        <input
          [ngModel]="busqueda()"
          (ngModelChange)="busqueda.set($event)"
          placeholder="Buscar paciente"
          aria-label="Buscar paciente"
        />
        <button type="button" class="btn-nuevo" (click)="nuevoPaciente()">
          <mat-icon>person_add</mat-icon>
          Nuevo
        </button>
      </div>

      <div class="pacientes">
        @for (p of pacientesFiltrados(); track p.id) {
          <button
            type="button"
            class="paciente"
            [class.activo]="pacienteId() === p.id"
            (click)="pacienteId.set(p.id)"
          >
            <span class="avatar">{{ iniciales(p.nombre) }}</span>
            <span class="nombre">{{ p.nombre }}</span>
            @if (pacienteId() === p.id) {
              <mat-icon>check_circle</mat-icon>
            }
          </button>
        } @empty {
          <p class="nota">No hay pacientes que coincidan. Podés crear uno nuevo.</p>
        }
      </div>

      <mat-form-field appearance="outline" class="motivo">
        <mat-label>Motivo</mat-label>
        <input matInput [ngModel]="motivo()" (ngModelChange)="motivo.set($event)" name="motivo" />
      </mat-form-field>

      <mat-checkbox [(ngModel)]="recordatorio">Recordarme este turno</mat-checkbox>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button class="guardar" [disabled]="!puedeGuardar()" (click)="guardar()">
        {{ esEdicion ? 'Guardar' : 'Agendar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .cab {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .campo-fecha {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
        min-width: 150px;
        background: #fffdf5;
        border: 1px solid #f1e9d2;
        border-radius: 12px;
        padding: 6px 12px;
      }
      .campo-fecha span {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        color: #b36a00;
        font-weight: 700;
      }
      .campo-fecha input {
        border: none;
        background: transparent;
        font: inherit;
        font-size: 15px;
        font-weight: 600;
        color: #111;
        padding: 2px 0;
      }
      .btn-horarios mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .dia {
        margin: 8px 0 0;
        font-size: 13px;
        color: #777;
        text-transform: capitalize;
      }
      .aviso-dia {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        background: #fff5dc;
        border: 1px solid #f2d79a;
        border-radius: 12px;
        padding: 8px 10px;
        margin-top: 10px;
        color: #7a4b00;
        font-size: 13px;
        animation: aparecer 0.25s ease both;
      }
      .aviso-dia mat-icon {
        color: #f28c00;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .aviso-txt {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .aviso-txt b {
        font-size: 13px;
      }
      .aviso-txt span {
        font-size: 12px;
        color: #8a6a2a;
      }
      .aviso-dia .mat-mdc-button {
        margin-left: auto;
        font-size: 12px;
        padding: 0 8px;
        min-width: 0;
      }
      .label {
        margin: 18px 0 8px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #b36a00;
      }
      .slots {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .slot {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
        min-width: 62px;
        padding: 7px 10px;
        border-radius: 12px;
        border: 1px solid #f1e9d2;
        background: #fff;
        color: #111;
        cursor: pointer;
        font: inherit;
        transition: transform 0.16s ease, background 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
        animation: aparecer 0.22s ease both;
      }
      .slot b {
        font-size: 14px;
      }
      .slot small {
        font-size: 10px;
        color: #999;
      }
      .slot:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(242, 140, 0, 0.16);
      }
      .slot.activo {
        background: #f28c00;
        border-color: #f28c00;
        color: #111;
        box-shadow: 0 4px 14px rgba(242, 140, 0, 0.32);
      }
      .slot.activo small {
        color: #3d2600;
      }
      .slot.ocupado {
        opacity: 0.42;
        text-decoration: line-through;
        cursor: not-allowed;
        background: #f7f3e8;
      }
      .nota {
        margin: 8px 0 0;
        font-size: 12px;
        color: #999;
      }
      .sin-horarios {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        text-align: center;
        background: #fffaf0;
        border: 1px dashed #e6c98a;
        border-radius: 14px;
        padding: 16px;
        color: #7a4b00;
      }
      .sin-horarios mat-icon {
        color: #f28c00;
      }
      .sin-horarios p {
        margin: 0;
        font-size: 14px;
      }
      .buscador {
        display: flex;
        align-items: center;
        gap: 6px;
        border: 1px solid #f1e9d2;
        border-radius: 12px;
        padding: 4px 6px 4px 10px;
        background: #fff;
      }
      .buscador mat-icon {
        color: #b0a58c;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .buscador input {
        flex: 1;
        min-width: 0;
        border: none;
        background: transparent;
        font: inherit;
        font-size: 14px;
        padding: 8px 0;
      }
      .buscador input:focus-visible {
        outline: none;
      }
      .btn-nuevo {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        border: none;
        background: #f4e65a;
        color: #111;
        border-radius: 9px;
        padding: 6px 8px;
        font: inherit;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.18s ease;
      }
      .btn-nuevo:hover {
        background: #f9c900;
      }
      .btn-nuevo mat-icon {
        font-size: 17px;
        width: 17px;
        height: 17px;
        color: #111;
      }
      .pacientes {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 8px;
        max-height: 186px;
        overflow-y: auto;
        padding-right: 2px;
      }
      .paciente {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
        border: 1px solid transparent;
        background: #fffdf5;
        border-radius: 10px;
        padding: 7px 10px;
        font: inherit;
        font-size: 14px;
        text-align: left;
        cursor: pointer;
        transition: background 0.16s ease, border-color 0.16s ease;
      }
      .paciente:hover {
        background: #fff5dc;
      }
      .paciente.activo {
        border-color: #f9c900;
        background: #fff8d9;
      }
      .paciente mat-icon {
        color: #f28c00;
        margin-left: auto;
        font-size: 19px;
        width: 19px;
        height: 19px;
      }
      .avatar {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #f9c900;
        color: #111;
        display: grid;
        place-items: center;
        font-size: 11px;
        font-weight: 700;
        flex: none;
      }
      .nombre {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .motivo {
        width: 100%;
        margin-top: 16px;
      }
      .guardar {
        background: #f28c00;
        color: #111;
      }
      @media (max-width: 480px) {
        .slot {
          min-width: 56px;
          padding: 6px 8px;
        }
      }
    `,
  ],
})
export class AppointmentDialog {
  data = inject<AppointmentDialogData>(MAT_DIALOG_DATA);
  private store = inject(DataStore);
  private ref = inject(MatDialogRef<AppointmentDialog, ResultadoTurno>);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  etiquetaLarga = etiquetaLarga;
  esEdicion = !!this.data.turno;

  fecha = signal(this.data.turno?.fecha ?? this.data.fecha);
  hora = signal(this.data.turno?.hora ?? this.data.hora ?? '');
  dia = signal<DiaConSlots | null>(null);
  slots = computed(() => this.dia()?.slots ?? []);
  cargando = signal(true);

  pacienteId = signal<number | null>(this.data.turno?.pacienteId ?? null);
  busqueda = signal('');
  motivo = signal(this.data.turno?.motivo ?? 'Consulta');
  recordatorio = this.data.turno?.recordatorio ?? true;

  pacientesFiltrados = computed(() => {
    const texto = this.busqueda().trim().toLowerCase();
    const lista = this.store.pacientes();
    if (!texto) return lista;
    return lista.filter(
      (p) => p.nombre.toLowerCase().includes(texto) || (p.telefono ?? '').includes(texto)
    );
  });

  puedeGuardar = computed(
    () => !!this.pacienteId() && !!this.hora() && this.motivo().trim().length > 0
  );

  constructor() {
    void this.cargarSlots();
  }

  private async cargarSlots() {
    this.cargando.set(true);
    try {
      const dia = await this.store.slots(this.fecha(), this.data.turno?.id);
      let slots: Slot[] = dia.slots;

      // Al editar un turno viejo, su horario puede no estar en la plantilla actual.
      const actual = this.data.turno;
      if (actual && actual.fecha === this.fecha() && !slots.some((slot) => slot.hora === actual.hora)) {
        slots = [
          { hora: actual.hora, duracionMinutos: actual.duracionMinutos, disponible: true, rango: 'Actual' },
          ...slots,
        ];
      }

      this.dia.set({ ...dia, slots });

      const elegida = this.hora();
      if (!elegida || !slots.some((slot) => slot.hora === elegida && slot.disponible)) {
        this.hora.set(slots.find((slot) => slot.disponible)?.hora ?? '');
      }
    } catch (err) {
      this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarFecha(evento: Event) {
    const valor = (evento.target as HTMLInputElement).value;
    if (!valor) return;
    this.fecha.set(valor);
    this.hora.set('');
    void this.cargarSlots();
  }

  elegirHora(hora: string) {
    this.hora.set(hora);
  }

  editarHorarios() {
    this.dialog
      .open(HorariosDiaDialog, { data: { fecha: this.fecha() }, width: '480px', maxWidth: '94vw' })
      .afterClosed()
      .subscribe((cambio) => {
        if (cambio) void this.cargarSlots();
      });
  }

  // Borra la excepción del día y recarga los slots de la plantilla semanal.
  async volverPlantilla() {
    if (!confirm('¿Volver a la plantilla semanal para este día? Se borra el horario personalizado.')) {
      return;
    }

    try {
      await this.store.eliminarDia(this.fecha());
      this.snack.open('Se vuelve a usar la plantilla semanal', 'OK', { duration: 2500 });
      this.hora.set('');
      await this.cargarSlots();
    } catch (err) {
      this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
    }
  }

  nuevoPaciente() {
    this.dialog
      .open(PacienteDialog, { width: '560px', maxWidth: '94vw' })
      .afterClosed()
      .subscribe((paciente: Paciente | undefined) => {
        if (!paciente) return;
        this.pacienteId.set(paciente.id);
        this.busqueda.set('');
      });
  }

  iniciales(nombre: string) {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join('');
  }

  guardar() {
    const pacienteId = this.pacienteId();
    if (!pacienteId || !this.hora() || !this.motivo().trim()) return;

    const turno = this.data.turno;
    this.ref.close({
      pacienteId,
      fecha: this.fecha(),
      hora: this.hora(),
      motivo: this.motivo().trim(),
      recordatorio: this.recordatorio,
      cambioHorario: !turno || turno.fecha !== this.fecha() || turno.hora !== this.hora(),
    });
  }
}

@Component({
  selector: 'app-finalize-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Finalizar turno</h2>
    <mat-dialog-content class="form">
      <p class="sub">{{ data.paciente.nombre }} · {{ data.turno.hora }}</p>
      <mat-form-field appearance="outline"><mat-label>Peso (kg)</mat-label><input matInput type="number" [(ngModel)]="peso"></mat-form-field>
      <mat-form-field appearance="outline"><mat-label>Motivo</mat-label><input matInput [(ngModel)]="motivo"></mat-form-field>
      <mat-form-field appearance="outline" class="full"><mat-label>Qué se habló / observaciones</mat-label><input matInput [(ngModel)]="observaciones"></mat-form-field>
      <p class="nota">Al finalizar se registra la sesión en el historial del cliente.</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button class="guardar" [disabled]="!peso" (click)="save()">Finalizar</button>
    </mat-dialog-actions>
  `,
  styles: [`.form{display:grid;gap:12px;min-width:min(320px,78vw)} .full{grid-column:1/-1} .sub{margin:0 0 8px;color:#666} .nota{margin:0;font-size:12px;color:#888} .guardar{background:#f28c00;color:#111}`],
})
export class FinalizeDialog {
  data = inject<{ paciente: Paciente; turno: Turno }>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<FinalizeDialog>);

  peso = this.data.paciente.consultas.at(-1)?.peso ?? this.data.paciente.pesoInicial ?? 0;
  motivo = this.data.turno.motivo;
  observaciones = '';

  save() {
    this.ref.close({
      peso: Number(this.peso),
      motivo: this.motivo,
      observaciones: this.observaciones,
    });
  }
}
