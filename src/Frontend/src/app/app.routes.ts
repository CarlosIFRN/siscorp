import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: 'login', title: 'Entrar · CWOS', loadComponent: () => import('./pages/login.component').then(m => m.LoginComponent), data: { layout: 'public', label: 'Entrar' } },
  { path: 'agendar', title: 'Agendamento · CWOS', loadComponent: () => import('./pages/public-booking.component').then(m => m.PublicBookingComponent), data: { layout: 'public', label: 'Agendamento' } },
  { path: 'dashboard', title: 'Dashboard · CWOS', loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent), canActivate: [authGuard], data: { layout: 'admin', label: 'Dashboard' } },
  { path: 'agenda', title: 'Agenda · CWOS', loadComponent: () => import('./pages/schedule.component').then(m => m.ScheduleComponent), canActivate: [authGuard], data: { layout: 'admin', label: 'Agenda' } },
  { path: 'patio', title: 'Pátio / Ordens de Serviço · CWOS', loadComponent: () => import('./pages/patio.component').then(m => m.PatioComponent), canActivate: [authGuard], data: { layout: 'admin', label: 'Pátio / OS' } },
  { path: 'financeiro', title: 'Financeiro · CWOS', loadComponent: () => import('./pages/finance.component').then(m => m.FinanceComponent), canActivate: [authGuard], data: { layout: 'admin', label: 'Financeiro' } },
  { path: 'usuarios', title: 'Usuários · CWOS', loadComponent: () => import('./pages/users.component').then(m => m.UsersComponent), canActivate: [adminGuard], data: { layout: 'admin', label: 'Usuários' } },
  { path: 'formulario_cliente', redirectTo: 'agendar', pathMatch: 'full' },
  { path: 'formulario_cliente-servico', redirectTo: 'agendar', pathMatch: 'full' },
  { path: 'agenda-da-semana', redirectTo: 'agenda', pathMatch: 'full' },
  { path: 'confirmacao', redirectTo: 'agendar', pathMatch: 'full' },
  { path: '**', redirectTo: 'dashboard' }
];
