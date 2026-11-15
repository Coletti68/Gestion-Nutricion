import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { DataStore } from '../../core/data.store';
import { PdfService } from '../../core/pdf.service';
import { mensajeDeError } from '../../core/api-client';
import { Consulta, Paciente } from '../../models/models';
import { PacienteDialog } from './paciente-dialog';
import { SesionDialog } from './sesion-dialog';
import { ConfirmacionDialog } from '../../shared/confirm-dialog';

@Component({
  selector: 'app-paciente-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
  template: `
    <a mat-button routerLink="/clientes" class="back"><mat-icon>arrow_back</mat-icon> Volver</a>

    @if (paciente(); as p) {
      <mat-card class="cab">
        <div class="cab-head">
          <div>
            <h1>{{ p.nombre }}</h1>
            <p class="sub">{{ p.objetivo }} · {{ p.edad }} años · {{ p.sexo }} · {{ p.telefono }}</p>
          </div>
          <button mat-stroked-button class="editar" (click)="editarPaciente(p)">
            <mat-icon>edit</mat-icon>
            Editar
          </button>
          <button mat-stroked-button class="eliminar" (click)="eliminarPaciente(p)">
            <mat-icon>delete</mat-icon>
            Eliminar
          </button>
        </div>
        <div class="chips">
          <span class="chip">⚖ Inicial: {{ p.pesoInicial ?? '—' }} kg</span>
          <span class="chip">Último: {{ ultimoPeso(p) }} kg</span>
          <span class="chip">Variación total: {{ variacionTotal(p) }}</span>
        </div>
      </mat-card>

      <mat-card class="card">
        <h2>Perfil alimentario</h2>
        <p><b>Le gusta:</b> {{ p.gustos ?? '—' }}</p>
        <p><b>Evita:</b> {{ p.evita ?? '—' }}</p>
        <p><b>Alergias:</b> {{ p.alergias ?? '—' }} · <b>Patologías:</b> {{ p.patologias ?? '—' }}</p>
      </mat-card>

      <mat-card class="card">
        <h2>Turnos</h2>
        @for (t of turnos(); track t.id) {
          <div class="turno-row">
            <span class="turno-fecha">{{ t.fecha }} · {{ t.hora }}</span>
            <span class="turno-motivo">{{ t.motivo }}</span>
            <span class="chip" [ngClass]="t.estado.toLowerCase()">{{ t.estado }}</span>
          </div>
        } @empty {
          <p class="vacio">Sin turnos agendados.</p>
        }
      </mat-card>

      <div class="sec-head">
        <h2 class="sec">Sesiones y avances</h2>
        <button mat-flat-button class="agregar" (click)="nuevaSesion(p)">
          <mat-icon>add</mat-icon>
          Registrar sesión
        </button>
      </div>

      @for (c of p.consultas; track c.id; let i = $index) {
        <mat-card class="sesion">
          <div class="sesion-head">
            <b>{{ c.fecha }}</b>
            <span class="motivo">{{ c.motivo }}</span>
            <span class="delta" [class.down]="delta(p, i) < 0" [class.up]="delta(p, i) > 0">
              {{ i === 0 ? '—' : (delta(p, i) > 0 ? '+' : '') + delta(p, i) + ' kg vs anterior' }}
            </span>
            <span class="sesion-acciones">
              <button mat-icon-button (click)="editarConsulta(p, c)" aria-label="Editar sesión">
                <mat-icon>edit</mat-icon>
              </button>
              <button mat-icon-button class="borrar" (click)="eliminarConsulta(p, c)" aria-label="Desactivar sesión">
                <mat-icon>delete</mat-icon>
              </button>
            </span>
          </div>
          <p><b>Peso:</b> {{ c.peso }} kg</p>
          <p>{{ c.observaciones }}</p>
        </mat-card>
      } @empty {
        <p class="vacio">Este paciente aún no tiene consultas registradas.</p>
      }

      <div class="acciones">
        <button mat-stroked-button color="primary" (click)="informe(p)"><mat-icon>picture_as_pdf</mat-icon> Informe de seguimiento</button>
      </div>
    } @else {
      @if (ready()) {
        <p>Paciente no encontrado.</p>
      } @else {
        <p class="vacio">Cargando paciente…</p>
      }
    }
  `,
  styles: [`
    .back{margin:16px 0}
    h1{margin:24px 0 4px;font-weight:600}
    .sub{color:#666;margin:0 0 16px}
    .cab{padding:16px;margin-bottom:16px}
    .cab-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
    .editar{flex:none;margin-top:20px}
    .eliminar{flex:none;margin-top:20px;border-color:#f1e9d2;color:#8a1f1f}
    .eliminar mat-icon{color:#c62828}
    .chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .card{padding:16px;margin-bottom:16px}
    .sec{margin:0;font-weight:600}
    .sesion{padding:16px;margin-bottom:12px}
    .sesion-head{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    .sesion-acciones{margin-left:auto;display:flex;align-items:center}
    .borrar{color:#b3401f}
    .motivo{background:#fff5dc;padding:4px 10px;border-radius:12px;font-size:13px}
    .delta{font-weight:600;font-size:13px;color:#888}
    .delta.down{color:#2e7d32}
    .delta.up{color:#c62828}
    .sec-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin:24px 0 12px}
    .agregar{background:#f28c00;color:#111;flex:none}
    .agregar mat-icon{font-size:19px;width:19px;height:19px}
    .acciones{margin:24px 0;display:flex;gap:12px;flex-wrap:wrap}
    .vacio{color:#888}
    .turno-row{display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid #f6f0e0;flex-wrap:wrap}
    .turno-fecha{font-size:13px;font-weight:600;min-width:130px}
    .turno-motivo{font-size:13px;color:#666;flex:1}
    .chip{background:#fff3d6;color:#8a5a00;padding:6px 12px;border-radius:16px;font-size:12px}
    .chip.confirmado{background:#F9C900;color:#111}
    .chip.pendiente{background:#f4e65a55;color:#7a5b00}
    .chip.realizado{background:#d9f2d0;color:#2c6b1f}
    .chip.cancelado{background:#ffd9d9;color:#8a1f1f}
  `],
})
export class PacienteDetalle {
  private store = inject(DataStore);
  private pdf = inject(PdfService);
  private snack = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  ready = this.store.ready;
  paciente = computed(() => this.store.paciente(this.id) ?? null);
  turnos = computed(() => this.store.turnosDe(this.id));

  ultimoPeso(p: Paciente) {
    return p.consultas.at(-1)?.peso ?? p.pesoInicial ?? '—';
  }

  variacionTotal(p: Paciente) {
    const ultimo = p.consultas.at(-1)?.peso ?? p.pesoInicial;
    if (ultimo == null || p.pesoInicial == null) return '—';
    const diferencia = +(ultimo - p.pesoInicial).toFixed(1);
    return `${diferencia > 0 ? '+' : ''}${diferencia} kg`;
  }

  delta(p: Paciente, i: number) {
    if (i === 0) return 0;
    return +(p.consultas[i].peso - p.consultas[i - 1].peso).toFixed(1);
  }

  nuevaSesion(p: Paciente) {
    this.abrirSesion(p, undefined);
  }

  editarConsulta(p: Paciente, c: Consulta) {
    this.abrirSesion(p, c);
  }

  // Alta y edición comparten el mismo modal de sesión.
  private abrirSesion(p: Paciente, consulta?: Consulta) {
    this.dialog
      .open(SesionDialog, {
        data: {
          pacienteId: p.id,
          pacienteNombre: p.nombre,
          consulta,
          pesoReferencia: p.consultas.at(-1)?.peso ?? p.pesoInicial ?? 0,
        },
        width: '560px',
        maxWidth: '94vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe((resultado: Consulta | undefined) => {
        if (!resultado) return;
        this.snack.open(consulta ? 'Sesión actualizada' : 'Sesión registrada', 'OK', {
          duration: 2200,
        });
      });
  }

  async eliminarConsulta(p: Paciente, c: Consulta) {
    if (!c.id) return;

    const confirmar = await firstValueFrom(
      this.dialog
        .open(ConfirmacionDialog, {
          data: {
            titulo: 'Desactivar sesión',
            mensaje: `¿Desactivar la sesión del ${c.fecha}?`,
            botonTexto: 'Desactivar',
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

    try {
      await this.store.eliminarConsulta(c.id, p.id);
      this.snack.open('Sesión desactivada', 'OK', { duration: 2200 });
    } catch (err) {
      this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
    }
  }

  async eliminarPaciente(p: Paciente) {
    const confirmar = await firstValueFrom(
      this.dialog
        .open(ConfirmacionDialog, {
          data: {
            titulo: 'Eliminar paciente',
            mensaje: `¿Eliminar a ${p.nombre}?`,
            detalle: 'Se borra el paciente y sus datos. Esta acción no se puede deshacer.',
            botonTexto: 'Eliminar paciente',
            icono: 'delete',
            iconoBoton: 'delete',
            peligro: true,
          },
          width: '420px',
          maxWidth: '94vw',
          autoFocus: false,
        })
        .afterClosed()
    );
    if (!confirmar) return;

    try {
      await this.store.eliminarPaciente(p.id);
      this.snack.open('Paciente eliminado', 'OK', { duration: 2200 });
      this.router.navigate(['/clientes']);
    } catch (err) {
      this.snack.open(mensajeDeError(err), 'OK', { duration: 3500 });
    }
  }

  editarPaciente(p: Paciente) {
    this.dialog
      .open(PacienteDialog, { data: { paciente: p }, width: '560px', maxWidth: '94vw' })
      .afterClosed()
      .subscribe((actualizado: Paciente | undefined) => {
        if (actualizado) this.snack.open('Paciente actualizado', 'OK', { duration: 2200 });
      });
  }

  informe(p: Paciente) {
    this.pdf.generateProgressPdf(p);
  }
}
