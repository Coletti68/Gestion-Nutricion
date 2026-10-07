import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatChipsModule],
  template: `
    <h1 class="titulo">Calendario de turnos</h1>

    <div class="cols">
      <mat-card>
        <mat-card-header>
          <mat-card-title>{{ mesNombre() }} {{ anio }}</mat-card-title>
          <span class="spacer"></span>
          <button mat-icon-button (click)="cambiarMes(-1)">‹</button>
          <button mat-icon-button (click)="cambiarMes(1)">›</button>
        </mat-card-header>
        <div class="cal">
          @for (d of ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']; track d) { <div class="dow">{{ d }}</div> }
          @for (dia of dias(); track $index) {
            <div class="dia" [class.vacio]="!dia" [class.sel]="dia && fechaDe(dia) === seleccionado" (click)="dia && pick(dia)">
              {{ dia }}
              @if (dia && turnosDe(dia).length) { <span class="dot"></span> }
            </div>
          }
        </div>
      </mat-card>

      <div>
        <mat-card class="form-card">
          <mat-card-header><mat-card-title>Nuevo turno</mat-card-title></mat-card-header>
          <form class="form" (ngSubmit)="agregar()">
            <mat-form-field appearance="outline" class="full"><mat-label>Paciente</mat-label>
              <mat-select [(ngModel)]="n.pacienteId" name="pac">
                @for (p of patients(); track p.id) { <mat-option [value]="p.id">{{ p.nombre }}</mat-option> }
              </mat-select>
            </mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Fecha</mat-label><input matInput type="date" [(ngModel)]="n.fecha" name="f"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Hora</mat-label><input matInput type="time" [(ngModel)]="n.hora" name="h"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Motivo</mat-label><input matInput [(ngModel)]="n.motivo" name="m"></mat-form-field>
            <mat-form-field appearance="outline"><mat-label>Estado</mat-label>
              <mat-select [(ngModel)]="n.estado" name="e">
                <mat-option value="Confirmado">Confirmado</mat-option>
                <mat-option value="Pendiente">Pendiente</mat-option>
                <mat-option value="Realizado">Realizado</mat-option>
                <mat-option value="Cancelado">Cancelado</mat-option>
              </mat-select>
            </mat-form-field>
            <button mat-flat-button color="primary" type="submit">Guardar turno</button>
            <button mat-stroked-button type="button" (click)="conectarGoogle()">Conectar con Google Calendar</button>
          </form>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Turnos del día {{ seleccionado || '—' }}</mat-card-title></mat-card-header>
          @for (a of turnosSel(); track a.id) {
            <div class="turno">
              <b>{{ a.hora }}</b> — {{ nombre(a.pacienteId) }} · {{ a.motivo }}
              <mat-chip [class]="'estado-' + a.estado.toLowerCase()">{{ a.estado }}</mat-chip>
            </div>
          } @empty { <p class="vacio-txt">No hay turnos para este día.</p> }
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .titulo{margin:24px 0 16px;font-weight:600}
    .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(340px,1fr));gap:16px}
    .spacer{flex:1}
    .cal{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;padding:16px;text-align:center}
    .dow{font-weight:600;color:#2e7d32;padding:8px 0}
    .dia{padding:12px 0;border-radius:8px;cursor:pointer;position:relative}
    @media (max-width:600px){
      .cal{grid-template-columns:repeat(7,1fr);gap:2px;padding:8px}
      .dia{padding:18px 0;font-size:15px}
      .form{grid-template-columns:1fr}
      .titulo{font-size:20px}
    }
    .dia:hover{background:#e8f5e9}
    .dia.sel{background:#2e7d32;color:#fff}
    .dia.vacio{cursor:default}
    .dot{position:absolute;bottom:4px;left:50%;width:6px;height:6px;background:#ef6c00;border-radius:50%;transform:translateX(-50%)}
    .form-card{margin-bottom:16px}
    .form{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px}
    .full{grid-column:1/-1}
    .turno{display:flex;gap:8px;align-items:center;padding:8px 16px}
    .vacio-txt{padding:16px;color:#888}
  `],
})
export class CalendarPage {
  private ds = inject(DataService);
  patients = this.ds.patients;
  appointments = this.ds.appointments;
  hoy = new Date();
  mes = this.hoy.getMonth();
  anio = this.hoy.getFullYear();
  seleccionado = '';
  n: any = { pacienteId: 1, fecha: new Date().toISOString().slice(0, 10), hora: '09:00', motivo: 'Control', estado: 'Confirmado' };

  mesNombre() {
    return ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'][this.mes];
  }
  cambiarMes(d: number) {
    this.mes += d;
    if (this.mes < 0) { this.mes = 11; this.anio--; }
    if (this.mes > 11) { this.mes = 0; this.anio++; }
  }
  dias(): (number | null)[] {
    const first = new Date(this.anio, this.mes, 1);
    let pad = first.getDay() - 1; // lunes=0
    if (pad < 0) pad = 6;
    const total = new Date(this.anio, this.mes + 1, 0).getDate();
    const arr: (number | null)[] = Array(pad).fill(null);
    for (let i = 1; i <= total; i++) arr.push(i);
    return arr;
  }
  fechaDe(dia: number) { return `${this.anio}-${String(this.mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`; }
  turnosDe(dia: number) { return this.appointments().filter(a => a.fecha === this.fechaDe(dia)); }
  pick(dia: number) { this.seleccionado = this.fechaDe(dia); this.n.fecha = this.seleccionado; }
  turnosSel() { return this.appointments().filter(a => a.fecha === this.seleccionado); }
  nombre(id: number) { return this.ds.patientName(id); }
  agregar() {
    if (!this.n.pacienteId || !this.n.fecha) return;
    this.ds.addAppointment({ ...this.n });
    this.n = { ...this.n, motivo: 'Control' };
  }
  conectarGoogle() { alert('Integración con Google Calendar disponible en la versión con backend.'); }
}
