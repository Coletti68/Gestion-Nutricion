import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataStore } from '../../core/data.store';
import { etiquetaLarga, hoyIso } from '../../core/fechas';
import { EstadoTurno, Turno } from '../../models/models';

// Consulta de días pasados: filtros por fecha y estado.
@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <a mat-button routerLink="/" class="back"><mat-icon>arrow_back</mat-icon> Volver</a>

    <header class="cab">
      <h1>Historial</h1>
      <p class="sub">Turnos pasados, atendidos y cancelados</p>
    </header>

    <div class="filtros">
      <label class="campo">
        <span>Desde</span>
        <input type="date" [value]="desde()" (change)="desde.set(valor($event))" />
      </label>
      <label class="campo">
        <span>Hasta</span>
        <input type="date" [value]="hasta()" (change)="hasta.set(valor($event))" />
      </label>

      <label class="campo estado">
        <span>Estado</span>
        <div class="select-wrap">
          <select [value]="estado()" (change)="cambiarEstado($event)">
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="Confirmado">Confirmado</option>
            <option value="Realizado">Realizado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
          <mat-icon>expand_more</mat-icon>
        </div>
      </label>

      <button mat-stroked-button class="limpiar" (click)="limpiar()">Limpiar</button>
    </div>

    <p class="resumen">{{ total() }} turno{{ total() === 1 ? '' : 's' }}</p>

    @for (grupo of grupos(); track grupo.fecha) {
      <section class="grupo">
        <h2>{{ etiquetaLarga(grupo.fecha) }} <small>{{ grupo.fecha.slice(0, 4) }}</small></h2>

        @for (t of grupo.turnos; track t.id; let i = $index) {
          <article
            class="item"
            [style.animation-delay.ms]="i * 30"
            [class.hecho]="t.estado === 'Realizado'"
            [class.cancelado]="t.estado === 'Cancelado'"
          >
            <div class="hora">{{ t.hora }}<small>{{ t.duracionMinutos }}′</small></div>
            <div class="info">
              <a [routerLink]="['/clientes', t.pacienteId]">{{ nombre(t.pacienteId) }}</a>
              <span>{{ t.motivo }}</span>
            </div>
            <span class="chip" [ngClass]="t.estado.toLowerCase()">{{ t.estado }}</span>
            @if (t.reprogramado) {
              <span class="chip reprog" title="Se cambió la fecha u hora">Reprogramado</span>
            }
          </article>
        }
      </section>
    } @empty {
      <p class="vacio">No hay turnos en ese rango de fechas.</p>
    }
  `,
  styles: [
    `
      .back {
        margin: 16px 0 0;
      }
      .cab {
        margin: 22px 0 14px;
      }
      h1 {
        margin: 0;
        font-size: 26px;
      }
      .sub {
        margin: 2px 0 0;
        color: #888;
        font-size: 13px;
      }
      .filtros {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        align-items: end;
        gap: 10px;
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid #f1e9d2;
        border-radius: 16px;
        padding: 12px;
      }
      .campo {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 2px;
        height: 48px;
        box-sizing: border-box;
        background: #fffdf5;
        border: 1px solid #f1e9d2;
        border-radius: 10px;
        padding: 6px 10px;
      }
      .campo span {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        color: #b36a00;
      }
      .campo input,
      .campo select {
        border: none;
        background: transparent;
        font: inherit;
        font-size: 14px;
        color: #111;
        padding: 2px 0;
        line-height: 1.3;
        min-width: 0;
      }
      .campo select {
        cursor: pointer;
      }
      .select-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .select-wrap select {
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        width: 100%;
        padding: 2px 24px 2px 0;
        font-weight: 600;
        cursor: pointer;
      }
      .select-wrap mat-icon {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
        font-size: 20px;
        width: 20px;
        height: 20px;
        color: #b36a00;
      }
      .campo:focus-within {
        border-color: #f9c900;
        background: #fff;
      }
      .limpiar {
        border-color: #f1e9d2;
        height: 48px;
      }
      .resumen {
        font-size: 12px;
        color: #999;
        margin: 14px 4px 8px;
      }
      .grupo {
        margin-bottom: 18px;
      }
      .grupo h2 {
        font-size: 14px;
        margin: 0 0 8px;
        color: #111;
        text-transform: capitalize;
      }
      .grupo h2 small {
        font-size: 11px;
        color: #aaa;
        font-weight: 400;
        margin-left: 4px;
      }
      .item {
        display: flex;
        align-items: center;
        gap: 10px;
        background: #fff;
        border-radius: 12px;
        padding: 10px 12px;
        margin-bottom: 6px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        animation: aparecer 0.26s ease both;
        transition: transform 0.18s ease, box-shadow 0.18s ease;
      }
      .item:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(242, 140, 0, 0.12);
      }
      .hora {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 13px;
        font-weight: 700;
        min-width: 48px;
        line-height: 1.1;
      }
      .hora small {
        font-size: 9px;
        color: #a99b7d;
        font-weight: 600;
      }
      .info {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
      }
      .info a {
        font-size: 14px;
        font-weight: 600;
        color: #111;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .info a:hover {
        color: #b36a00;
      }
      .info span {
        font-size: 12px;
        color: #888;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .hecho .info a,
      .hecho .info span {
        opacity: 0.6;
      }
      .cancelado {
        opacity: 0.65;
      }
      .chip {
        font-size: 10px;
        padding: 3px 8px;
        border-radius: 10px;
        white-space: nowrap;
        background: #f1f1f1;
        color: #333;
      }
      .chip.confirmado {
        background: #f9c900;
        color: #111;
      }
      .chip.pendiente {
        background: #f4e65a55;
        color: #7a5b00;
      }
      .chip.realizado {
        background: #d9f2d0;
        color: #2c6b1f;
      }
      .chip.cancelado {
        background: #ffd9d9;
        color: #8a1f1f;
      }
      .chip.reprog {
        background: #e6f0ff;
        color: #1f4b8a;
      }
      .vacio {
        color: #999;
        font-size: 14px;
        padding: 20px 4px;
      }
      @media (max-width: 600px) {
        h1 {
          font-size: 22px;
        }
        .filtros {
          grid-template-columns: 1fr 1fr;
        }
        .estado {
          grid-column: 1 / -1;
        }
        .limpiar {
          grid-column: 1 / -1;
        }
        .item {
          flex-wrap: wrap;
        }
      }
    `,
  ],
})
export class Historial {
  private store = inject(DataStore);

  desde = signal('');
  hasta = signal(hoyIso());
  estado = signal<'' | EstadoTurno>('');

  etiquetaLarga = etiquetaLarga;

  filtrados = computed(() => {
    const desde = this.desde();
    const hasta = this.hasta();
    const estado = this.estado();

    return this.store
      .turnos()
      .filter(
        (turno) =>
          (!desde || turno.fecha >= desde) &&
          (!hasta || turno.fecha <= hasta) &&
          (!estado || turno.estado === estado)
      )
      .sort((a, b) => (b.fecha + b.hora).localeCompare(a.fecha + a.hora));
  });

  grupos = computed(() => {
    const mapa = new Map<string, Turno[]>();
    for (const turno of this.filtrados()) {
      const lista = mapa.get(turno.fecha) ?? [];
      lista.push(turno);
      mapa.set(turno.fecha, lista);
    }
    return [...mapa.entries()].map(([fecha, turnos]) => ({
      fecha,
      turnos: turnos.sort((a, b) => a.hora.localeCompare(b.hora)),
    }));
  });

  total = computed(() => this.filtrados().length);

  nombre(id: number) {
    return this.store.nombrePaciente(id);
  }

  valor(evento: Event) {
    return (evento.target as HTMLInputElement | HTMLSelectElement).value;
  }

  cambiarEstado(evento: Event) {
    this.estado.set(this.valor(evento) as '' | EstadoTurno);
  }

  limpiar() {
    this.desde.set('');
    this.hasta.set('');
    this.estado.set('');
  }
}
