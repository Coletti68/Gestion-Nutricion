import { Component, computed, inject, signal } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { firstValueFrom } from 'rxjs';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../core/auth.service';
import { DataStore } from '../core/data.store';
import { ConfirmacionDialog } from '../shared/confirm-dialog';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  template: `
    <mat-sidenav-container class="container">
      <mat-sidenav #sidenav [mode]="mobile() ? 'over' : 'side'" [opened]="!mobile()" class="sidenav">
        <div class="brand">
          <mat-icon class="logo">spa</mat-icon>
          <span>lau.micelli<br /><small>nutrición</small></span>
        </div>

        <mat-nav-list>
          <a
            mat-list-item
            routerLink="/"
            routerLinkActive="activo"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="mobile() && sidenav.close()"
          >
            <mat-icon matListItemIcon>calendar_month</mat-icon>
            <span matListItemTitle>Agenda</span>
          </a>
          <a mat-list-item routerLink="/clientes" routerLinkActive="activo" (click)="mobile() && sidenav.close()">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Clientes</span>
          </a>
          <a mat-list-item routerLink="/horarios" routerLinkActive="activo" (click)="mobile() && sidenav.close()">
            <mat-icon matListItemIcon>schedule</mat-icon>
            <span matListItemTitle>Horarios</span>
          </a>
          <a mat-list-item routerLink="/historial" routerLinkActive="activo" (click)="mobile() && sidenav.close()">
            <mat-icon matListItemIcon>history</mat-icon>
            <span matListItemTitle>Historial</span>
          </a>
        </mat-nav-list>

        <div class="usuario">
          <div class="usuario-info">
            <span class="avatar">{{ iniciales() }}</span>
            <div class="datos">
              <b>{{ auth.usuario()?.nombre }}</b>
              <small>{{ auth.usuario()?.email }}</small>
            </div>
          </div>
          <button mat-stroked-button class="salir" (click)="salir()">
            <mat-icon>logout</mat-icon>
            Cerrar sesión
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <mat-toolbar>
          <button
            mat-icon-button
            class="menu-btn"
            [class.abierto]="sidenav.opened"
            (click)="sidenav.toggle()"
            aria-label="Menú"
          >
            <mat-icon>menu</mat-icon>
          </button>
          <span class="titulo-tb">lau.micelli.nutricion</span>
          <span class="spacer"></span>
          <button mat-icon-button class="salir-icono" (click)="salir()" aria-label="Cerrar sesión" matTooltip="Cerrar sesión">
            <mat-icon>logout</mat-icon>
          </button>
        </mat-toolbar>

        <main class="contenido">
          @if (store.error()) {
            <div class="alerta">
              <mat-icon>cloud_off</mat-icon>
              <span>{{ store.error() }}</span>
              <button mat-button (click)="store.cargar()">Reintentar</button>
            </div>
          }
          <router-outlet />
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      .container {
        height: 100dvh;
      }
      .sidenav {
        width: 240px;
        background: #fffdf5;
        border-right: 1px solid #f1e9d2;
        display: flex;
        flex-direction: column;
        transition: transform 0.38s cubic-bezier(0.22, 0.61, 0.36, 1) !important;
      }
      .brand {
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 22px 20px;
        font-size: 17px;
        font-weight: 700;
        color: #111;
        line-height: 1.1;
      }
      .brand small {
        font-size: 11px;
        font-weight: 500;
        color: #f28c00;
        letter-spacing: 0.12em;
        text-transform: uppercase;
      }
      .logo {
        color: #f28c00;
      }
      .sidenav a {
        transition: background 0.22s ease, padding-left 0.22s ease, color 0.22s ease;
      }
      .sidenav a:hover {
        background: #fff5dc;
      }
      .activo {
        background: #f4e65a66 !important;
        border-radius: 10px;
      }
      .usuario {
        margin-top: auto;
        padding: 14px 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        border-top: 1px solid #f1e9d2;
      }
      .usuario-info {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .avatar {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        background: #f9c900;
        color: #111;
        display: grid;
        place-items: center;
        font-weight: 700;
        font-size: 13px;
        flex: none;
      }
      .datos {
        display: flex;
        flex-direction: column;
        min-width: 0;
        flex: 1;
      }
      .datos b {
        font-size: 13px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .datos small {
        font-size: 11px;
        color: #888;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .salir {
        width: 100%;
        border-color: #f1e9d2;
        color: #8a1f1f;
        font-size: 12px;
        padding: 0 10px;
        min-width: 0;
        height: 34px;
      }
      .salir mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
        color: #c62828;
      }
      .salir-icono {
        color: #c62828;
      }
      .salir-icono mat-icon {
        color: #c62828;
      }
      .contenido {
        max-width: 1200px;
        margin: 0 auto;
      }
      .spacer {
        flex: 1;
      }
      .titulo-tb {
        font-size: 15px;
        font-weight: 600;
        letter-spacing: 0.02em;
      }
      .menu-btn mat-icon {
        transition: transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      .menu-btn.abierto mat-icon {
        transform: rotate(90deg);
      }
      mat-toolbar {
        background: #fff;
        border-bottom: 1px solid #f1e9d2;
        color: #111;
        position: sticky;
        top: 0;
        z-index: 10;
      }
      .alerta {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #fff4e0;
        border: 1px solid #f2c98a;
        color: #7a4b00;
        border-radius: 12px;
        padding: 10px 14px;
        margin-top: 16px;
        font-size: 13px;
        flex-wrap: wrap;
        animation: aparecer 0.25s ease both;
      }
      .alerta mat-icon {
        color: #f28c00;
      }
      @media (max-width: 600px) {
        .contenido {
          padding: 0 10px 32px;
        }
        .titulo-tb {
          font-size: 14px;
        }
      }
    `,
  ],
})
export class Shell {
  auth = inject(AuthService);
  store = inject(DataStore);
  dialog = inject(MatDialog);

  mobile = signal(window.matchMedia('(max-width: 600px)').matches);
  iniciales = computed(() => {
    const nombre = this.auth.usuario()?.nombre ?? '';
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0]?.toUpperCase())
      .join('');
  });

  constructor() {
    inject(BreakpointObserver)
      .observe([Breakpoints.Handset])
      .subscribe((resultado) => this.mobile.set(resultado.matches));

    void this.auth.validarSesion();
  }

  async salir() {
    const confirmar = await firstValueFrom(
      this.dialog
        .open(ConfirmacionDialog, {
          data: {
            titulo: 'Cerrar sesión',
            mensaje: '¿Querés cerrar la sesión ahora?',
            detalle: 'Vas a volver a la pantalla de inicio de sesión.',
            botonTexto: 'Cerrar sesión',
            icono: 'logout',
            iconoBoton: 'logout',
            peligro: true,
          },
          width: '420px',
          maxWidth: '94vw',
          autoFocus: false,
        })
        .afterClosed()
    );
    if (confirmar) this.auth.logout();
  }
}
