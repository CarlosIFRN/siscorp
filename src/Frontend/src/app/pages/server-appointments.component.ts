import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { apiError } from '../core/api-error';
import { AppointmentsApiService, ServerAppointment, ServerAppointmentStatus } from '../core/appointments-api.service';

@Component({ selector: 'app-server-appointments', standalone: true,
  imports: [FormsModule], templateUrl: './server-appointments.component.html' })
export class ServerAppointmentsComponent {
  private readonly api = inject(AppointmentsApiService);
  readonly items = signal<ServerAppointment[]>([]);
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly available = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly confirmingId = signal<number | null>(null);
  readonly statuses: ServerAppointmentStatus[] = ['AGENDADO', 'EM_LAVAGEM', 'PRONTO', 'CONCLUIDO', 'CANCELADO'];
  vehicleId: number | null = null;
  serviceId: number | null = null;
  dateTime = '';

  async load(): Promise<void> {
    this.loading.set(true); this.loaded.set(true); this.error.set('');
    try { this.items.set(await this.api.list()); this.available.set(true); }
    catch (error) { this.items.set([]); this.available.set(false); this.error.set(apiError(error, 'Não foi possível consultar a agenda do servidor.')); }
    finally { this.loading.set(false); }
  }
  async create(): Promise<void> {
    this.error.set(''); this.notice.set('');
    if (!this.vehicleId || !this.serviceId || !this.dateTime) {
      this.error.set('Informe IDs de veículo e serviço e a data/hora.'); return;
    }
    this.saving.set(true);
    try {
      await this.api.create({ idVeiculo: this.vehicleId, idServico: this.serviceId, dataHora: this.dateTime });
      this.vehicleId = null; this.serviceId = null; this.dateTime = '';
      this.notice.set('Agendamento criado no servidor.');
      await this.load();
    } catch (error) { this.error.set(apiError(error, 'Não foi possível criar o agendamento. Verifique se os IDs existem.')); }
    finally { this.saving.set(false); }
  }
  async changeStatus(item: ServerAppointment, value: string): Promise<void> {
    if (!this.statuses.includes(value as ServerAppointmentStatus)) return;
    this.error.set(''); this.notice.set(''); this.saving.set(true);
    try {
      const updated = await this.api.update(item.idAgendamento, { idVeiculo: item.idVeiculo,
        idServico: item.idServico, dataHora: item.dataHora, status: value as ServerAppointmentStatus });
      this.items.update(items => items.map(current => current.idAgendamento === updated.idAgendamento ? updated : current));
      this.notice.set(`Agendamento #${item.idAgendamento} atualizado.`);
    } catch (error) {
      await this.load();
      this.error.set(apiError(error, 'Não foi possível atualizar o agendamento.'));
    } finally { this.saving.set(false); }
  }
  async delete(item: ServerAppointment): Promise<void> {
    if (this.confirmingId() !== item.idAgendamento) { this.confirmingId.set(item.idAgendamento); return; }
    this.error.set(''); this.notice.set(''); this.saving.set(true);
    try {
      await this.api.delete(item.idAgendamento);
      this.items.update(items => items.filter(current => current.idAgendamento !== item.idAgendamento));
      this.notice.set(`Agendamento #${item.idAgendamento} excluído do servidor.`);
      this.confirmingId.set(null);
    } catch (error) { this.error.set(apiError(error, 'Não foi possível excluir o agendamento.')); }
    finally { this.saving.set(false); }
  }
  formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  }
}
