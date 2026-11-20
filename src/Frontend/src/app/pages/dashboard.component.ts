import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { interval } from 'rxjs';
import { Appointment, CrmService, dateKey, formatSlot, SERVICES, serviceName, statusName } from '../core/crm.service';
import { IconComponent } from '../shared/icon.component';

interface DayVolume { key: string; label: string; count: number; height: number; }
interface ServiceVolume { name: string; count: number; share: number; }

@Component({ selector: 'app-dashboard', standalone: true, imports: [RouterLink, IconComponent], templateUrl: './dashboard.component.html' })
export class DashboardComponent implements OnInit {
  readonly crm = inject(CrmService);
  readonly now = signal(Date.now());
  readonly todayKey = computed(() => dateKey(new Date(this.now())));
  readonly todayLabel = computed(() => new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date(this.now())));
  readonly formatSlot = formatSlot;
  readonly serviceName = serviceName;
  readonly statusName = statusName;

  readonly today = computed(() => this.crm.appointments().filter(item => item.date === this.todayKey()));
  readonly inProgress = computed(() => this.today().filter(item => item.status === 'EM_LAVAGEM').length);
  readonly ready = computed(() => this.today().filter(item => item.status === 'PRONTO').length);
  readonly withoutUpdate = computed(() => this.crm.appointments().filter(item =>
    item.status === 'AGENDADO' && this.slotTime(item) < this.now()).length);
  readonly occupancy = computed(() => Math.min(100, Math.round(this.today().length / 4 * 100)));
  readonly completedToday = computed(() => this.today().filter(item => item.status === 'CONCLUIDO').length);
  readonly next = computed(() => this.crm.appointments()
    .filter(item => item.status !== 'CONCLUIDO' && this.slotTime(item) >= this.now())
    .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour)
    .slice(0, 6));

  readonly nextSevenDays = computed<DayVolume[]>(() => {
    const today = new Date(this.now());
    today.setHours(12, 0, 0, 0);
    const days = Array.from({ length: 7 }, (_, offset) => {
      const day = new Date(today);
      day.setDate(today.getDate() + offset);
      const key = dateKey(day);
      return {
        key,
        label: new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit' }).format(day).replace('.', ''),
        count: this.crm.appointments().filter(item => item.date === key).length
      };
    });
    const maximum = Math.max(1, ...days.map(day => day.count));
    return days.map(day => ({ ...day, height: day.count ? Math.max(12, Math.round(day.count / maximum * 100)) : 0 }));
  });
  readonly nextSevenTotal = computed(() => this.nextSevenDays().reduce((total, day) => total + day.count, 0));
  readonly serviceMix = computed<ServiceVolume[]>(() => {
    const keys = new Set(this.nextSevenDays().map(day => day.key));
    const appointments = this.crm.appointments().filter(item => keys.has(item.date));
    return SERVICES.map(service => {
      const count = appointments.filter(item => item.service === service.id).length;
      return { name: service.name, count, share: appointments.length ? Math.round(count / appointments.length * 100) : 0 };
    });
  });

  constructor() { interval(60_000).pipe(takeUntilDestroyed()).subscribe(() => this.now.set(Date.now())); }

  ngOnInit(): void { void this.crm.refresh(); }

  private slotTime(item: Appointment): number {
    return new Date(`${item.date}T${String(item.hour).padStart(2, '0')}:00:00`).getTime();
  }
}
