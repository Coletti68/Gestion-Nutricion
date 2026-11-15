import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DataStore } from '../../core/data.store';
import { mensajeDeError } from '../../core/api-client';
import {
  DIAS_CORTOS,
  MESES_CORTOS,
  esHoy as esFechaHoy,
  etiquetaDiaMes,
  etiquetaLarga,
  fechaLocal,
  hoyIso,
  sumarDias
} from '../../core/fechas';
import { DiaConSlots, Paciente, Slot, Turno } from '../../models/models';
import { AppointmentDialog, FinalizeDialog, ResultadoTurno } from './appointment-dialogs';
import { HorariosDiaDialog } from './horarios-dialog';
import { MoverTurnoDialog } from './mover-turno-dialog';
import { ConfirmacionDialog } from '../../shared/confirm-dialog';
import { PacienteDialog } from '../clientes/paciente-dialog';

// Agenda: hoy primero, un día a la vez en mobile y grilla de 7 días en desktop.
@Component({
  selector: 'app-agenda',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <header class="hero">
      <div class="hero-txt">
        <p class="brand">lau.micelli.nutricion</p>
        <h1>{{ titulo() }}</h1>
      </div>

      <div class="nav">
        <button mat-icon-button (click)="moverVentana(-1)" aria-label="Semana anterior">
          <mat-icon>chevron_left</mat-icon>
        </button>
        <button mat-stroked-button class="hoy-btn" [class.activo]="esHoySeleccionado()" (click)="irHoy()">
          Hoy
        </button>
        <button mat-icon-button (click)="moverVentana(1)" aria-label="Semana siguiente">
          <mat-icon>chevron_right</mat-icon>
        </button>
        <label
          class="cal"
          role="button"
          tabindex="0"
          aria-label="Elegir fecha"
          (keydown.enter)="abrirCalendario(picker)"
          (keydown.space)="abrirCalendario(picker); $event.preventDefault()"
        >
          <mat-icon>calendar_month</mat-icon>
          <input
            #picker
            type="date"
            class="picker"
            [value]="seleccionado()"
            (change)="irAFecha(picker.value)"
            tabindex="-1"
            aria-hidden="true"
          />
        </label>
      </div>
    </header>

    @if (recordatorio()) {
      <div class="aviso">
        <mat-icon>notifications_active</mat-icon>
        <span>{{ recordatorio() }}</span>
      </div>
    }

    @if (mobile()) {
      <div class="tira">
        @for (d of dias(); track d.fecha) {
          <button
            class="dia-chip"
            [class.sel]="d.fecha === seleccionado()"
            [class.hoy]="d.hoy"
            (click)="seleccionar(d.fecha)"
          >
            <span class="dow">{{ d.dow }}</span>
            <span class="num">{{ d.num }}</span>
            <span class="mes">{{ d.mes }}</span>
            @if (d.cantidad) {
              <span class="punto">{{ d.cantidad }}</span>
            }
          </button>
        }
      </div>

      <section class="panel">
        <div class="panel-head">
          <h2>{{ etiquetaDiaMes(seleccionado()) }}</h2>
          <button mat-button class="link" (click)="editarHorarios()">
            <mat-icon>schedule</mat-icon>
            Horarios
          </button>
        </div>

        @if (dia()?.esExcepcion) {
          <div class="exc-aviso">
            <mat-icon>event_available</mat-icon>
            <div class="exc-texto">
              <b>Horario personalizado</b>
              <span>Este día no usa la plantilla semanal.</span>
            </div>
            <div class="exc-acciones">
              <button mat-button (click)="editarHorarios()">Editar</button>
              <button mat-button (click)="volverPlantilla()">Volver a plantilla</button>
            </div>
          </div>
        }

        @if (cargandoDia()) {
          <p class="vacio">Cargando horarios…</p>
        } @else if (dia()?.cerrado) {
          <div class="sin-dia">
            <mat-icon>event_busy</mat-icon>
            <span>Día cerrado</span>
            <button mat-button (click)="editarHorarios()">Abrir horarios</button>
          </div>
        } @else if (!dia()?.slots?.length) {
          <div class="sin-dia">
            <mat-icon>schedule</mat-icon>
            <span>Sin horarios configurados</span>
            <button mat-button (click)="editarHorarios()">Configurar</button>
          </div>
        } @else {
          <p class="mini-label">Horarios</p>
          <div class="slots-dia">
            @for (slot of dia()!.slots; track slot.hora) {
              <button
                class="slot-chip"
                [class.ocupado]="!slot.disponible"
                [disabled]="!slot.disponible"
                (click)="nuevoTurno(slot)"
                [attr.aria-label]="'Agendar turno a las ' + slot.hora"
              >
                {{ slot.hora }}
                @if (slot.disponible) {
                  <mat-icon>add</mat-icon>
                }
              </button>
            }
          </div>
        }

        <p class="mini-label">Turnos del día</p>
        <div
          class="lista"
          cdkDropList
          [cdkDropListData]="{ fecha: seleccionado(), turnos: turnosDia() }"
          (cdkDropListDropped)="soltar($event)"
        >
          @for (t of turnosDia(); track t.id; let i = $index) {
            <article
              class="turno"
              cdkDrag
              [cdkDragData]="t"
              [cdkDragStartDelay]="{ mouse: 0, touch: 180 }"
              [style.animation-delay.ms]="i * 35"
              [class.hecho]="t.estado === 'Realizado'"
              [class.cancelado]="t.estado === 'Cancelado'"
            >
              <div class="hora">
                {{ t.hora }}
                <small>{{ t.duracionMinutos }}′</small>
              </div>
              <div class="info">
                <b>{{ nombre(t.pacienteId) }}</b>
                <span>{{ t.motivo }}</span>
              </div>
              <span class="chip" [ngClass]="t.estado.toLowerCase()">{{ t.estado }}</span>
              <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Acciones">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="confirmar(t)"><mat-icon>check_circle</mat-icon> Confirmar</button>
                <button mat-menu-item (click)="finalizar(t)"><mat-icon>task_alt</mat-icon> Finalizar</button>
                <button mat-menu-item (click)="editar(t)"><mat-icon>edit</mat-icon> Editar / reprogramar</button>
                <button mat-menu-item (click)="cancelar(t)"><mat-icon>block</mat-icon> Cancelar</button>
                <button mat-menu-item (click)="eliminar(t)"><mat-icon>delete</mat-icon> Eliminar</button>
              </mat-menu>
            </article>
          } @empty {
            <p class="vacio">Sin turnos agendados. Tocá un horario libre para agendar.</p>
          }
        </div>
      </section>
    } @else {
      <div class="semana" cdkDropListGroup>
        @for (d of dias(); track d.fecha) {
          <section
            class="col"
            cdkDropList
            [cdkDropListData]="{ fecha: d.fecha, turnos: d.turnos }"
            (cdkDropListDropped)="soltar($event)"
            [class.hoy]="d.hoy"
          >
            <header class="col-head">
              <span class="dow">{{ d.dow }}</span>
              <span class="num">{{ d.num }}</span>
              <span class="mes">{{ d.mes }}</span>
              <button class="col-horarios" (click)="editarHorariosDe(d.fecha)" aria-label="Horarios del día">
                <mat-icon>schedule</mat-icon>
              </button>
              @if (d.cantidad) {
                <span class="cant">{{ d.cantidad }}</span>
              }
            </header>

            @if (esExcepcion(d.fecha)) {
              <button class="col-exc" (click)="editarHorariosDe(d.fecha)">Personalizado</button>
            }

            <button class="col-add" (click)="nuevoTurnoEn(d.fecha)">
              <mat-icon>add</mat-icon>
              Turno
            </button>

            @for (t of d.turnos; track t.id; let i = $index) {
              <article
                class="turno compacto"
                cdkDrag
                [cdkDragData]="t"
                [cdkDragStartDelay]="{ mouse: 0, touch: 180 }"
                [style.animation-delay.ms]="i * 35"
                [class.hecho]="t.estado === 'Realizado'"
                [class.cancelado]="t.estado === 'Cancelado'"
              >
                <div class="hora">{{ t.hora }}</div>
                <div class="info">
                  <b>{{ nombre(t.pacienteId) }}</b>
                  <span>{{ t.motivo }}</span>
                </div>
                <span class="chip" [ngClass]="t.estado.toLowerCase()">{{ t.estado }}</span>
                <button mat-icon-button [matMenuTriggerFor]="menuDesk" aria-label="Acciones">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #menuDesk="matMenu">
                  <button mat-menu-item (click)="confirmar(t)"><mat-icon>check_circle</mat-icon> Confirmar</button>
                  <button mat-menu-item (click)="finalizar(t)"><mat-icon>task_alt</mat-icon> Finalizar</button>
                  <button mat-menu-item (click)="editar(t)"><mat-icon>edit</mat-icon> Editar / reprogramar</button>
                  <button mat-menu-item (click)="cancelar(t)"><mat-icon>block</mat-icon> Cancelar</button>
                  <button mat-menu-item (click)="eliminar(t)"><mat-icon>delete</mat-icon> Eliminar</button>
                </mat-menu>
              </article>
            } @empty {
              <p class="vacio">—</p>
            }
          </section>
        }
      </div>
    }

    @if (fabAbierto()) {
      <div class="fab-fondo" (click)="fabAbierto.set(false)"></div>
    }

    <div class="fab-wrap">
      @if (fabAbierto()) {
        <button class="fab-accion paciente" (click)="nuevoPaciente()">
          <mat-icon>person_add</mat-icon>
          <span>Paciente</span>
        </button>
        <button class="fab-accion turno" (click)="nuevoTurno()">
          <mat-icon>edit_calendar</mat-icon>
          <span>Turno</span>
        </button>
      }
      <button
        class="fab-principal"
        [class.abierto]="fabAbierto()"
        (click)="fabAbierto.set(!fabAbierto())"
        [attr.aria-label]="fabAbierto() ? 'Cerrar acciones' : 'Nuevo turno o paciente'"
      >
        <mat-icon [class.girar]="fabAbierto()">{{ fabAbierto() ? 'close' : 'add' }}</mat-icon>
        <span>Nuevo</span>
      </button>
    </div>
  `,
  styles: [
    `
      .hero {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
        gap: 16px;
        flex-wrap: wrap;
        margin: 20px 0 12px;
      }
      .brand {
        margin: 0;
        font-size: 12px;
        letter-spacing: 0.09em;
        color: #f28c00;
        font-weight: 700;
        text-transform: uppercase;
      }
      h1 {
        margin: 2px 0 0;
        font-size: 26px;
        color: #111;
        text-transform: capitalize;
      }
      .nav {
        display: flex;
        align-items: center;
        gap: 2px;
        position: relative;
      }
      .hoy-btn {
        min-width: 62px;
        border-color: #f1e9d2;
        transition: background 0.2s ease, border-color 0.2s ease;
      }
      .hoy-btn.activo {
        background: #f4e65a;
        border-color: #f4e65a;
      }
      .picker {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        border: 0;
        padding: 0;
        pointer-events: none;
      }
      .cal {
        position: relative;
        display: inline-grid;
        place-items: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        color: rgba(0, 0, 0, 0.54);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
        transition: background 0.18s ease, color 0.18s ease;
      }
      .cal:hover,
      .cal:focus-visible {
        background: rgba(0, 0, 0, 0.05);
        color: #111;
        outline: none;
      }
      .cal mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
      .aviso {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #f4e65a;
        color: #111;
        border-radius: 12px;
        padding: 10px 14px;
        margin-bottom: 14px;
        font-size: 14px;
        animation: aparecer 0.3s ease both;
      }
      .aviso mat-icon {
        color: #f28c00;
      }
      .tira {
        display: flex;
        gap: 6px;
        overflow-x: auto;
        padding: 10px 6px 10px;
        scrollbar-width: none;
      }
      .tira::-webkit-scrollbar {
        display: none;
      }
      .dia-chip {
        position: relative;
        flex: 1 0 46px;
        min-width: 46px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1px;
        border: 1px solid transparent;
        background: #ffffffb8;
        border-radius: 14px;
        padding: 16px 4px 9px;
        font: inherit;
        color: #111;
        cursor: pointer;
        transition: background 0.2s ease, transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
      }
      .dia-chip .dow {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.04em;
        color: #b36a00;
        text-transform: uppercase;
      }
      .dia-chip .num {
        font-size: 18px;
        font-weight: 700;
        line-height: 1.1;
      }
      .dia-chip .mes {
        font-size: 10px;
        color: #999;
      }
      .dia-chip:hover {
        background: #fff5dc;
        transform: translateY(-1px);
      }
      .dia-chip.hoy {
        border-color: #f9c900;
      }
      .dia-chip.sel {
        background: #f28c00;
        border-color: #f28c00;
        box-shadow: 0 6px 16px rgba(242, 140, 0, 0.28);
      }
      .dia-chip.sel .dow,
      .dia-chip.sel .mes {
        color: #3d2600;
      }
      .punto {
        position: absolute;
        top: -8px;
        right: -5px;
        box-sizing: border-box;
        min-width: 16px;
        height: 16px;
        padding: 0 4px;
        border-radius: 9px;
        background: #f9c900;
        color: #111;
        font-size: 10px;
        font-weight: 700;
        line-height: 1;
        display: grid;
        place-items: center;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.22);
      }
      .dia-chip.sel .punto {
        background: #fff;
      }
      .panel {
        background: rgba(255, 255, 255, 0.78);
        border-radius: 18px;
        padding: 14px;
        margin-bottom: 100px;
        animation: aparecer 0.25s ease both;
      }
      .panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .panel-head h2 {
        margin: 0;
        font-size: 18px;
        text-transform: capitalize;
      }
      .link {
        color: #b36a00;
        font-size: 13px;
      }
      .link mat-icon {
        font-size: 17px;
        width: 17px;
        height: 17px;
      }
      .exc-aviso {
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
      .exc-aviso mat-icon {
        color: #f28c00;
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      .exc-texto {
        display: flex;
        flex-direction: column;
        min-width: 0;
      }
      .exc-texto b {
        font-size: 13px;
      }
      .exc-texto span {
        font-size: 12px;
        color: #8a6a2a;
      }
      .exc-acciones {
        margin-left: auto;
        display: flex;
        gap: 2px;
        flex-wrap: wrap;
      }
      .exc-acciones .mat-mdc-button {
        font-size: 12px;
        padding: 0 8px;
        min-width: 0;
      }
      .mini-label {
        margin: 14px 0 8px;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.07em;
        text-transform: uppercase;
        color: #b36a00;
      }
      .slots-dia {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      .slot-chip {
        display: inline-flex;
        align-items: center;
        gap: 2px;
        border: 1px solid #f1e9d2;
        background: #fff;
        color: #111;
        border-radius: 10px;
        padding: 7px 9px;
        font: inherit;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.16s ease, transform 0.16s ease, border-color 0.16s ease;
      }
      .slot-chip mat-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
        color: #f28c00;
      }
      .slot-chip:hover:not(:disabled) {
        background: #fff5dc;
        border-color: #f9c900;
        transform: translateY(-1px);
      }
      .slot-chip.ocupado {
        opacity: 0.4;
        text-decoration: line-through;
        background: #f7f3e8;
        cursor: not-allowed;
      }
      .lista {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .turno {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #fff;
        border-radius: 13px;
        padding: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        animation: aparecer 0.28s ease both;
        transition: box-shadow 0.2s ease, transform 0.2s ease;
      }
      .turno:hover {
        box-shadow: 0 6px 18px rgba(242, 140, 0, 0.12);
        transform: translateY(-1px);
      }
      .turno {
        cursor: grab;
      }
      .turno:active {
        cursor: grabbing;
      }
      .turno.cdk-drag-dragging {
        transform: none;
      }
      .cdk-drag-preview {
        border-radius: 13px;
        background: #fff;
        box-shadow: 0 12px 28px rgba(0, 0, 0, 0.18);
      }
      .cdk-drag-placeholder {
        opacity: 0.35;
      }
      .cdk-drag-animating {
        transition: transform 220ms cubic-bezier(0, 0, 0.2, 1);
      }
      .col.cdk-drop-list-dragging,
      .lista.cdk-drop-list-dragging {
        background: #fffaf0;
      }
      .col.cdk-drop-list-receiving {
        background: #fff5dc;
        outline: 2px dashed #f9c900;
      }
      .hora {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 13px;
        font-weight: 700;
        color: #111;
        min-width: 46px;
        line-height: 1.1;
      }
      .hora small {
        font-size: 9px;
        font-weight: 600;
        color: #a99b7d;
      }
      .info {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-width: 0;
      }
      .info b {
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .info span {
        font-size: 12px;
        color: #777;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .hecho .info b,
      .hecho .info span {
        text-decoration: line-through;
        opacity: 0.55;
      }
      .cancelado {
        opacity: 0.55;
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
      .vacio {
        color: #aaa;
        font-size: 13px;
        padding: 8px 4px;
        margin: 0;
      }
      .sin-dia {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        background: #fffaf0;
        border: 1px dashed #e6c98a;
        border-radius: 12px;
        padding: 10px 12px;
        color: #7a4b00;
        font-size: 14px;
      }
      .sin-dia mat-icon {
        color: #f28c00;
      }
      .semana {
        display: grid;
        grid-template-columns: repeat(7, minmax(0, 1fr));
        gap: 10px;
        padding-bottom: 90px;
      }
      .col {
        background: rgba(255, 255, 255, 0.7);
        border-radius: 14px;
        padding: 8px;
        min-height: 120px;
        transition: background 0.2s ease;
      }
      .col.hoy {
        background: #fffdf0;
        outline: 2px solid #f9c900;
      }
      .col-head {
        display: flex;
        align-items: baseline;
        gap: 4px;
        padding: 2px 4px 8px;
        border-bottom: 1px solid #f1e9d2;
        margin-bottom: 8px;
      }
      .col-head .dow {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        color: #f28c00;
        letter-spacing: 0.05em;
      }
      .col-head .num {
        font-size: 18px;
        font-weight: 700;
      }
      .col-head .mes {
        font-size: 11px;
        color: #999;
      }
      .cant {
        margin-left: 4px;
        background: #f4e65a;
        border-radius: 9px;
        font-size: 10px;
        padding: 1px 6px;
        font-weight: 700;
      }
      .col-horarios {
        margin-left: auto;
        border: none;
        background: transparent;
        color: #c3b48f;
        display: grid;
        place-items: center;
        width: 20px;
        height: 20px;
        padding: 0;
        border-radius: 50%;
        cursor: pointer;
        transition: color 0.18s ease, background 0.18s ease;
      }
      .col-horarios:hover {
        color: #f28c00;
        background: #fff5dc;
      }
      .col-horarios mat-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }
      .col-add {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 2px;
        border: 1px dashed #e6c98a;
        background: transparent;
        color: #a86800;
        border-radius: 9px;
        padding: 5px;
        margin-bottom: 8px;
        font: inherit;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
        transition: background 0.18s ease;
      }
      .col-exc {
        width: 100%;
        border: none;
        background: #fff5dc;
        color: #a86800;
        border-radius: 8px;
        padding: 3px 4px;
        margin-bottom: 6px;
        font: inherit;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        cursor: pointer;
        transition: background 0.18s ease;
      }
      .col-exc:hover {
        background: #ffe9b8;
      }
      .col-add:hover {
        background: #fff5dc;
      }
      .col-add mat-icon {
        font-size: 15px;
        width: 15px;
        height: 15px;
      }
      .compacto {
        padding: 7px;
        gap: 5px;
        flex-wrap: wrap;
      }
      .compacto .chip {
        display: none;
      }
      .compacto .info {
        flex-basis: 100%;
        order: 3;
      }
      .fab-fondo {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.18);
        backdrop-filter: blur(1px);
        z-index: 19;
        animation: aparecer 0.2s ease both;
      }
      .fab-wrap {
        position: fixed;
        right: 18px;
        bottom: 22px;
        z-index: 20;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
      }
      .fab-principal {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        border: none;
        border-radius: 30px;
        padding: 14px 20px 14px 16px;
        background: #f28c00;
        color: #111;
        font: inherit;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 8px 22px rgba(242, 140, 0, 0.36);
        transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.22s ease,
          background 0.22s ease;
      }
      .fab-principal:hover {
        transform: translateY(-2px) scale(1.02);
      }
      .fab-principal.abierto {
        background: #111;
        color: #f9c900;
      }
      .fab-principal mat-icon {
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .fab-principal mat-icon.girar {
        transform: rotate(90deg);
      }
      .fab-accion {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        border: none;
        border-radius: 24px;
        padding: 11px 18px;
        font: inherit;
        font-size: 14px;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.16);
        animation: subir 0.24s cubic-bezier(0.34, 1.56, 0.64, 1) both;
        transition: transform 0.18s ease;
      }
      .fab-accion:hover {
        transform: translateY(-2px);
      }
      .fab-accion.paciente {
        background: #f4e65a;
        color: #111;
      }
      .fab-accion.turno {
        background: #fff;
        color: #111;
        animation-delay: 0.04s;
      }
      .fab-accion mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
      }
      @keyframes subir {
        from {
          opacity: 0;
          transform: translateY(14px) scale(0.9);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @media (max-width: 900px) {
        .hero {
          align-items: flex-start;
          flex-direction: column;
          gap: 10px;
          margin-top: 16px;
        }
        h1 {
          font-size: 22px;
        }
        .nav {
          width: 100%;
          justify-content: space-between;
        }
      }
      @media (prefers-reduced-motion: reduce) {
        .turno,
        .fab-accion,
        .panel,
        .aviso,
        .fab-fondo {
          animation: none;
        }
        .fab-principal,
        .fab-principal mat-icon,
        .slot-chip,
        .dia-chip {
          transition: none;
        }
      }
    `,
  ],
})
export class Agenda {
  private store = inject(DataStore);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  turnos = this.store.turnos;
  mobile = signal(window.matchMedia('(max-width: 900px)').matches);
  fabAbierto = signal(false);
  fechaBase = signal(hoyIso());
  seleccionado = signal(hoyIso());
  dia = signal<DiaConSlots | null>(null);
  cargandoDia = signal(false);
  now = signal(new Date());

  etiquetaDiaMes = etiquetaDiaMes;
  etiquetaLarga = etiquetaLarga;

  dias = computed(() => {
    const base = this.fechaBase();
    return Array.from({ length: 7 }, (_, i) => {
      const fecha = sumarDias(base, i);
      const local = fechaLocal(fecha);
      const turnos = this.turnosDe(fecha);
      return {
        fecha,
        dow: DIAS_CORTOS[local.getDay()],
        num: local.getDate(),
        mes: MESES_CORTOS[local.getMonth()],
        hoy: fecha === hoyIso(),
        turnos,
        cantidad: turnos.length
      };
    });
  });

  turnosDia = computed(() => this.turnosDe(this.seleccionado()));

  titulo = computed(() => {
    const fecha = this.seleccionado();
    return esFechaHoy(fecha) ? `Hoy, ${etiquetaLarga(fecha)}` : etiquetaLarga(fecha);
  });

  esHoySeleccionado = computed(() => esFechaHoy(this.seleccionado()));

  recordatorio = computed(() => {
    const hoy = hoyIso();
    const pendientes = this.turnos()
      .filter((t) => t.fecha === hoy && t.estado !== 'Realizado' && t.estado !== 'Cancelado')
      .sort((a, b) => a.hora.localeCompare(b.hora));
    if (!pendientes.length) return '';
    const minutos = this.now().getHours() * 60 + this.now().getMinutes();
    const proximo = pendientes.find((t) => this.aMinutos(t.hora) >= minutos);
    if (proximo && this.aMinutos(proximo.hora) - minutos <= 60) {
      return `Próximo turno: ${this.nombre(proximo.pacienteId)} a las ${proximo.hora}.`;
    }
    return `Tenés ${pendientes.length} turno${pendientes.length > 1 ? 's' : ''} pendiente${
      pendientes.length > 1 ? 's' : ''
    } hoy.`;
  });

  constructor() {
    inject(BreakpointObserver)
      .observe('(max-width: 900px)')
      .subscribe((resultado) => this.mobile.set(resultado.matches));

    // Recarga los slots del día elegido cuando cambian turnos o excepciones.
    effect(() => {
      const fecha = this.seleccionado();
      this.store.turnos();
      this.store.excepciones();
      void this.cargarDia(fecha);
    });

    // Marca en la semana visible los días con horario propio.
    effect(() => {
      const desde = this.fechaBase();
      void this.cargarExcepciones(desde, sumarDias(desde, 6));
    });

    setInterval(() => this.now.set(new Date()), 60000);
  }

  private aMinutos(hora: string) {
    const [h, m] = hora.split(':').map(Number);
    return h * 60 + m;
  }

  private turnosDe(fecha: string) {
    const lista = this.turnos().filter((t) => t.fecha === fecha);
    const hayOrdenManual = lista.some((t) => t.ordenManual != null);

    // Sin orden manual manda la hora; si el día fue reordenado, los turnos
    // nuevos (sin orden) van al final para no romper lo que armó la nutricionista.
    return lista.sort((a, b) => {
      if (!hayOrdenManual) return a.hora.localeCompare(b.hora);
      if (a.ordenManual == null && b.ordenManual == null) return a.hora.localeCompare(b.hora);
      if (a.ordenManual == null) return 1;
      if (b.ordenManual == null) return -1;
      return a.ordenManual - b.ordenManual || a.hora.localeCompare(b.hora);
    });
  }

  private async cargarDia(fecha: string) {
    this.cargandoDia.set(true);
    try {
      const dia = await this.store.slots(fecha);
      if (this.seleccionado() === fecha) this.dia.set(dia);
    } catch {
      if (this.seleccionado() === fecha) this.dia.set(null);
    } finally {
      if (this.seleccionado() === fecha) this.cargandoDia.set(false);
    }
  }

  nombre(id: number) {
    return this.store.nombrePaciente(id);
  }

  esHoy(fecha: string) {
    return esFechaHoy(fecha);
  }

  seleccionar(fecha: string) {
    this.seleccionado.set(fecha);
  }

  // Mismo día: solo orden visual. Otro día: reprograma manteniendo la hora.
  async soltar(event: CdkDragDrop<{ fecha: string; turnos: Turno[] }>) {
    const turno = event.item.data as Turno | undefined;
    if (!turno) return;

    const desde = event.previousContainer.data.fecha;
    const hasta = event.container.data.fecha;

    if (desde === hasta) {
      if (event.previousIndex === event.currentIndex) return;

      moveItemInArray(event.container.data.turnos, event.previousIndex, event.currentIndex);
      const cambios = event.container.data.turnos.map((item, ordenManual) => ({
        id: item.id,
        fecha: hasta,
        ordenManual,
      }));

      try {
        await this.store.reordenarTurnos(cambios);
      } catch (err) {
        this.revertirOrden();
        this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
      }
      return;
    }

    const mover = await firstValueFrom(
      this.dialog
        .open(MoverTurnoDialog, {
          data: {
            paciente: this.nombre(turno.pacienteId),
            desde,
            hasta,
            hora: turno.hora,
          },
          width: '420px',
          maxWidth: '94vw',
          autoFocus: false,
        })
        .afterClosed()
    );

    if (!mover) {
      this.revertirOrden();
      return;
    }

    try {
      await this.store.actualizarTurno(turno.id, { fecha: hasta });
      this.snack.open(`Turno movido al ${this.etiquetaDiaMes(hasta)}`, 'OK', { duration: 2500 });
    } catch (err) {
      this.revertirOrden();
      this.snack.open(mensajeDeError(err), 'OK', { duration: 4000 });
    }
  }

  // Redibuja la grilla desde el estado real del store tras un drop fallido.
  private revertirOrden() {
    this.store.turnos.update((lista) => [...lista]);
  }

  moverVentana(delta: number) {
    const base = sumarDias(this.fechaBase(), delta * 7);
    this.fechaBase.set(base);
    this.seleccionado.set(base);
  }

  irHoy() {
    const hoy = hoyIso();
    this.fechaBase.set(hoy);
    this.seleccionado.set(hoy);
  }

  irAFecha(valor: string) {
    if (!valor) return;
    this.fechaBase.set(valor);
    this.seleccionado.set(valor);
  }

  // Si el turno quedó fuera de la ventana visible, mueve la agenda hasta ese día.
  private irAlDia(fecha: string) {
    const enVentana = this.dias().some((dia) => dia.fecha === fecha);
    if (!enVentana) {
      this.irAFecha(fecha);
    } else if (this.mobile()) {
      this.seleccionar(fecha);
    }
  }

  abrirCalendario(input: HTMLInputElement) {
    const conSelector = input as HTMLInputElement & { showPicker?: () => void };
    try {
      conSelector.showPicker ? conSelector.showPicker() : input.click();
    } catch {
      input.click();
    }
  }

  esExcepcion(fecha: string) {
    return this.store.excepciones().some((item) => item.fecha === fecha);
  }

  private async cargarExcepciones(desde: string, hasta: string) {
    try {
      this.store.excepciones.set(await this.store.listarExcepciones(desde, hasta));
    } catch {
      // El aviso es informativo: si falla, la agenda sigue funcionando.
    }
  }

  async volverPlantilla() {
    const fecha = this.seleccionado();
    const confirmar = await firstValueFrom(
      this.dialog
        .open(ConfirmacionDialog, {
          data: {
            titulo: 'Volver a la plantilla',
            mensaje: `¿Volver a la plantilla semanal para ${this.etiquetaDiaMes(fecha)}?`,
            detalle: 'Se borra el horario personalizado de ese día.',
            botonTexto: 'Volver a plantilla',
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

    this.ejecutar(async () => {
      await this.store.eliminarDia(fecha);
      if (fecha === this.seleccionado()) await this.cargarDia(fecha);
    }, 'Se vuelve a usar la plantilla semanal');
  }

  nuevoTurno(slot?: Slot) {
    this.fabAbierto.set(false);
    this.abrirTurno(this.seleccionado(), slot?.hora);
  }

  nuevoTurnoEn(fecha: string) {
    this.abrirTurno(fecha);
  }

  private abrirTurno(fecha: string, hora?: string) {
    this.dialog
      .open(AppointmentDialog, {
        data: { fecha, hora },
        width: '560px',
        maxWidth: '94vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((resultado: ResultadoTurno | undefined) => {
        if (!resultado) return;
        this.ejecutar(async () => {
          await this.store.crearTurno({
            pacienteId: resultado.pacienteId,
            fecha: resultado.fecha,
            hora: resultado.hora,
            motivo: resultado.motivo,
            recordatorio: resultado.recordatorio,
          });
          this.irAlDia(resultado.fecha);
        }, 'Turno agendado');
      });
  }

  editar(turno: Turno) {
    this.dialog
      .open(AppointmentDialog, {
        data: { fecha: turno.fecha, turno },
        width: '560px',
        maxWidth: '94vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((resultado: ResultadoTurno | undefined) => {
        if (!resultado) return;

        const cambios: Partial<Turno> = {
          pacienteId: resultado.pacienteId,
          motivo: resultado.motivo,
          recordatorio: resultado.recordatorio,
        };
        if (resultado.cambioHorario) {
          cambios.fecha = resultado.fecha;
          cambios.hora = resultado.hora;
        }

        this.ejecutar(async () => {
          await this.store.actualizarTurno(turno.id, cambios);
          if (resultado.cambioHorario) this.irAlDia(resultado.fecha);
        }, 'Turno actualizado');
      });
  }

  confirmar(turno: Turno) {
    this.ejecutar(() => this.store.actualizarTurno(turno.id, { estado: 'Confirmado' }), '');
  }

  cancelar(turno: Turno) {
    if (!confirm(`¿Cancelar el turno de ${this.nombre(turno.pacienteId)} a las ${turno.hora}?`)) return;
    this.ejecutar(() => this.store.actualizarTurno(turno.id, { estado: 'Cancelado' }), 'Turno cancelado');
  }

  async eliminar(turno: Turno) {
    const confirmar = await firstValueFrom(
      this.dialog
        .open(ConfirmacionDialog, {
          data: {
            titulo: 'Eliminar turno',
            mensaje: `¿Eliminar el turno de ${this.nombre(turno.pacienteId)} a las ${turno.hora}?`,
            botonTexto: 'Eliminar turno',
            icono: 'delete',
            iconoBoton: 'delete',
            peligro: false,
          },
          width: '420px',
          maxWidth: '94vw',
          autoFocus: false,
        })
        .afterClosed()
    );
    if (!confirmar) return;
    this.ejecutar(() => this.store.eliminarTurno(turno.id), 'Turno eliminado');
  }

  finalizar(turno: Turno) {
    const paciente = this.store.paciente(turno.pacienteId);
    if (!paciente) return;

    this.dialog
      .open(FinalizeDialog, { data: { paciente, turno }, width: '420px', maxWidth: '94vw' })
      .afterClosed()
      .subscribe((resultado) => {
        if (!resultado) return;
        this.ejecutar(
          () => this.store.finalizarTurno(turno.id, resultado),
          'Turno finalizado y sesión registrada'
        );
      });
  }

  nuevoPaciente() {
    this.fabAbierto.set(false);
    this.dialog
      .open(PacienteDialog, { width: '560px', maxWidth: '94vw' })
      .afterClosed()
      .subscribe((paciente: Paciente | undefined) => {
        if (paciente) this.snack.open('Paciente creado', 'OK', { duration: 2200 });
      });
  }

  editarHorarios() {
    this.editarHorariosDe(this.seleccionado());
  }

  editarHorariosDe(fecha: string) {
    this.dialog
      .open(HorariosDiaDialog, {
        data: { fecha },
        width: '480px',
        maxWidth: '94vw',
      })
      .afterClosed()
      .subscribe((cambio) => {
        if (cambio && fecha === this.seleccionado()) void this.cargarDia(fecha);
      });
  }

  private async ejecutar(accion: () => Promise<unknown>, mensaje: string) {
    try {
      await accion();
      if (mensaje) this.snack.open(mensaje, 'OK', { duration: 2200 });
    } catch (err) {
      this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
    }
  }
}
