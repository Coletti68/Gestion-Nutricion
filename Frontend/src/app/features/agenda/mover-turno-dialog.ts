import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { etiquetaDiaMes } from '../../core/fechas';

export interface MoverTurnoData {
  paciente: string;
  desde: string;
  hasta: string;
  hora: string;
}

// Confirmación visual para mover un turno de día sin cambiar su horario.
@Component({
  selector: 'app-mover-turno-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title class="titulo">
      <mat-icon>swap_horiz</mat-icon>
      Mover turno
    </h2>

    <mat-dialog-content class="contenido">
      <p class="paciente">{{ data.paciente }}</p>

      <div class="movimiento">
        <div class="lado">
          <span class="rotulo">Desde</span>
          <b>{{ desde }}</b>
          <span class="hora">{{ data.hora }}</span>
        </div>

        <mat-icon class="flecha">arrow_forward</mat-icon>

        <div class="lado destino">
          <span class="rotulo">Hacia</span>
          <b>{{ hasta }}</b>
          <span class="hora">{{ data.hora }}</span>
        </div>
      </div>

      <p class="nota">
        <mat-icon>info</mat-icon>
        <span>
          Se mantiene el horario. Si el día está cerrado o el horario está ocupado, el turno no
          se mueve.
        </span>
      </p>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">Cancelar</button>
      <button mat-flat-button class="mover" [mat-dialog-close]="true">
        <mat-icon>swap_horiz</mat-icon>
        Mover turno
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
      .contenido {
        padding-top: 4px;
      }
      .paciente {
        margin: 0 0 12px;
        font-size: 15px;
        font-weight: 600;
        color: #111;
      }
      .movimiento {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 10px;
        padding: 14px;
        border: 1px solid #f1e9d2;
        border-radius: 14px;
        background: #fffdf8;
      }
      .lado {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }
      .destino {
        text-align: right;
      }
      .rotulo {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: #b36a00;
      }
      .lado b {
        font-size: 14px;
        color: #111;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .hora {
        align-self: flex-start;
        margin-top: 4px;
        padding: 2px 9px;
        border-radius: 10px;
        background: #fff5dc;
        color: #8a5a00;
        font-size: 12px;
        font-weight: 700;
      }
      .destino .hora {
        align-self: flex-end;
      }
      .flecha {
        color: #f28c00;
      }
      .nota {
        display: flex;
        align-items: flex-start;
        gap: 6px;
        margin: 12px 0 0;
        font-size: 12px;
        line-height: 1.4;
        color: #7a6a4a;
      }
      .nota mat-icon {
        flex: none;
        font-size: 16px;
        width: 16px;
        height: 16px;
        margin-top: 1px;
        color: #b36a00;
      }
      .mover {
        background: #f28c00;
        color: #111;
      }
      .mover mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      @media (max-width: 380px) {
        .movimiento {
          grid-template-columns: 1fr;
        }
        .flecha {
          transform: rotate(90deg);
          justify-self: center;
        }
        .destino {
          text-align: left;
        }
        .destino .hora {
          align-self: flex-start;
        }
      }
    `,
  ],
})
export class MoverTurnoDialog {
  data = inject<MoverTurnoData>(MAT_DIALOG_DATA);

  desde = etiquetaDiaMes(this.data.desde);
  hasta = etiquetaDiaMes(this.data.hasta);
}
