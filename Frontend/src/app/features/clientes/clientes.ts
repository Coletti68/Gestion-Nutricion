import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataStore } from '../../core/data.store';
import { Paciente } from '../../models/models';
import { PacienteDialog } from './paciente-dialog';

// Listado de clientes: buscador, tarjetas y alta en diálogo (sin formulario fijo).
@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatButtonModule, MatIconModule],
  template: `
    <a mat-button routerLink="/" class="back"><mat-icon>arrow_back</mat-icon> Volver</a>

    <header class="cab">
      <div>
        <h1>Clientes</h1>
        <p class="sub">{{ pacientes().length }} paciente{{ pacientes().length === 1 ? '' : 's' }}</p>
      </div>
      <button mat-flat-button class="nuevo" (click)="abrirNuevo()">
        <mat-icon>person_add</mat-icon>
        Nuevo paciente
      </button>
    </header>

    <div class="buscador">
      <mat-icon>search</mat-icon>
      <input
        [ngModel]="filtro()"
        (ngModelChange)="filtro.set($event)"
        placeholder="Buscar por nombre u objetivo"
        aria-label="Buscar paciente"
      />
      @if (filtro()) {
        <button class="limpiar" (click)="filtro.set('')" aria-label="Limpiar búsqueda">
          <mat-icon>close</mat-icon>
        </button>
      }
    </div>

    <div class="grilla">
      @for (p of filtrados(); track p.id; let i = $index) {
        <a class="card" [routerLink]="['/clientes', p.id]" [style.animation-delay.ms]="i * 30">
          <span class="avatar">{{ iniciales(p.nombre) }}</span>
          <div class="info">
            <b>{{ p.nombre }}</b>
            <span>{{ p.objetivo || 'Sin objetivo definido' }}</span>
            <small>
              {{ p.consultas.length }} consulta{{ p.consultas.length === 1 ? '' : 's' }} · Último peso:
              {{ ultimoPeso(p) }} kg
            </small>
          </div>
          <mat-icon class="flecha">chevron_right</mat-icon>
        </a>
      } @empty {
        <div class="vacio">
          <mat-icon>search_off</mat-icon>
          <p>{{ filtro() ? 'No hay pacientes que coincidan.' : 'Todavía no hay pacientes cargados.' }}</p>
          <button mat-stroked-button (click)="abrirNuevo()">Cargar el primero</button>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .back {
        margin: 16px 0 0;
      }
      .cab {
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
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
      .nuevo {
        background: #f28c00;
        color: #111;
      }
      .nuevo mat-icon {
        font-size: 19px;
        width: 19px;
        height: 19px;
      }
      .buscador {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #fff;
        border: 1px solid #f1e9d2;
        border-radius: 14px;
        padding: 4px 8px 4px 12px;
        margin-bottom: 14px;
        transition: border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .buscador:focus-within {
        border-color: #f9c900;
        box-shadow: 0 0 0 3px #f9c90033;
      }
      .buscador mat-icon {
        color: #b0a58c;
      }
      .buscador input {
        flex: 1;
        min-width: 0;
        border: none;
        background: transparent;
        font: inherit;
        font-size: 15px;
        padding: 10px 0;
      }
      .buscador input:focus-visible {
        outline: none;
      }
      .limpiar {
        border: none;
        background: transparent;
        color: #b0a58c;
        cursor: pointer;
        display: grid;
        place-items: center;
        padding: 4px;
        border-radius: 50%;
      }
      .limpiar:hover {
        background: #f7f1e0;
      }
      .grilla {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        gap: 10px;
        padding-bottom: 90px;
      }
      .card {
        display: flex;
        align-items: center;
        gap: 12px;
        background: #fff;
        border: 1px solid #f1e9d2;
        border-radius: 14px;
        padding: 12px;
        text-decoration: none;
        color: #111;
        animation: aparecer 0.28s ease both;
        transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
      }
      .card:hover {
        transform: translateY(-2px);
        border-color: #f9c900;
        box-shadow: 0 8px 20px rgba(242, 140, 0, 0.14);
      }
      .avatar {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        background: #f9c900;
        color: #111;
        display: grid;
        place-items: center;
        font-size: 14px;
        font-weight: 700;
        flex: none;
      }
      .info {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
        flex: 1;
      }
      .info b {
        font-size: 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .info span {
        font-size: 12px;
        color: #8a7c5f;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .info small {
        font-size: 11px;
        color: #aaa;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .flecha {
        color: #d6c9a8;
        flex: none;
      }
      .vacio {
        grid-column: 1 / -1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        text-align: center;
        padding: 40px 16px;
        color: #999;
        background: #fffdf8;
        border: 1px dashed #e6c98a;
        border-radius: 16px;
      }
      .vacio mat-icon {
        color: #e0c98a;
        font-size: 32px;
        width: 32px;
        height: 32px;
      }
      .vacio p {
        margin: 0;
        font-size: 14px;
      }
      @media (max-width: 600px) {
        h1 {
          font-size: 22px;
        }
        .cab {
          align-items: flex-start;
        }
        .nuevo {
          padding: 0 12px;
          font-size: 13px;
        }
        .grilla {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class Clientes {
  private store = inject(DataStore);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  pacientes = this.store.pacientes;
  filtro = signal('');

  filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.pacientes();
    return this.pacientes().filter(
      (p) =>
        p.nombre.toLowerCase().includes(texto) ||
        (p.objetivo ?? '').toLowerCase().includes(texto)
    );
  });

  ultimoPeso(p: Paciente) {
    return p.consultas.at(-1)?.peso ?? p.pesoInicial ?? '—';
  }

  iniciales(nombre: string) {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join('');
  }

  abrirNuevo() {
    this.dialog
      .open(PacienteDialog, { width: '560px', maxWidth: '94vw' })
      .afterClosed()
      .subscribe((paciente: Paciente | undefined) => {
        if (paciente) this.snack.open('Paciente creado', 'OK', { duration: 2200 });
      });
  }
}
