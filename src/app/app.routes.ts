import { Routes } from '@angular/router';
import { Dashboard } from './pages/dashboard/dashboard';
import { Clients } from './pages/clients/clients';
import { PatientDetail } from './pages/clients/patient-detail';
import { CalendarPage } from './pages/calendar/calendar';

export const routes: Routes = [
  { path: '', component: Dashboard },
  { path: 'clientes', component: Clients },
  { path: 'clientes/:id', component: PatientDetail },
  { path: 'calendario', component: CalendarPage },
  { path: '**', redirectTo: '' },
];
