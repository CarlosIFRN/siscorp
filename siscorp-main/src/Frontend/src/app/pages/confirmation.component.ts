import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { BookingService, Payment, formatSlot } from '../core/booking.service';
import { IconComponent } from '../shared/icon.component';

@Component({ selector: 'app-confirmation', standalone: true, imports: [RouterLink, IconComponent], templateUrl: './confirmation.component.html' })
export class ConfirmationComponent {
  readonly booking = inject(BookingService);
  private readonly router = inject(Router);
  readonly formatSlot = formatSlot;
  readonly error = signal('');
  readonly methods: { id: Payment; label: string; icon: string; detail: string }[] = [
    { id: 'pix', label: 'Pix', icon: 'pix', detail: 'Rápido e prático' },
    { id: 'card', label: 'Cartão', icon: 'card', detail: 'Crédito ou débito' },
    { id: 'cash', label: 'Dinheiro', icon: 'cash', detail: 'Na unidade' }
  ];
  selectPayment(payment: Payment): void { this.booking.update({ payment }); this.error.set(''); }
  submit(): void {
    if (!this.booking.ready()) { this.error.set('Complete seus dados, o veículo, o serviço e o horário antes de confirmar.'); return; }
    if (!this.booking.state().payment) { this.error.set('Selecione uma forma de pagamento.'); return; }
    if (!this.booking.confirm()) { this.error.set('Esse horário não está mais disponível. Volte à agenda e escolha outro.'); return; }
    requestAnimationFrame(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); document.getElementById('success-title')?.focus(); });
  }
  newBooking(): void { this.booking.reset(); void this.router.navigateByUrl('/formulario_cliente'); }
  print(): void { window.print(); }
}
