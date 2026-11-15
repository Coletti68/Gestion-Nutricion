import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataStore } from '../../core/data.store';
import { mensajeDeError } from '../../core/api-client';
import { etiquetaLarga, fechaCorta } from '../../core/fechas';
import { validarRangos } from '../../core/horarios';
import { DiaDisponibilidad, RangoHorario } from '../../models/models';
import { RangoEditor } from '../../shared/rango-editor';
import { ConfirmacionDialog } from '../../shared/confirm-dialog';

// Excepción de horarios para una fecha puntual (pisa la plantilla semanal).
@Component({
  selector: 'app-horarios-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    RangoEditor,
  ],
  template: `
    <h2 mat-dialog-title>Horarios del día</h2>

    <mat-dialog-content>
      <p class="fecha">{{ etiquetaLarga(data.fecha) }} · {{ fechaCorta(data.fecha) }}</p>

      @if (aviso()) {
        <div class="aviso-turnos">
          <mat-icon>warning_amber</mat-icon>
          <span>{{ aviso() }}</span>
        </div>
      }

      @if (cargando()) {
        <p class="nota">Cargando horarios…</p>
      } @else {
        @if (esExcepcion()) {
          <div class="aviso">
            <mat-icon>event_available</mat-icon>
            <span>Este día tiene horarios personalizados.</span>
            <button mat-button (click)="usarPlantilla()">Usar plantilla</button>
          </div>
        }

        <mat-slide-toggle [ngModel]="cerrado()" (ngModelChange)="cerrado.set($event)" color="primary">
          Día cerrado (no se atiende)
        </mat-slide-toggle>

        @if (!cerrado()) {
          <p class="label">Rangos de atención</p>
          <app-rango-editor [rangos]="rangos()" (cambio)="rangos.set($event)" />
          <p class="nota">Los cambios aplican solo a este día.</p>
        }
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button class="guardar" [disabled]="cargando() || guardando()" (click)="guardar()">
        Guardar
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      mat-dialog-content {
        min-width: min(360px, 78vw);
      }
      .fecha {
        margin: 0 0 14px;
        font-weight: 600;
        color: #111;
        text-transform: capitalize;
      }
      .label {
        margin: 18px 0 8px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #b36a00;
      }
      .nota {
        margin: 12px 0 0;
        font-size: 12px;
        color: #888;
      }
      .aviso {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        background: #fff5dc;
        border: 1px solid #f2d79a;
        border-radius: 12px;
        padding: 8px 12px;
        margin-bottom: 14px;
        font-size: 13px;
        color: #7a4b00;
        animation: aparecer 0.25s ease both;
      }
      .aviso mat-icon {
        color: #f28c00;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .aviso-turnos {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        background: #ffe9e9;
        border: 1px solid #f0b9b9;
        border-radius: 12px;
        padding: 8px 12px;
        margin-bottom: 14px;
        font-size: 12px;
        line-height: 1.35;
        color: #8a1f1f;
        animation: aparecer 0.25s ease both;
      }
      .aviso-turnos mat-icon {
        color: #b3261e;
        font-size: 20px;
        width: 20px;
        height: 20px;
        flex: none;
      }
      .guardar {
        background: #f28c00;
        color: #111;
      }
    `,
  ],
})
export class HorariosDiaDialog {
  data = inject<{ fecha: string }>(MAT_DIALOG_DATA);
  private store = inject(DataStore);
  private ref = inject(MatDialogRef<HorariosDiaDialog, boolean>);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  etiquetaLarga = etiquetaLarga;
  fechaCorta = fechaCorta;

  cargando = signal(true);
  guardando = signal(false);
  esExcepcion = signal(false);
  cerrado = signal(false);
  rangos = signal<RangoHorario[]>([]);

  // Turnos que se mantienen aunque cambien los horarios del día.
  turnosActivos = computed(() =>
    this.store.turnos().filter((turno) => turno.fecha === this.data.fecha && turno.estado !== 'Cancelado')
  );

  aviso = computed(() => {
    const activos = this.turnosActivos();
    if (!activos.length) return '';

    if (this.cerrado()) {
      return `Este día tiene ${activos.length} turno${activos.length > 1 ? 's' : ''} agendado${
        activos.length > 1 ? 's' : ''
      }. Si lo cerrás, se mantienen pero el día deja de ofrecer horarios.`;
    }

    const fuera = activos.filter(
      (turno) =>
        !this.rangos().some((rango) => turno.hora >= rango.horaInicio && turno.hora < rango.horaFin)
    );
    if (!fuera.length) return '';

    const horas = fuera.map((turno) => turno.hora).join(', ');
    return `${fuera.length} turno${fuera.length > 1 ? 's' : ''} queda${
      fuera.length > 1 ? 'n' : ''
    } fuera de los nuevos horarios (${horas}). Se mantienen, pero revisalos.`;
  });

  constructor() {
    void this.cargar();
  }

  async cargar() {
    try {
      const dia: DiaDisponibilidad = await this.store.dia(this.data.fecha);
      this.esExcepcion.set(dia.esExcepcion);
      this.cerrado.set(dia.cerrado);
      this.rangos.set(dia.rangos.map((rango) => ({ ...rango })));
    } catch (err) {
      this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
    } finally {
      this.cargando.set(false);
    }
  }

  async usarPlantilla() {
    const confirmar = await firstValueFrom(
      this.dialog
        .open(ConfirmacionDialog, {
          data: {
            titulo: 'Usar plantilla',
            mensaje: '¿Volver a la plantilla semanal para este día?',
            detalle: 'Se borra el horario personalizado.',
            botonTexto: 'Usar plantilla',
            icono: 'event_repeat',
            iconoBoton: 'event_repeat',
            peligro: false,
          },
          width: '420px',
          maxWidth: '94vw',
          autoFocus: false,
        })
        .afterClosed()
    );
    if (!confirmar) return;

    try {
      await this.store.eliminarDia(this.data.fecha);
      this.snack.open('Se vuelve a usar la plantilla semanal', 'OK', { duration: 2500 });
      this.ref.close(true);
    } catch (err) {
      this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
    }
  }

  async guardar() {
    if (this.guardando()) return;

    if (!this.cerrado()) {
      const error = validarRangos(this.rangos());
      if (error) {
        this.snack.open(error, 'OK', { duration: 3500 });
        return;
      }
    }

    const aviso = this.aviso();
    if (aviso) {
      const confirmar = await firstValueFrom(
        this.dialog
          .open(ConfirmacionDialog, {
            data: {
              titulo: 'Guardar con advertencias',
              mensaje: aviso,
              detalle: '¿Guardar igual?',
              botonTexto: 'Guardar igual',
              icono: 'warning',
              iconoBoton: 'save',
              peligro: false,
            },
            width: '420px',
            maxWidth: '94vw',
            autoFocus: false,
          })
          .afterClosed()
      );
      if (!confirmar) return;
    }

    this.guardando.set(true);
    try {
      await this.store.guardarDia(this.data.fecha, {
        cerrado: this.cerrado(),
        rangos: this.cerrado() ? [] : this.rangos(),
      });
      this.snack.open('Horarios del día guardados', 'OK', { duration: 2200 });
      this.ref.close(true);
    } catch (err) {
      this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
    } finally {
      this.guardando.set(false);
    }
  }
}
