import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../services/data.service';
import { Patient } from '../../models/models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MatCardModule, MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule],
  template: `
    <h1 class="titulo">Gestión de clientes</h1>

    <mat-card class="form-card">
      <mat-card-header><mat-card-title>Nuevo paciente</mat-card-title></mat-card-header>
      <form class="form" (ngSubmit)="agregar()">
        <mat-form-field appearance="outline"><mat-label>Nombre</mat-label><input matInput [(ngModel)]="n.nombre" name="nombre" required></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Edad</mat-label><input matInput type="number" [(ngModel)]="n.edad" name="edad"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Sexo</mat-label>
          <mat-select [(ngModel)]="n.sexo" name="sexo"><mat-option value="Femenino">Femenino</mat-option><mat-option value="Masculino">Masculino</mat-option><mat-option value="Otro">Otro</mat-option></mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Teléfono</mat-label><input matInput [(ngModel)]="n.telefono" name="telefono"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Email</mat-label><input matInput [(ngModel)]="n.email" name="email"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Objetivo</mat-label>
          <mat-select [(ngModel)]="n.objetivo" name="objetivo">
            <mat-option value="Descenso de peso">Descenso de peso</mat-option>
            <mat-option value="Ganancia de masa muscular">Ganancia de masa muscular</mat-option>
            <mat-option value="Control de diabetes">Control de diabetes</mat-option>
            <mat-option value="Alimentación saludable">Alimentación saludable</mat-option>
            <mat-option value="Mejorar rendimiento deportivo">Mejorar rendimiento deportivo</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Alergias</mat-label><input matInput [(ngModel)]="n.alergias" name="alergias"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Patologías</mat-label><input matInput [(ngModel)]="n.patologias" name="patologias"></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Preferencias alimenticias</mat-label><input matInput [(ngModel)]="n.preferencias" name="preferencias"></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Le gusta comer</mat-label><input matInput [(ngModel)]="n.gustos" name="gustos"></mat-form-field>
        <mat-form-field appearance="outline" class="full"><mat-label>Evita / no le gusta</mat-label><input matInput [(ngModel)]="n.evita" name="evita"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Peso inicial (kg)</mat-label><input matInput type="number" [(ngModel)]="n.pesoInicial" name="pesoInicial"></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Altura (cm)</mat-label><input matInput type="number" [(ngModel)]="n.altura" name="altura"></mat-form-field>
        <button mat-flat-button color="primary" type="submit">Guardar</button>
      </form>
    </mat-card>

    <mat-form-field appearance="outline" class="buscador">
      <mat-label>Buscar paciente</mat-label>
      <input matInput [(ngModel)]="filtro" placeholder="Nombre o objetivo">
    </mat-form-field>

    <mat-card>
      <table mat-table [dataSource]="filtrados()" class="tabla">
        <ng-container matColumnDef="nombre"><th mat-header-cell *matHeaderCellDef>Nombre</th><td mat-cell *matCellDef="let p">{{ p.nombre }}</td></ng-container>
        <ng-container matColumnDef="objetivo"><th mat-header-cell *matHeaderCellDef>Objetivo</th><td mat-cell *matCellDef="let p">{{ p.objetivo }}</td></ng-container>
        <ng-container matColumnDef="consultas"><th mat-header-cell *matHeaderCellDef>Consultas</th><td mat-cell *matCellDef="let p">{{ p.consultas.length }}</td></ng-container>
        <ng-container matColumnDef="peso"><th mat-header-cell *matHeaderCellDef>Último peso</th><td mat-cell *matCellDef="let p">{{ ultimas(p) }} kg</td></ng-container>
        <ng-container matColumnDef="acciones"><th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let p"><a mat-button color="primary" [routerLink]="['/clientes', p.id]">Ver</a></td>
        </ng-container>
        <tr mat-header-row *matHeaderRowDef="cols"></tr>
        <tr mat-row *matRowDef="let row; columns: cols"></tr>
      </table>
  `,
  styles: [`
    .titulo{margin:24px 0 16px;font-weight:600}
    .form-card{margin-bottom:16px}
    .form{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;padding:16px}
    .full{grid-column:1/-1}
    .buscador{width:100%;margin:16px 0}
    .tabla{width:100%}
  `],
})
export class Clients {
  private ds = inject(DataService);
  patients = this.ds.patients;
  filtro = '';
  cols = ['nombre', 'objetivo', 'consultas', 'peso', 'acciones'];
  n: any = { sexo: 'Femenino', objetivo: 'Descenso de peso', edad: 30, pesoInicial: 70, altura: 165 };

  filtrados() {
    const f = this.filtro.toLowerCase();
    return this.patients().filter(p => p.nombre.toLowerCase().includes(f) || p.objetivo.toLowerCase().includes(f));
  }
  ultimas(p: Patient) { return p.consultas.length ? p.consultas[p.consultas.length - 1].peso : p.pesoInicial; }
  agregar() {
    if (!this.n.nombre) return;
    this.ds.addPatient({ ...this.n });
    this.n = { sexo: 'Femenino', objetivo: 'Descenso de peso', edad: 30, pesoInicial: 70, altura: 165 };
  }
}

