import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './core/auth.guard';
import { Shell } from './layout/shell';
import { Login } from './features/auth/login';
import { Agenda } from './features/agenda/agenda';
import { Clientes } from './features/clientes/clientes';
import { PacienteDetalle } from './features/clientes/paciente-detalle';
import { Horarios } from './features/horarios/horarios';
import { Historial } from './features/historial/historial';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [loginGuard] },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', component: Agenda },
      { path: 'clientes', component: Clientes },
      { path: 'clientes/:id', component: PacienteDetalle },
      { path: 'horarios', component: Horarios },
      { path: 'historial', component: Historial },
    ],
  },
  { path: '**', redirectTo: '' },
];
