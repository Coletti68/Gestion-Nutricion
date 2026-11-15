import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataStore } from '../../core/data.store';
import { mensajeDeError } from '../../core/api-client';
import { NuevoPaciente, Paciente } from '../../models/models';
import { ObjetivosDialog } from './objetivos-dialog';

// Alta rápida de paciente: solo el nombre es obligatorio.
@Component({
  selector: 'app-paciente-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatExpansionModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ esEdicion ? 'Editar paciente' : 'Nuevo paciente' }}</h2>

    <mat-dialog-content>
      <form class="form" (ngSubmit)="guardar()">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Nombre</mat-label>
          <input matInput [(ngModel)]="model.nombre" name="nombre" required autofocus />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Teléfono</mat-label>
          <input matInput [(ngModel)]="model.telefono" name="telefono" inputmode="tel" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput [(ngModel)]="model.email" name="email" inputmode="email" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Edad</mat-label>
          <input matInput type="number" [(ngModel)]="model.edad" name="edad" min="0" max="120" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Sexo</mat-label>
          <mat-select [(ngModel)]="model.sexo" name="sexo">
            <mat-option value="">Sin especificar</mat-option>
            <mat-option value="Femenino">Femenino</mat-option>
            <mat-option value="Masculino">Masculino</mat-option>
            <mat-option value="Otro">Otro</mat-option>
          </mat-select>
        </mat-form-field>

        <div class="objetivo full">
          <mat-form-field appearance="outline" class="objetivo-field">
            <mat-label>Objetivo</mat-label>
            <mat-select [(ngModel)]="model.objetivo" name="objetivo">
              <mat-option value="">Sin definir</mat-option>
              @for (o of objetivos(); track o.id) {
                <mat-option [value]="o.nombre">{{ o.nombre }}</mat-option>
              }
              @if (objetivoFueraDelCatalogo()) {
                <mat-option [value]="model.objetivo">{{ model.objetivo }} (actual)</mat-option>
              }
            </mat-select>
          </mat-form-field>
          <button mat-stroked-button type="button" class="gestionar" (click)="gestionarObjetivos()">
            <mat-icon>tune</mat-icon>
            Gestionar
          </button>
        </div>

        <mat-form-field appearance="outline">
          <mat-label>Peso inicial (kg)</mat-label>
          <input matInput type="number" [(ngModel)]="model.pesoInicial" name="pesoInicial" min="0" max="500" />
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Altura (cm)</mat-label>
          <input matInput type="number" [(ngModel)]="model.altura" name="altura" min="0" max="300" />
        </mat-form-field>

        <mat-expansion-panel class="full panel">
          <mat-expansion-panel-header>
            <mat-panel-title>Datos clínicos (opcional)</mat-panel-title>
          </mat-expansion-panel-header>

          <div class="panel-form">
            <mat-form-field appearance="outline">
              <mat-label>Alergias</mat-label>
              <input matInput [(ngModel)]="model.alergias" name="alergias" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Patologías</mat-label>
              <input matInput [(ngModel)]="model.patologias" name="patologias" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Preferencias alimenticias</mat-label>
              <input matInput [(ngModel)]="model.preferencias" name="preferencias" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Le gusta comer</mat-label>
              <input matInput [(ngModel)]="model.gustos" name="gustos" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Evita / no le gusta</mat-label>
              <input matInput [(ngModel)]="model.evita" name="evita" />
            </mat-form-field>
          </div>
        </mat-expansion-panel>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button class="guardar" [disabled]="!model.nombre.trim() || guardando()" (click)="guardar()">
        {{ esEdicion ? 'Guardar cambios' : 'Guardar' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px 12px;
        padding-top: 6px;
        min-width: 0;
      }
      .full {
        grid-column: 1 / -1;
        min-width: 0;
      }
      .objetivo {
        display: flex;
        align-items: flex-end;
        gap: 8px;
        min-width: 0;
        margin-bottom: 4px;
      }
      .objetivo-field {
        flex: 1;
        min-width: 0;
      }
      .gestionar {
        flex: none;
        color: #a86800;
        border-color: #f1e9d2;
        margin-bottom: 10px;
      }
      .gestionar mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .panel {
        margin: 4px 0 12px;
        box-shadow: none;
        border: 1px solid #f1e9d2;
      }
      .panel-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 4px 12px;
        padding-top: 8px;
      }
      .guardar {
        background: #f28c00;
        color: #111;
      }
      mat-dialog-content {
        overflow-x: hidden;
      }
      mat-form-field {
        max-width: 100%;
      }
      @media (max-width: 520px) {
        .form,
        .panel-form {
          grid-template-columns: 1fr;
        }
        .objetivo {
          flex-direction: column;
          align-items: stretch;
          margin-bottom: 12px;
        }
        .gestionar {
          width: 100%;
        }
      }
    `,
  ],
})
export class PacienteDialog {
  private store = inject(DataStore);
  private ref = inject(MatDialogRef<PacienteDialog, Paciente>);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private data = inject<{ paciente?: Paciente } | null>(MAT_DIALOG_DATA, { optional: true });

  objetivos = this.store.objetivos;
  esEdicion = !!this.data?.paciente;
  guardando = signal(false);

  model = {
    nombre: '',
    telefono: '',
    email: '',
    edad: null as number | null,
    sexo: '',
    objetivo: '',
    pesoInicial: null as number | null,
    altura: null as number | null,
    alergias: '',
    patologias: '',
    preferencias: '',
    gustos: '',
    evita: '',
  };

  constructor() {
    const paciente = this.data?.paciente;
    if (paciente) {
      this.model = {
        nombre: paciente.nombre,
        telefono: paciente.telefono ?? '',
        email: paciente.email ?? '',
        edad: paciente.edad,
        sexo: paciente.sexo ?? '',
        objetivo: paciente.objetivo ?? '',
        pesoInicial: paciente.pesoInicial,
        altura: paciente.altura,
        alergias: paciente.alergias ?? '',
        patologias: paciente.patologias ?? '',
        preferencias: paciente.preferencias ?? '',
        gustos: paciente.gustos ?? '',
        evita: paciente.evita ?? '',
      };
    }

    void this.store.cargarObjetivos();
  }

  // Si el objetivo guardado ya no está en el catálogo, se ofrece igual.
  objetivoFueraDelCatalogo() {
    return (
      !!this.model.objetivo && !this.objetivos().some((o) => o.nombre === this.model.objetivo)
    );
  }

  gestionarObjetivos() {
    this.dialog
      .open(ObjetivosDialog, { width: '520px', maxWidth: '94vw' })
      .afterClosed()
      .subscribe(() => this.sincronizarObjetivo());
  }

  // Si se renombró el objetivo que tenía el paciente, el select acompaña.
  private sincronizarObjetivo() {
    const paciente = this.data?.paciente;
    if (!paciente) return;

    const actual = this.store.paciente(paciente.id);
    if (actual?.objetivo && this.model.objetivo === paciente.objetivo) {
      this.model.objetivo = actual.objetivo;
    }
  }

  async guardar() {
    const nombre = this.model.nombre.trim();
    if (!nombre || this.guardando()) return;

    this.guardando.set(true);
    try {
      // Se envían todos los campos para que editar también permita vaciarlos.
      const datos: NuevoPaciente = {
        nombre,
        telefono: this.model.telefono.trim() || null,
        email: this.model.email.trim() || null,
        edad: this.model.edad != null ? Number(this.model.edad) : null,
        sexo: this.model.sexo || null,
        objetivo: this.model.objetivo || null,
        pesoInicial: this.model.pesoInicial != null ? Number(this.model.pesoInicial) : null,
        altura: this.model.altura != null ? Number(this.model.altura) : null,
        alergias: this.model.alergias.trim() || null,
        patologias: this.model.patologias.trim() || null,
        preferencias: this.model.preferencias.trim() || null,
        gustos: this.model.gustos.trim() || null,
        evita: this.model.evita.trim() || null,
      };

      const paciente = this.data?.paciente
        ? await this.store.actualizarPaciente(this.data.paciente.id, datos)
        : await this.store.crearPaciente(datos);

      this.ref.close(paciente);
    } catch (err) {
      this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
    } finally {
      this.guardando.set(false);
    }
  }
}
