import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BookingService, dateKey, formatSlot, fromKey } from '../core/booking.service';
import { IconComponent } from '../shared/icon.component';

@Component({ selector: 'app-schedule', standalone: true, imports: [RouterLink, IconComponent], templateUrl: './schedule.component.html' })
export class ScheduleComponent {
  readonly booking = inject(BookingService);
  private readonly router = inject(Router);
  readonly hours = [13, 14, 15, 16];
  readonly offset = signal(this.initialOffset());
  readonly mobileDay = signal(this.booking.state().slot?.date || dateKey(new Date()));
  readonly error = signal('');
  readonly formatSlot = formatSlot;
  readonly days = computed(() => {
    const start = new Date();
    start.setHours(12, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay() + this.offset() * 7);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start); date.setDate(date.getDate() + index);
      return { key: dateKey(date), short: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][index], label: new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' }).format(date), number: String(date.getDate()).padStart(2, '0'), today: dateKey(date) === dateKey(new Date()) };
    });
  });
  readonly weekLabel = computed(() => {
    const days = this.days();
    const format = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
    return `${format.format(fromKey(days[0].key))} — ${format.format(fromKey(days[6].key))}`;
  });
  private initialOffset(): number {
    const slot = this.booking.state().slot;
    if (!slot) return 0;
    const start = new Date(); start.setHours(12, 0, 0, 0); start.setDate(start.getDate() - start.getDay());
    return Math.max(0, Math.min(4, Math.floor((fromKey(slot.date).getTime() - start.getTime()) / 604800000)));
  }
  changeWeek(change: number): void {
    this.offset.set(Math.max(0, Math.min(4, this.offset() + change)));
    this.mobileDay.set(this.days().find(day => day.today)?.key || this.days()[0].key);
  }
  selected(date: string, hour: number): boolean { const slot = this.booking.state().slot; return slot?.date === date && slot.hour === hour && !this.booking.state().receipt; }
  label(date: string, hour: number): string {
    if (this.selected(date, hour)) return 'Selecionado';
    return { available: 'Disponível', busy: 'Ocupado', progress: 'Em andamento', past: 'Encerrado' }[this.booking.status(date, hour)];
  }
  choose(date: string, hour: number): void {
    if (this.booking.status(date, hour) !== 'available') return;
    this.booking.update({ slot: { date, hour } }); this.mobileDay.set(date); this.error.set('');
  }
  submit(): void {
    const slot = this.booking.state().slot;
    if (!slot || this.booking.status(slot.date, slot.hour) !== 'available') { this.error.set('Selecione um horário disponível para continuar.'); return; }
    void this.router.navigateByUrl('/confirmacao');
  }
}
