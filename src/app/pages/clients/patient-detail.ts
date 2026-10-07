import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../services/data.service';
import { Patient } from '../../models/models';

@Component({
  selector: 'app-patient-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatCardModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <a mat-button routerLink="/clientes" class="back"><mat-icon>arrow_back</mat-icon> Volver</a>

    @if (p(); as p) {
      <mat-card class="cab">
        <h1>{{ p.nombre }}</h1>
        <p class="sub">{{ p.objetivo }} · {{ p.edad }} años · {{ p.sexo }} · {{ p.telefono }}</p>
        <div class="chips">
          <span class="chip">⚖ Inicial: {{ p.pesoInicial }} kg</span>
          <span class="chip">Último: {{ ultimo(p) }} kg</span>
          <span class="chip">Variación total: {{ variacionTotal(p) }}</span>
        </div>
      </mat-card>

      <mat-card class="card">
        <h2>Perfil alimentario</h2>
        <p><b>Le gusta:</b> {{ p.gustos }}</p>
        <p><b>Evita:</b> {{ p.evita }}</p>
        <p><b>Alergias:</b> {{ p.alergias }} · <b>Patologías:</b> {{ p.patologias }}</p>
      </mat-card>

      <h2 class="sec">Sesiones y avances</h2>
      @for (c of p.consultas; track c.fecha; let i = $index) {
        <mat-card class="sesion">
          <div class="sesion-head">
            <b>{{ c.fecha }}</b>
            <span class="motivo">{{ c.motivo }}</span>
            <span class="delta" [class.down]="delta(p, i) < 0" [class.up]="delta(p, i) > 0">
              {{ i === 0 ? '—' : (delta(p, i) > 0 ? '+' : '') + delta(p, i) + ' kg vs anterior' }}
            </span>
          </div>
          <p><b>Peso:</b> {{ c.peso }} kg</p>
          <p>{{ c.observaciones }}</p>
        </mat-card>
      } @empty {
        <p class="vacio">Este paciente aún no tiene consultas registradas.</p>
      }

      <h2 class="sec">Registrar sesión</h2>
      <mat-card class="card">
        <form class="form" (ngSubmit)="addConsulta(p)">
          <mat-form-field appearance="outline"><mat-label>Fecha</mat-label><input matInput type="date" [(ngModel)]="c.fecha" name="cf" required></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Motivo</mat-label><input matInput [(ngModel)]="c.motivo" name="cm"></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Peso (kg)</mat-label><input matInput type="number" [(ngModel)]="c.peso" name="cp"></mat-form-field>
          <mat-form-field appearance="outline" class="full"><mat-label>Qué se habló / observaciones</mat-label><input matInput [(ngModel)]="c.observaciones" name="co"></mat-form-field>
          <button mat-flat-button color="primary" type="submit">Agregar sesión</button>
        </form>
      </mat-card>

      <div class="acciones">
        <button mat-stroked-button color="primary" (click)="dieta(p)"><mat-icon>restaurant_menu</mat-icon> Generar dieta</button>
      </div>
    } @else {
      <p>Paciente no encontrado.</p>
    }
  `,
  styles: [`
    .back{margin:16px 0}
    h1{margin:24px 0 4px;font-weight:600}
    .sub{color:#666;margin:0 0 16px}
    .cab{padding:16px;margin-bottom:16px}
    .chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
    .chip{background:#e8f5e9;color:#2e7d32;padding:6px 12px;border-radius:16px;font-size:13px}
    .card{padding:16px;margin-bottom:16px}
    .sec{margin:24px 0 12px;font-weight:600}
    .sesion{padding:16px;margin-bottom:12px}
    .sesion-head{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
    .motivo{background:#f1f8e9;padding:4px 10px;border-radius:12px;font-size:13px}
    .delta{font-weight:600;font-size:13px;color:#888}
    .delta.down{color:#2e7d32}
    .delta.up{color:#c62828}
    .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px}
    .full{grid-column:1/-1}
    .acciones{margin:24px 0;display:flex;gap:12px}
    .vacio{color:#888}
  `],
})
export class PatientDetail {
  private ds = inject(DataService);
  p = signal<Patient | null>(null);
  c: any = { fecha: new Date().toISOString().slice(0, 10), motivo: 'Control', peso: 0, observaciones: '' };

  constructor() {
    const id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
    const found = this.ds.getPatient(id);
    if (found) this.p.set(found);
  }
  ultimo(p: Patient) { return p.consultas.length ? p.consultas[p.consultas.length - 1].peso : p.pesoInicial; }
  variacionTotal(p: Patient) {
    const d = +(this.ultimo(p) - p.pesoInicial).toFixed(1);
    return (d > 0 ? '+' : '') + d + ' kg';
  }
  delta(p: Patient, i: number) {
    if (i === 0) return 0;
    return +(p.consultas[i].peso - p.consultas[i - 1].peso).toFixed(1);
  }
  addConsulta(p: Patient) {
    this.ds.addConsultation(p.id, { ...this.c });
    this.p.set(this.ds.getPatient(p.id) ?? null);
    this.c = { fecha: new Date().toISOString().slice(0, 10), motivo: 'Control', peso: 0, observaciones: '' };
  }
  dieta(p: Patient) {
    const comidas = prompt('¿Cuántas comidas por día? (3, 4 o 5):', '5');
    const demanda = prompt('Demanda física: ¿moderada o alta?', 'moderada');
    alert(`Configurador listo para ${p.nombre}: ${comidas} comidas/día, ${demanda}.\n\nLa generación automática del PDF se habilita en la próxima versión.`);
  }
}
