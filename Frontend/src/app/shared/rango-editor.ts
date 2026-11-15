import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RangoHorario } from '../models/models';

// Editor de rangos horarios reutilizable (plantilla semanal y excepción por día).
@Component({
  selector: 'app-rango-editor',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="rangos">
      @for (rango of rangos(); track $index) {
        <div class="rango">
          <input
            type="time"
            [value]="rango.horaInicio"
            (change)="actualizar($index, 'horaInicio', $event)"
            aria-label="Hora de inicio"
          />
          <span class="guion">a</span>
          <input
            type="time"
            [value]="rango.horaFin"
            (change)="actualizar($index, 'horaFin', $event)"
            aria-label="Hora de fin"
          />
          <select
            [value]="rango.duracionMinutos"
            (change)="cambiarDuracion($index, $event)"
            aria-label="Duración de cada turno"
          >
            <option value="30">30 min</option>
            <option value="45">45 min</option>
            <option value="60">60 min</option>
          </select>
          <button type="button" class="quitar" (click)="quitar($index)" aria-label="Quitar horario">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }

      <button type="button" class="agregar" (click)="agregar()">
        <mat-icon>add</mat-icon>
        Agregar horario
      </button>
    </div>
  `,
  styles: [
    `
      .rangos {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .rango {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #fffdf5;
        border: 1px solid #f1e9d2;
        border-radius: 12px;
        padding: 6px 8px;
        animation: aparecer 0.22s ease both;
      }
      input[type='time'] {
        flex: 1;
        min-width: 0;
        border: none;
        background: transparent;
        font: inherit;
        font-size: 14px;
        padding: 6px 2px;
        color: #111;
      }
      input[type='time']:focus-visible {
        outline: 2px solid #f9c900;
        border-radius: 8px;
      }
      select {
        border: 1px solid #f1e9d2;
        background: #fff;
        border-radius: 8px;
        padding: 6px;
        font: inherit;
        font-size: 13px;
        color: #444;
      }
      .guion {
        font-size: 12px;
        color: #999;
      }
      .quitar {
        border: none;
        background: transparent;
        color: #b0a58c;
        display: grid;
        place-items: center;
        padding: 2px;
        border-radius: 50%;
        cursor: pointer;
        transition: background 0.18s ease, color 0.18s ease;
      }
      .quitar:hover {
        background: #ffe9e9;
        color: #b3261e;
      }
      .quitar mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .agregar {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        align-self: flex-start;
        border: 1px dashed #e6c98a;
        background: #fffaf0;
        color: #a86800;
        border-radius: 10px;
        padding: 8px 12px;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.18s ease, transform 0.18s ease;
      }
      .agregar:hover {
        background: #fff3d6;
        transform: translateY(-1px);
      }
      .agregar mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      @media (max-width: 420px) {
        .rango {
          flex-wrap: wrap;
        }
        input[type='time'] {
          flex: 1 1 40%;
        }
        select {
          flex: 1;
        }
      }
    `,
  ],
})
export class RangoEditor {
  rangos = input.required<RangoHorario[]>();
  cambio = output<RangoHorario[]>();

  private emitir(rangos: RangoHorario[]) {
    this.cambio.emit(rangos.map((rango) => ({ ...rango })));
  }

  actualizar(indice: number, campo: 'horaInicio' | 'horaFin', evento: Event) {
    const valor = (evento.target as HTMLInputElement).value;
    if (!valor) return;
    this.emitir(this.rangos().map((rango, i) => (i === indice ? { ...rango, [campo]: valor } : rango)));
  }

  cambiarDuracion(indice: number, evento: Event) {
    const duracionMinutos = Number((evento.target as HTMLSelectElement).value) || 60;
    this.emitir(
      this.rangos().map((rango, i) => (i === indice ? { ...rango, duracionMinutos } : rango))
    );
  }

  quitar(indice: number) {
    this.emitir(this.rangos().filter((_, i) => i !== indice));
  }

  agregar() {
    const lista = this.rangos();
    const ultimo = lista.at(-1);
    const inicio = ultimo?.horaFin ?? '09:00';
    const fin = ultimo ? this.sumarHoras(ultimo.horaFin, 4) : '12:00';
    this.emitir([...lista, { horaInicio: inicio, horaFin: fin, duracionMinutos: 60 }]);
  }

  private sumarHoras(hora: string, horas: number) {
    const [h, m] = hora.split(':').map(Number);
    const total = Math.min(h * 60 + m + horas * 60, 23 * 60 + 30);
    return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
  }
}
