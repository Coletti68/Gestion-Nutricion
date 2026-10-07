import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule, MatChipsModule, MatIconModule],
  template: `
    <h1 class="titulo">Panel principal</h1>
    <div class="grid">
      <mat-card class="stat"><mat-icon class="ic verde">groups</mat-icon><div><b>{{ totalPacientes() }}</b><span>Pacientes activos</span></div></mat-card>
      <mat-card class="stat"><mat-icon class="ic azul">event</mat-icon><div><b>{{ turnosHoy() }}</b><span>Turnos hoy</span></div></mat-card>
      <mat-card class="stat"><mat-icon class="ic naranja">schedule</mat-icon><div><b>{{ proximos().length }}</b><span>Próximos turnos</span></div></mat-card>
      <mat-card class="stat"><mat-icon class="ic violeta">trending_down</mat-icon><div><b>{{ promedio() }} kg</b><span>Peso promedio</span></div></mat-card>
    </div>

    <div class="cols">
      <mat-card>
        <mat-card-header><mat-card-title>Agenda de hoy y próxima</mat-card-title></mat-card-header>
        <mat-list>
          @for (a of proximos(); track a.id) {
            <mat-list-item>
              <span matListItemTitle>{{ nombre(a.pacienteId) }} — {{ a.motivo }}</span>
              <span matListItemLine>{{ a.fecha }} · {{ a.hora }}</span>
              <mat-chip [class]="'estado-' + a.estado.toLowerCase()" matListItemMeta>{{ a.estado }}</mat-chip>
            </mat-list-item>
          } @empty {
            <p style="padding:16px;color:#888">No hay turnos próximos. Cargá uno desde Calendario.</p>
          }
        </mat-list>
      </mat-card>

      <mat-card>
        <mat-card-header><mat-card-title>Peso actual por paciente</mat-card-title></mat-card-header>
        <div class="bars">
          @for (p of patients(); track p.id) {
            <div class="bar-row" title="{{ p.nombre }}">
              <span class="bar-name">{{ p.nombre }}</span>
              <div class="bar" [style.width.%]="porcentaje(p)" [class.bajo]="baja(p)"></div>
              <span class="bar-val">{{ ultimo(p) }} kg</span>
            </div>
          }
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .titulo{margin:24px 0 16px;font-weight:600}
    .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px}
    .stat{display:flex;flex-direction:row;align-items:center;gap:16px;padding:16px}
    .stat b{font-size:28px;display:block}
    .stat span{color:#666}
    .ic{font-size:40px;width:40px;height:40px}
    .verde{color:#2e7d32}.azul{color:#1565c0}.naranja{color:#ef6c00}.violeta{color:#6a1b9a}
    .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px;margin-top:16px}
    .bars{padding:16px}
    .bar-row{display:flex;align-items:center;gap:8px;margin:8px 0}
    .bar-name{width:130px;font-size:13px}
    .bar{flex:0 1 auto;height:14px;background:#66bb6a;border-radius:7px}
    .bar.bajo{background:#ef5350}
    .bar-val{font-size:12px;color:#555}
    @media (max-width:600px){
      .stat{padding:12px}
      .stat b{font-size:22px}
      .ic{font-size:32px;width:32px;height:32px}
      .titulo{font-size:20px}
    }
  `],
})
export class Dashboard {
  private ds = inject(DataService);
  patients = this.ds.patients;
  appointments = this.ds.appointments;
  totalPacientes = computed(() => this.patients().length);
  turnosHoy = computed(() => this.appointments().filter(a => a.fecha === this.hoy()).length);
  proximos = computed(() => this.appointments().filter(a => a.fecha >= this.hoy()).slice(0, 6));
  promedio = computed(() => {
    const ws = this.patients().flatMap(p => p.consultas.map(c => c.peso));
    return ws.length ? (ws.reduce((a, b) => a + b, 0) / ws.length).toFixed(1) : '—';
  });

  hoy() { return new Date().toISOString().slice(0, 10); }
  nombre(id: number) { return this.ds.patientName(id); }
  ultimo(p: any) { return p.consultas.length ? p.consultas[p.consultas.length - 1].peso : p.pesoInicial; }
  baja(p: any) { return p.consultas.length && p.consultas[p.consultas.length - 1].peso < p.pesoInicial; }
  porcentaje(p: any) { return Math.min(100, (this.ultimo(p) / 120) * 100); }
}
