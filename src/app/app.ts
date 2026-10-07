import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DataService } from './services/data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatSidenavModule, MatToolbarModule, MatIconModule, MatListModule, MatButtonModule],
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav #sidenav [mode]="mobile ? 'over' : 'side'" [opened]="!mobile" class="sidenav">
        <div class="brand"><mat-icon>restaurant</mat-icon><span>NutriGestión</span></div>
        <mat-nav-list>
          <a mat-list-item routerLink="/" routerLinkActive="activo" [routerLinkActiveOptions]="{exact:true}" (click)="mobile && sidenav.close()">
            <mat-icon matListItemIcon>dashboard</mat-icon><span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/clientes" routerLinkActive="activo" (click)="mobile && sidenav.close()">
            <mat-icon matListItemIcon>people</mat-icon><span matListItemTitle>Clientes</span>
          </a>
          <a mat-list-item routerLink="/calendario" routerLinkActive="activo" (click)="mobile && sidenav.close()">
            <mat-icon matListItemIcon>calendar_month</mat-icon><span matListItemTitle>Calendario</span>
          </a>
        </mat-nav-list>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar color="primary">
          <button mat-icon-button (click)="sidenav.toggle()" aria-label="Menú"><mat-icon>menu</mat-icon></button>
          <span class="titulo-tb">Consultorio Nutricional</span>
          <span class="spacer"></span>
          <button mat-icon-button title="Restablecer datos de ejemplo" (click)="reset()"><mat-icon>restart_alt</mat-icon></button>
        </mat-toolbar>
        <main class="contenido"><router-outlet /></main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .container{height:100vh}
    .sidenav{width:240px;background:#fafafa;border-right:1px solid #eee}
    .brand{display:flex;gap:8px;align-items:center;padding:20px;font-size:20px;font-weight:600;color:#2e7d32}
    .activo{background:#e8f5e9 !important;border-radius:8px}
    .contenido{padding:0 16px 40px;max-width:1100px;margin:0 auto}
    .spacer{flex:1}
    .titulo-tb{font-size:16px;font-weight:500}
    .mat-toolbar{position:sticky;top:0;z-index:10}
  `],
})
export class App {
  private ds = inject(DataService);
  mobile = false;
  constructor() {
    new BreakpointObserver().observe([Breakpoints.Handset]).subscribe(r => {
      this.mobile = r.matches;
    });
  }
  reset() {
    if (confirm('¿Restablecer los datos de ejemplo? Se perderán los cambios.')) {
      this.ds.resetDemo();
      location.reload();
    }
  }
}
