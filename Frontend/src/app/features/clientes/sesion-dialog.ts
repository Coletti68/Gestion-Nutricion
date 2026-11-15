import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataStore } from '../../core/data.store';
import { mensajeDeError } from '../../core/api-client';
import { hoyIso } from '../../core/fechas';
import { Consulta } from '../../models/models';

export interface SesionDialogData {
  pacienteId: number;
  pacienteNombre: string;
  consulta?: Consulta;
  pesoReferencia?: number | null;
}

// Alta y edición de sesiones en un modal, igual que el alta de pacientes.
@Component({
  selector: 'app-sesion-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ esEdicion ? 'Editar sesión' : 'Registrar sesión' }}</h2>

    <mat-dialog-content>
      <p class="sub">{{ data.pacienteNombre }}</p>

      <div class="form">
        <mat-form-field appearance="outline">
          <mat-label>Fecha</mat-label>
          <input matInput type="date" [(ngModel)]="model.fecha" name="fecha" required />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Motivo</mat-label>
          <input matInput [(ngModel)]="model.motivo" name="motivo" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Peso (kg)</mat-label>
          <input matInput type="number" [(ngModel)]="model.peso" name="peso" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Qué se habló / observaciones</mat-label>
          <textarea matInput rows="3" [(ngModel)]="model.observaciones" name="observaciones"></textarea>
        </mat-form-field>
      </div>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button
        mat-flat-button
        class="guardar"
        [disabled]="!model.fecha || !model.motivo.trim() || guardando()"
        (click)="guardar()"
      >
        {{ esEdicion ? 'Guardar cambios' : 'Registrar sesión' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .sub {
        margin: 0 0 12px;
        color: #666;
        font-size: 13px;
      }
      .form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px 12px;
        padding-top: 4px;
      }
      .full {
        grid-column: 1 / -1;
      }
      .guardar {
        background: #f28c00;
        color: #111;
      }
      @media (max-width: 520px) {
        .form {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class SesionDialog {
  private store = inject(DataStore);
  private ref = inject(MatDialogRef<SesionDialog, Consulta>);
  private snack = inject(MatSnackBar);

  data = inject<SesionDialogData>(MAT_DIALOG_DATA);
  esEdicion = !!this.data.consulta;
  guardando = signal(false);

  model = {
    fecha: hoyIso(),
    motivo: 'Control',
    peso: this.data.pesoReferencia ?? 0,
    observaciones: '',
  };

  constructor() {
    const consulta = this.data.consulta;
    if (consulta) {
      this.model = {
        fecha: consulta.fecha,
        motivo: consulta.motivo,
        peso: consulta.peso ?? 0,
        observaciones: consulta.observaciones ?? '',
      };
    }
  }

  async guardar() {
    if (!this.model.fecha || !this.model.motivo.trim() || this.guardando()) return;

    this.guardando.set(true);
    try {
      const datos = {
        fecha: this.model.fecha,
        motivo: this.model.motivo.trim(),
        peso: Number(this.model.peso),
        observaciones: this.model.observaciones.trim(),
      };

      const consulta = this.data.consulta
        ? await this.store.actualizarConsulta(this.data.consulta.id!, datos)
        : await this.store.crearConsulta(this.data.pacienteId, datos);

      this.ref.close(consulta);
    } catch (err) {
      this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
    } finally {
      this.guardando.set(false);
    }
  }
}
