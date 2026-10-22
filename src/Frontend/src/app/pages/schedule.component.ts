import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BookingService, BookingRecord, SERVICES, dateKey, formatSlot, fromKey } from '../core/booking.service';
import { IconComponent } from '../shared/icon.component';

type CalendarView = 'day' | 'week' | 'month';
interface CalendarDay { key: string; number: number; currentMonth: boolean; today: boolean; }

@Component({
  selector: 'app-schedule', standalone: true, imports: [RouterLink, IconComponent],
  templateUrl: './schedule.component.html'
})
export class ScheduleComponent {
  readonly booking = inject(BookingService);
  private readonly router = inject(Router);
  readonly services = SERVICES;
  readonly hours = [13, 14, 15, 16];
  readonly weekdays = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  readonly view = signal<CalendarView>('month');
  readonly activeDate = signal(this.booking.state().slot?.date || dateKey(new Date()));
  readonly selectedDay = signal(this.activeDate());
  readonly serviceFilter = signal('all');
  readonly drawerOpen = signal(false);
  readonly error = signal('');
  readonly formatSlot = formatSlot;

  readonly monthDays = computed<CalendarDay[]>(() => {
    const active = fromKey(this.activeDate());
    const first = new Date(active.getFullYear(), active.getMonth(), 1, 12);
    first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(first);
      date.setDate(first.getDate() + index);
      return this.dayData(date, active.getMonth());
    });
  });
  readonly weekDays = computed<CalendarDay[]>(() => {
    const active = fromKey(this.activeDate());
    const first = new Date(active);
    first.setDate(active.getDate() - ((active.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(first);
      date.setDate(first.getDate() + index);
      return this.dayData(date, active.getMonth());
    });
  });
  readonly periodTitle = computed(() => {
    const active = fromKey(this.activeDate());
    if (this.view() === 'month') return this.capitalize(new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(active));
    if (this.view() === 'day') return this.capitalize(new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(active));
    const days = this.weekDays();
    const first = fromKey(days[0].key);
    const last = fromKey(days[6].key);
    return `${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(first)} – ${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(last)}`;
  });
  readonly selectedDayLabel = computed(() => this.capitalize(new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(fromKey(this.selectedDay()))));

  setView(view: CalendarView): void { this.view.set(view); this.drawerOpen.set(false); }
  movePeriod(amount: number): void {
    const date = fromKey(this.activeDate());
    if (this.view() === 'month') date.setMonth(date.getMonth() + amount, 1);
    else date.setDate(date.getDate() + amount * (this.view() === 'week' ? 7 : 1));
    this.activeDate.set(dateKey(date));
    this.drawerOpen.set(false);
  }
  goToday(): void { this.activeDate.set(dateKey(new Date())); this.drawerOpen.set(false); }
  openDay(key: string): void { this.selectedDay.set(key); this.activeDate.set(key); this.drawerOpen.set(true); this.error.set(''); }
  closeDay(): void { this.drawerOpen.set(false); this.error.set(''); }
  eventsFor(key: string): BookingRecord[] {
    return this.booking.history().filter(item => item.slot.date === key && (this.serviceFilter() === 'all' || item.vehicle.service === this.serviceFilter())).sort((a, b) => a.slot.hour - b.slot.hour);
  }
  eventAt(key: string, hour: number): BookingRecord | undefined { return this.eventsFor(key).find(item => item.slot.hour === hour); }
  serviceName(id: string): string { return SERVICES.find(service => service.id === id)?.name || 'Lavagem'; }
  selected(date: string, hour: number): boolean {
    const slot = this.booking.state().slot;
    return slot?.date === date && slot.hour === hour && !this.booking.state().receipt;
  }
  statusLabel(date: string, hour: number): string {
    if (this.selected(date, hour)) return 'Selecionado';
    return { available: 'Disponível', busy: 'Ocupado', progress: 'Em andamento', past: 'Encerrado' }[this.booking.status(date, hour)];
  }
  choose(date: string, hour: number): void {
    if (this.booking.status(date, hour) !== 'available') return;
    this.booking.update({ slot: { date, hour } });
    this.selectedDay.set(date);
    this.error.set('');
  }
  submit(): void {
    const slot = this.booking.state().slot;
    if (!slot || slot.date !== this.selectedDay() || this.booking.status(slot.date, slot.hour) !== 'available') {
      this.error.set('Selecione um horário disponível para continuar.');
      this.drawerOpen.set(true);
      return;
    }
    void this.router.navigateByUrl('/confirmacao');
  }
  startNew(): void { this.booking.reset(); void this.router.navigateByUrl('/formulario_cliente'); }
  private dayData(date: Date, currentMonth: number): CalendarDay {
    return { key: dateKey(date), number: date.getDate(), currentMonth: date.getMonth() === currentMonth, today: dateKey(date) === dateKey(new Date()) };
  }
  private capitalize(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1); }
}
