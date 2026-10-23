import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'agendar', title: 'Agendamento · CWOS', loadComponent: () => import('./pages/public-booking.component').then(m => m.PublicBookingComponent), data: { layout: 'public', label: 'Agendamento' } },
  { path: 'dashboard', title: 'Dashboard · CWOS', loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent), data: { layout: 'admin', label: 'Dashboard' } },
  { path: 'agenda', title: 'Agenda · CWOS', loadComponent: () => import('./pages/schedule.component').then(m => m.ScheduleComponent), data: { layout: 'admin', label: 'Agenda' } },
  { path: 'admin/entrar', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'formulario_cliente', redirectTo: 'agendar', pathMatch: 'full' },
  { path: 'formulario_cliente-servico', redirectTo: 'agendar', pathMatch: 'full' },
  { path: 'agenda-da-semana', redirectTo: 'agenda', pathMatch: 'full' },
  { path: 'confirmacao', redirectTo: 'agendar', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
