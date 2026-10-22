import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookingService } from './core/booking.service';
import { IconComponent } from './shared/icon.component';

@Component({ selector: 'app-root', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent], templateUrl: './app.component.html' })
export class AppComponent {
  readonly booking = inject(BookingService);
  readonly router = inject(Router);
  readonly mobileOpen = signal(false);
  readonly step = signal(0);
  readonly page = signal('Dashboard');
  readonly steps = [
    { id: 1, label: 'Seus dados', detail: 'Vamos nos conhecer', icon: 'user', path: '/formulario_cliente' },
    { id: 2, label: 'Veículo e serviço', detail: 'O cuidado ideal', icon: 'car', path: '/formulario_cliente-servico' },
    { id: 3, label: 'Agenda', detail: 'No seu melhor horário', icon: 'calendar', path: '/agenda-da-semana' },
    { id: 4, label: 'Confirmação', detail: 'Tudo pronto para você', icon: 'checkCircle', path: '/confirmacao' }
  ];
  constructor() {
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed()).subscribe(() => {
      const data = this.router.routerState.root.firstChild?.snapshot.data;
      this.step.set(data?.['step'] ?? 0);
      this.page.set(data?.['label'] ?? 'Dashboard');
      const wasOpen = this.mobileOpen();
      this.mobileOpen.set(false);
      requestAnimationFrame(() => { if (wasOpen) document.getElementById('menu-toggle')?.focus(); else document.querySelector<HTMLElement>('h1')?.focus(); });
    });
  }
  done(step: number): boolean {
    return [this.booking.customerReady(), this.booking.vehicleReady(), !!this.booking.state().slot, !!this.booking.state().receipt][step - 1];
  }
  @HostListener('document:keydown.escape') closeMenu(): void {
    if (this.mobileOpen()) { this.mobileOpen.set(false); document.getElementById('menu-toggle')?.focus(); }
  }
  @HostListener('window:resize') onResize(): void {
    if (window.innerWidth > 760) this.mobileOpen.set(false);
  }
}
