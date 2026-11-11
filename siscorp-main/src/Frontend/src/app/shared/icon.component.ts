import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon', standalone: true,
  template: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path [attr.d]="paths[name] || paths['sparkles']" /></svg>`,
  styles: [':host{display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;flex-shrink:0}svg{width:100%;height:100%}']
})
export class IconComponent {
  @Input() name = 'sparkles';
  readonly paths: Record<string, string> = {
    dashboard: 'M3 3h8v8H3V3Zm10 0h8v5h-8V3Zm0 7h8v11h-8V10ZM3 13h8v8H3v-8Z',
    drop: 'M12 3C10 7 5 11 5 15a7 7 0 0 0 14 0c0-4-5-8-7-12ZM8.5 15a3.5 3.5 0 0 0 3.5 3.5',
    user: 'M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    car: 'M5 7l1-3h12l1 3 2 4v8h-3v-3H6v3H3v-8l2-4ZM4 10h16M7 13h1m8 0h1',
    calendar: 'M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2ZM7 14h2m6 0h2m-10 3h2m6 0h2',
    check: 'M5 12l4 4L19 6',
    checkCircle: 'M22 11v1a10 10 0 1 1-6-9M22 4 12 14l-3-3',
    arrow: 'M4 12h16m-6-6 6 6-6 6',
    back: 'M20 12H4m6-6-6 6 6 6',
    chevron: 'm9 5 7 7-7 7',
    clock: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 6v6l4 2',
    shield: 'm12 3 8 3v6c0 5-8 10-8 10S4 17 4 12V6l8-3Zm-4 9 3 3 5-6',
    mail: 'M3 5h18v14H3V5Zm0 1 9 7 9-7',
    phone: 'm5 3 4 4-2 3a17 17 0 0 0 7 7l3-2 4 4-2 3C10 22 2 14 2 5l3-2Z',
    menu: 'M4 6h16M4 12h16M4 18h16',
    close: 'm6 6 12 12M6 18 18 6',
    info: 'M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0ZM12 11v6m0-10v.1',
    card: 'M2 5h20v14H2V5Zm0 5h20M6 15h3',
    pix: 'm12 2 10 10-10 10L2 12 12-10Zm-6 4 4 4a3 3 0 0 0 4 0l4-4M6 18l4-4a3 3 0 0 1 4 0l4 4',
    cash: 'M2 5h20v14H2V5Zm13 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM5 12h.1m13.9 0h.1',
    edit: 'm16 3 5 5-12 12-6 1 1-6L16 3Zm-3 3 5 5',
    sparkles: 'm12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3ZM20 2v4m-2-2h4',
    pin: 'M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0Zm-5 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z',
    print: 'M6 9V3h12v6M6 17H3V9h18v8h-3M6 14h12v8H6v-8Zm11-2h1'
  };
}
