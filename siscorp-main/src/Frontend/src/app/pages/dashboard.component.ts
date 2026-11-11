import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BookingRecord, BookingService, dateKey, formatSlot, fromKey, SERVICES } from '../core/booking.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent {
  readonly booking = inject(BookingService);
  readonly formatSlot = formatSlot;
  readonly today = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date());
  readonly serviceCount = SERVICES.length;
  readonly recent = computed(() => [...this.booking.history()].reverse().slice(0, 3));
  readonly next = computed(() => [...this.booking.history()]
    .filter(record => this.slotTime(record) > Date.now())
    .sort((a, b) => this.slotTime(a) - this.slotTime(b))[0] || null);
  readonly availableThisWeek = computed(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, index) => {
      const day = new Date(today);
      day.setDate(day.getDate() + index);
      return dateKey(day);
    }).reduce((count, day) => count + [13, 14, 15, 16]
      .filter(hour => this.booking.status(day, hour) === 'available').length, 0);
  });
  readonly draftStep = computed(() => {
    if (this.booking.state().receipt) return 4;
    if (this.booking.state().slot) return 3;
    if (this.booking.vehicleReady()) return 2;
    if (this.booking.customerReady()) return 1;
    return 0;
  });
  readonly resumePath = computed(() => [
    '/formulario_cliente', '/formulario_cliente-servico', '/agenda-da-semana', '/confirmacao', '/confirmacao'
  ][this.draftStep()]);

  serviceName(record: BookingRecord): string {
    return SERVICES.find(service => service.id === record.vehicle.service)?.name || 'Serviço de lavagem';
  }

  private slotTime(record: BookingRecord): number {
    const date = fromKey(record.slot.date);
    date.setHours(record.slot.hour, 0, 0, 0);
    return date.getTime();
  }
}
