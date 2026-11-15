import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { DataStore } from '../../core/data.store';
import { mensajeDeError } from '../../core/api-client';
import { etiquetaDiaMes, hoyIso } from '../../core/fechas';
import { validarRangos } from '../../core/horarios';
import { ExcepcionDia, RangoHorario, RangoSemanal } from '../../models/models';
import { RangoEditor } from '../../shared/rango-editor';
import { HorariosDiaDialog } from '../agenda/horarios-dialog';
import { ConfirmacionDialog } from '../../shared/confirm-dialog';

const DIAS = [
  { numero: 1, nombre: 'Lunes' },
  { numero: 2, nombre: 'Martes' },
  { numero: 3, nombre: 'Miércoles' },
  { numero: 4, nombre: 'Jueves' },
  { numero: 5, nombre: 'Viernes' },
  { numero: 6, nombre: 'Sábado' },
  { numero: 7, nombre: 'Domingo' },
];

// Plantilla semanal: define los horarios que se repiten cada semana.
@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, MatExpansionModule, RangoEditor],
  template: `
    <a mat-button routerLink="/" class="back"><mat-icon>arrow_back</mat-icon> Volver</a>

    <header class="cab">
      <div>
        <h1>Horarios</h1>
        <p class="sub">Plantilla semanal de atención</p>
      </div>
      <button mat-stroked-button class="restaurar" (click)="restaurar()">
        <mat-icon>restart_alt</mat-icon>
        Restaurar sugerido
      </button>
    </header>

    <p class="ayuda">
      Estos horarios se repiten todas las semanas. Para cambiar un día puntual, usá
      <b>Horarios</b> desde la agenda.
    </p>

    @if (proximasExcepciones().length) {
      <div class="excepciones">
        <mat-icon>event_available</mat-icon>
        <div class="exc-txt">
          <b>Días con horario personalizado</b>
          <p>No siguen esta plantilla. Tocá un día para editarlo o volver a la plantilla.</p>
          <div class="exc-chips">
            @for (e of proximasExcepciones(); track e.fecha) {
              <button type="button" class="exc-chip" (click)="editarDia(e.fecha)">
                {{ etiquetaDiaMes(e.fecha) }}{{ e.cerrado ? ' · cerrado' : '' }}
              </button>
            }
          </div>
        </div>
      </div>
    }

    <mat-accordion multi class="acordeon">
      @for (d of dias; track d.numero) {
        <mat-expansion-panel class="panel" [class.cerrado]="!rangosDe(d.numero).length">
          <mat-expansion-panel-header>
            <mat-panel-title>{{ d.nombre }}</mat-panel-title>
            <mat-panel-description>{{ resumen(d.numero) }}</mat-panel-description>
          </mat-expansion-panel-header>

          <app-rango-editor [rangos]="rangosDe(d.numero)" (cambio)="actualizar(d.numero, $event)" />

          @if (!rangosDe(d.numero).length) {
            <p class="nota">Sin atención este día.</p>
          }
        </mat-expansion-panel>
      }
    </mat-accordion>

    <div class="barra">
      <button mat-flat-button class="guardar" [disabled]="guardando()" (click)="guardar()">
        Guardar horarios
      </button>
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
        margin: 22px 0 8px;
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
      .restaurar {
        border-color: #f1e9d2;
      }
      .restaurar mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
      .ayuda {
        font-size: 13px;
        color: #777;
        background: #fffaf0;
        border: 1px solid #f1e9d2;
        border-radius: 12px;
        padding: 10px 12px;
        margin: 8px 0 16px;
      }
      .excepciones {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        background: #fff5dc;
        border: 1px solid #f2d79a;
        border-radius: 14px;
        padding: 12px;
        margin: 0 0 16px;
        color: #7a4b00;
        animation: aparecer 0.25s ease both;
      }
      .excepciones mat-icon {
        color: #f28c00;
        flex: none;
      }
      .exc-txt {
        display: flex;
        flex-direction: column;
        gap: 4px;
        min-width: 0;
      }
      .exc-txt b {
        font-size: 14px;
      }
      .exc-txt p {
        margin: 0;
        font-size: 12px;
        color: #8a6a2a;
      }
      .exc-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
        margin-top: 4px;
      }
      .exc-chip {
        border: 1px solid #e6c98a;
        background: #fff;
        border-radius: 9px;
        padding: 5px 9px;
        font: inherit;
        font-size: 12px;
        font-weight: 600;
        color: #7a4b00;
        cursor: pointer;
        transition: background 0.18s ease;
      }
      .exc-chip:hover {
        background: #fff3d6;
      }
      .acordeon {
        display: block;
        margin-bottom: 90px;
      }
      .panel {
        margin-bottom: 8px;
        border-radius: 14px !important;
        box-shadow: none !important;
        border: 1px solid #f1e9d2;
        background: #fffdf8;
      }
      .panel.cerrado {
        background: #fbf7ec;
      }
      mat-panel-title {
        font-weight: 600;
        color: #111;
        flex: 0 0 110px;
      }
      mat-panel-description {
        color: #8a7c5f;
        font-size: 12px;
        justify-content: flex-start;
      }
      .nota {
        margin: 10px 0 0;
        font-size: 12px;
        color: #999;
      }
      .barra {
        position: sticky;
        bottom: 12px;
        display: flex;
        justify-content: flex-end;
        padding: 0;
        background: transparent;
        border: none;
        backdrop-filter: none;
        z-index: 5;
      }
      .guardar {
        background: #f28c00;
        color: #111;
      }
      @media (max-width: 600px) {
        h1 {
          font-size: 22px;
        }
        .cab {
          align-items: flex-start;
          flex-direction: column;
        }
        mat-panel-title {
          flex: 0 0 82px;
          font-size: 14px;
        }
        mat-panel-description {
          font-size: 11px;
        }
        .barra {
          bottom: 8px;
        }
        .guardar {
          width: 100%;
        }
      }
    `,
  ],
})
export class Horarios {
  private store = inject(DataStore);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  dias = DIAS;
  etiquetaDiaMes = etiquetaDiaMes;
  rangos = signal<RangoSemanal[]>([]);
  excepciones = signal<ExcepcionDia[]>([]);
  guardando = signal(false);
  private editado = false;
  private inicializado = false;

  // Solo los días por venir: los pasados ya no se editan desde acá.
  proximasExcepciones = computed(() =>
    this.excepciones()
      .filter((item) => item.fecha >= hoyIso())
      .sort((a, b) => a.fecha.localeCompare(b.fecha))
  );

  constructor() {
    effect(() => {
      const semanal = this.store.disponibilidad();
      if (this.store.ready() && !this.editado && !this.inicializado) {
        this.inicializado = true;
        this.rangos.set(semanal.map((rango) => ({ ...rango })));
      }
    });

    void this.cargarExcepciones();
  }

  private async cargarExcepciones() {
    try {
      this.excepciones.set(await this.store.listarExcepciones(hoyIso()));
    } catch {
      // Si falla, la plantilla sigue funcionando sin el aviso.
    }
  }

  editarDia(fecha: string) {
    this.dialog
      .open(HorariosDiaDialog, { data: { fecha }, width: '480px', maxWidth: '94vw' })
      .afterClosed()
      .subscribe((cambio) => {
        if (cambio) void this.cargarExcepciones();
      });
  }

  rangosDe(dia: number): RangoHorario[] {
    return this.rangos()
      .filter((rango) => rango.diaSemana === dia)
      .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
      .map((rango) => ({ ...rango }));
  }

  resumen(dia: number) {
    const rangos = this.rangosDe(dia);
    if (!rangos.length) return 'Cerrado';
    return rangos.map((rango) => `${rango.horaInicio}–${rango.horaFin}`).join(' · ');
  }

  actualizar(dia: number, lista: RangoHorario[]) {
    this.editado = true;
    this.rangos.update((actuales) => [
      ...actuales.filter((rango) => rango.diaSemana !== dia),
      ...lista.map((rango) => ({ ...rango, diaSemana: dia })),
    ]);
  }

  async restaurar() {
    const confirmar = await firstValueFrom(
      this.dialog
        .open(ConfirmacionDialog, {
          data: {
            titulo: 'Restaurar horarios sugeridos',
            mensaje: '¿Restaurar los horarios sugeridos?',
            detalle: 'Se reemplaza la plantilla actual.',
            botonTexto: 'Restaurar',
            icono: 'restart_alt',
            iconoBoton: 'restart_alt',
            peligro: false,
          },
          width: '420px',
          maxWidth: '94vw',
          autoFocus: false,
        })
        .afterClosed()
    );
    if (!confirmar) return;

    this.editado = true;
    const sugeridos: RangoSemanal[] = [];
    for (let dia = 1; dia <= 5; dia += 1) {
      sugeridos.push({ diaSemana: dia, horaInicio: '08:00', horaFin: '12:00', duracionMinutos: 60 });
      sugeridos.push({ diaSemana: dia, horaInicio: '16:00', horaFin: '20:00', duracionMinutos: 60 });
    }
    this.rangos.set(sugeridos);
  }

  async guardar() {
    if (this.guardando()) return;

    for (const dia of this.dias) {
      const error = validarRangos(this.rangosDe(dia.numero));
      if (error && this.rangosDe(dia.numero).length) {
        this.snack.open(`${dia.nombre}: ${error}`, 'OK', { duration: 4000 });
        return;
      }
    }

    this.guardando.set(true);
    try {
      const ordenados = [...this.rangos()]
        .map(({ diaSemana, horaInicio, horaFin, duracionMinutos }) => ({
          diaSemana,
          horaInicio,
          horaFin,
          duracionMinutos,
        }))
        .sort((a, b) => a.diaSemana - b.diaSemana || a.horaInicio.localeCompare(b.horaInicio));
      const guardada = await this.store.guardarSemanal(ordenados);
      this.rangos.set(guardada.map((rango) => ({ ...rango })));
      this.editado = false;
      const personalizados = this.proximasExcepciones().length;
      this.snack.open(
        personalizados
          ? `Horarios guardados. ${personalizados} día(s) con horario personalizado no cambian.`
          : 'Horarios guardados',
        'OK',
        { duration: personalizados ? 4200 : 2200 }
      );
    } catch (err) {
      this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
    } finally {
      this.guardando.set(false);
    }
  }
}
