import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Appointment, AppointmentStatus, CrmService, SERVICES, STATUSES, dateKey, fromKey, serviceName, statusName } from '../core/crm.service';
import { IconComponent } from '../shared/icon.component';

type CalendarView = 'day' | 'week' | 'month';
interface CalendarDay { key: string; number: number; currentMonth: boolean; today: boolean; }

@Component({ selector: 'app-schedule', standalone: true, imports: [RouterLink, IconComponent], templateUrl: './schedule.component.html' })
export class ScheduleComponent implements OnInit {
  readonly crm = inject(CrmService);
  readonly services = SERVICES;
  readonly statuses = STATUSES;
  readonly hours = [13, 14, 15, 16];
  readonly weekdays = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB', 'DOM'];
  readonly view = signal<CalendarView>('month');
  readonly activeDate = signal(dateKey(new Date()));
  readonly selectedDay = signal(dateKey(new Date()));
  readonly serviceFilter = signal('all');
  readonly search = signal('');
  readonly drawerOpen = signal(false);
  readonly savingId = signal<number | null>(null);
  readonly actionError = signal('');
  readonly serviceName = serviceName;
  readonly statusName = statusName;
  readonly filtered = computed(() => this.crm.appointments().filter(item => {
    const search = this.search().trim().toLocaleLowerCase('pt-BR');
    return (this.serviceFilter() === 'all' || item.service === this.serviceFilter()) && (!search || `${item.customerName} ${item.licensePlate} ${item.vehicleModel}`.toLocaleLowerCase('pt-BR').includes(search));
  }));
  readonly monthDays = computed<CalendarDay[]>(() => {
    const active = fromKey(this.activeDate());
    const first = new Date(active.getFullYear(), active.getMonth(), 1, 12);
    first.setDate(first.getDate() - ((first.getDay() + 6) % 7));
    return Array.from({ length: 42 }, (_, index) => { const date = new Date(first); date.setDate(first.getDate() + index); return this.dayData(date, active.getMonth()); });
  });
  readonly weekDays = computed<CalendarDay[]>(() => {
    const active = fromKey(this.activeDate());
    const first = new Date(active); first.setDate(active.getDate() - ((active.getDay() + 6) % 7));
    return Array.from({ length: 7 }, (_, index) => { const date = new Date(first); date.setDate(first.getDate() + index); return this.dayData(date, active.getMonth()); });
  });
  readonly periodTitle = computed(() => {
    const active = fromKey(this.activeDate());
    if (this.view() === 'month') return this.capitalize(new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(active));
    if (this.view() === 'day') return this.capitalize(new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(active));
    const days = this.weekDays();
    return `${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(fromKey(days[0].key))} – ${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(fromKey(days[6].key))}`;
  });
  readonly selectedDayLabel = computed(() => this.capitalize(new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }).format(fromKey(this.selectedDay()))));

  ngOnInit(): void { void this.crm.refresh(); }
  setView(view: CalendarView): void { this.view.set(view); this.drawerOpen.set(false); }
  movePeriod(amount: number): void {
    const date = fromKey(this.activeDate());
    if (this.view() === 'month') date.setMonth(date.getMonth() + amount, 1);
    else date.setDate(date.getDate() + amount * (this.view() === 'week' ? 7 : 1));
    this.activeDate.set(dateKey(date)); this.drawerOpen.set(false);
  }
  goToday(): void { this.activeDate.set(dateKey(new Date())); this.drawerOpen.set(false); }
  openDay(key: string): void { this.selectedDay.set(key); this.activeDate.set(key); this.drawerOpen.set(true); this.actionError.set(''); }
  closeDay(): void { this.drawerOpen.set(false); this.actionError.set(''); }
  eventsFor(key: string): Appointment[] { return this.filtered().filter(item => item.date === key).sort((a, b) => a.hour - b.hour); }
  eventAt(key: string, hour: number): Appointment | undefined { return this.eventsFor(key).find(item => item.hour === hour); }
  async updateStatus(item: Appointment, value: string): Promise<void> {
    this.savingId.set(item.id); this.actionError.set('');
    try { await this.crm.updateStatus(item.id, value as AppointmentStatus); }
    catch { this.actionError.set('Não foi possível atualizar o atendimento. Tente novamente.'); }
    finally { this.savingId.set(null); }
  }
  @HostListener('document:keydown.escape') onEscape(): void { this.closeDay(); }
  private dayData(date: Date, currentMonth: number): CalendarDay { return { key: dateKey(date), number: date.getDate(), currentMonth: date.getMonth() === currentMonth, today: dateKey(date) === dateKey(new Date()) }; }
  private capitalize(value: string): string { return value.charAt(0).toUpperCase() + value.slice(1); }
}
