import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmacionData {
  titulo: string;
  mensaje: string;
  detalle?: string;
  botonTexto: string;
  icono?: string;
  iconoBoton?: string;
  peligro?: boolean;
}

// Modal de confirmación con el mismo estilo que el de mover turno.
// `peligro` pinta el botón de confirmación en rojo para acciones destructivas.
@Component({
  selector: 'app-confirmacion-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="titulo">
      <mat-icon [class.peligro]="data.peligro">{{ data.icono ?? (data.peligro ? 'warning' : 'help_outline') }}</mat-icon>
      {{ data.titulo }}
    </h2>

    <mat-dialog-content class="contenido">
      <p class="mensaje">{{ data.mensaje }}</p>
      @if (data.detalle) {
        <p class="detalle">{{ data.detalle }}</p>
      }
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-flat-button class="confirmar" [class.peligro]="data.peligro" [mat-dialog-close]="true">
        <mat-icon>{{ data.iconoBoton ?? 'check' }}</mat-icon>
        {{ data.botonTexto }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .titulo {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #111;
      }
      .titulo mat-icon {
        color: #f28c00;
      }
      .titulo mat-icon.peligro {
        color: #c62828;
      }
      .contenido {
        padding-top: 4px;
      }
      .mensaje {
        margin: 0 0 8px;
        font-size: 14px;
        line-height: 1.4;
        color: #333;
      }
      .detalle {
        margin: 0;
        font-size: 12px;
        line-height: 1.4;
        color: #7a6a4a;
      }
      .confirmar {
        background: #f28c00;
        color: #111;
      }
      .confirmar.peligro {
        background: #c62828;
        color: #fff;
      }
      .confirmar mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    `,
  ],
})
export class ConfirmacionDialog {
  data = inject<ConfirmacionData>(MAT_DIALOG_DATA);
}
