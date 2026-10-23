import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { IconComponent } from './shared/icon.component';

@Component({ selector: 'app-root', standalone: true, imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent], templateUrl: './app.component.html' })
export class AppComponent {
  readonly router = inject(Router);
  readonly layout = signal<'admin' | 'public'>('admin');
  readonly page = signal('Dashboard');
  readonly collapsed = signal(this.restoreSidebar());
  readonly mobileOpen = signal(false);
  constructor() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd), takeUntilDestroyed()).subscribe(() => {
      const data = this.router.routerState.root.firstChild?.snapshot.data;
      this.layout.set(data?.['layout'] || 'admin');
      this.page.set(data?.['label'] || 'Dashboard');
      this.mobileOpen.set(false);
      requestAnimationFrame(() => document.querySelector<HTMLElement>('h1')?.focus());
    });
  }
  toggleSidebar(): void {
    if (window.innerWidth <= 760) { this.mobileOpen.update(value => !value); return; }
    this.collapsed.update(value => !value);
    try { localStorage.setItem('cwos.sidebar.collapsed', this.collapsed() ? '1' : '0'); } catch { /* preferência opcional */ }
  }
  @HostListener('document:keydown.escape') onEscape(): void { this.mobileOpen.set(false); }
  @HostListener('window:resize') onResize(): void { if (window.innerWidth > 760) this.mobileOpen.set(false); }
  private restoreSidebar(): boolean { try { return localStorage.getItem('cwos.sidebar.collapsed') === '1'; } catch { return false; } }
}
