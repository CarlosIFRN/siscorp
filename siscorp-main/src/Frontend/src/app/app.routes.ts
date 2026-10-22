import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', title: 'Dashboard · CWOS', loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardComponent), data: { step: 0, label: 'Dashboard' } },
  { path: 'formulario_cliente', title: 'Seus dados · CWOS', loadComponent: () => import('./pages/customer.component').then(m => m.CustomerComponent), data: { step: 1, label: 'Seus dados' } },
  { path: 'formulario_cliente-servico', title: 'Veículo e serviço · CWOS', loadComponent: () => import('./pages/vehicle.component').then(m => m.VehicleComponent), data: { step: 2, label: 'Veículo e serviço' } },
  { path: 'agenda-da-semana', title: 'Agenda da semana · CWOS', loadComponent: () => import('./pages/schedule.component').then(m => m.ScheduleComponent), data: { step: 3, label: 'Agenda da semana' } },
  { path: 'confirmacao', title: 'Confirmação · CWOS', loadComponent: () => import('./pages/confirmation.component').then(m => m.ConfirmationComponent), data: { step: 4, label: 'Confirmação' } },
  { path: 'confirmação', redirectTo: 'confirmacao', pathMatch: 'full' },
  { path: '**', redirectTo: 'formulario_cliente' }
];
