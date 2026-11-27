import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CrmService, formatSlot } from '../core/crm.service';
import {
  BASE_OS_SERVICES, EXTRA_OS_SERVICES, ExtraServiceId, formatMoney, nextStage,
  orderTotal, OS_STAGES, OsStage, PatioService, ServiceOrder, stageName, WalkInInput
} from '../core/patio.service';
import { IconComponent } from '../shared/icon.component';

type FormMode = 'checkin' | 'walkin' | null;

@Component({
  selector: 'app-patio', standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
  templateUrl: './patio.component.html'
})
export class PatioComponent implements OnInit {
  readonly crm = inject(CrmService);
  readonly patio = inject(PatioService);
  readonly stages = OS_STAGES;
  readonly baseServices = BASE_OS_SERVICES;
  readonly extraServices = EXTRA_OS_SERVICES;
  readonly formatMoney = formatMoney;
  readonly orderTotal = orderTotal;
  readonly stageName = stageName;
  readonly nextStage = nextStage;
  readonly formatSlot = formatSlot;
  readonly mode = signal<FormMode>(null);
  readonly selectedId = signal<number | null>(null);
  readonly search = signal('');
  readonly formError = signal('');
  readonly detailError = signal('');
  readonly notice = signal('');
  readonly draggedId = signal<number | null>(null);
  readonly dropTarget = signal<OsStage | null>(null);
  readonly selectedOrder = computed(() => this.patio.orders().find(order => order.id === this.selectedId()) ?? null);
  readonly availableAppointments = computed(() => {
    const used = new Set(this.patio.orders().filter(order => order.appointmentId !== null).map(order => order.appointmentId));
    return this.crm.appointments()
      .filter(item => item.status !== 'CONCLUIDO' && !used.has(item.id))
      .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour);
  });
  readonly filteredOrders = computed(() => {
    const search = this.search().trim().toLocaleLowerCase('pt-BR');
    return this.patio.orders().filter(order => !search ||
      `${order.plate} ${order.vehicle} ${order.customer} ${order.responsible}`.toLocaleLowerCase('pt-BR').includes(search));
  });
  readonly openCount = computed(() => this.patio.orders().filter(order => order.stage !== 'ENTREGUE').length);
  readonly readyCount = computed(() => this.patio.orders().filter(order => order.stage === 'PRONTO').length);

  checkinAppointmentId: number | null = null;
  checkinResponsible = '';
  checkinNotes = '';
  walkIn: WalkInInput = this.emptyWalkIn();
  stepResponsible = '';
  extraCode: ExtraServiceId | null = null;

  ngOnInit(): void { void this.crm.refresh(); this.patio.refresh(); }

  ordersBy(stage: OsStage): ServiceOrder[] {
    return this.filteredOrders().filter(order => order.stage === stage)
      .sort((a, b) => a.enteredAt.localeCompare(b.enteredAt));
  }

  startDrag(event: DragEvent, order: ServiceOrder): void {
    if (!nextStage(order.stage)) { event.preventDefault(); return; }
    this.draggedId.set(order.id);
    event.dataTransfer?.setData('text/plain', String(order.id));
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragOver(event: DragEvent, stage: OsStage): void {
    const order = this.patio.orders().find(item => item.id === this.draggedId());
    if (!order || nextStage(order.stage) !== stage) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dropTarget.set(stage);
  }

  onDragLeave(event: DragEvent, stage: OsStage): void {
    const target = event.currentTarget;
    if (target instanceof Element && event.relatedTarget instanceof Node && target.contains(event.relatedTarget)) return;
    if (this.dropTarget() === stage) this.dropTarget.set(null);
  }

  drop(event: DragEvent, stage: OsStage): void {
    event.preventDefault();
    const order = this.patio.orders().find(item => item.id === this.draggedId());
    this.endDrag();
    if (!order || nextStage(order.stage) !== stage) return;
    try {
      this.patio.advance(order.id, order.responsible);
      this.notice.set(`OS #${order.id} movida para ${stageName(stage)}.`);
    } catch (error) { this.notice.set(this.message(error)); }
  }

  endDrag(): void { this.draggedId.set(null); this.dropTarget.set(null); }

  openForm(mode: Exclude<FormMode, null>): void {
    this.selectedId.set(null);
    this.mode.set(mode);
    this.formError.set('');
    this.notice.set('');
    this.checkinAppointmentId = null;
    this.checkinResponsible = '';
    this.checkinNotes = '';
    this.walkIn = this.emptyWalkIn();
    this.focus('os-form-title');
  }

  closeForm(): void {
    const mode = this.mode();
    this.mode.set(null);
    this.formError.set('');
    if (mode) this.focus(mode === 'checkin' ? 'os-open-checkin' : 'os-open-walkin');
  }

  openDetails(id: number): void {
    const order = this.patio.orders().find(item => item.id === id);
    if (!order) return;
    this.mode.set(null);
    this.selectedId.set(id);
    this.stepResponsible = order.responsible;
    this.extraCode = null;
    this.detailError.set('');
    this.notice.set('');
    this.focus('os-detail-title');
  }

  closeDetails(): void {
    const id = this.selectedId();
    this.selectedId.set(null);
    this.detailError.set('');
    if (id !== null) this.focus(`os-card-${id}`);
  }

  checkIn(): void {
    const appointment = this.crm.appointments().find(item => item.id === this.checkinAppointmentId);
    if (!appointment) { this.formError.set('Selecione um agendamento disponível.'); return; }
    try {
      const order = this.patio.checkIn(appointment, this.checkinResponsible, this.checkinNotes);
      this.mode.set(null);
      this.openDetails(order.id);
      this.notice.set(`Check-in realizado. OS #${order.id} criada.`);
    } catch (error) { this.formError.set(this.message(error)); }
  }

  openWalkIn(): void {
    try {
      const order = this.patio.openWalkIn(this.walkIn);
      this.mode.set(null);
      this.openDetails(order.id);
      this.notice.set(`OS #${order.id} aberta para atendimento avulso.`);
    } catch (error) { this.formError.set(this.message(error)); }
  }

  advance(order: ServiceOrder): void {
    try {
      const updated = this.patio.advance(order.id, this.stepResponsible);
      this.stepResponsible = updated.responsible;
      this.detailError.set('');
      this.notice.set(updated.stage === 'ENTREGUE' ? 'Entrega registrada.' : `OS movida para ${stageName(updated.stage)}.`);
    } catch (error) { this.detailError.set(this.message(error)); }
  }

  addExtra(order: ServiceOrder): void {
    if (!this.extraCode) { this.detailError.set('Selecione um serviço extra.'); return; }
    try {
      this.patio.addExtra(order.id, this.extraCode);
      this.extraCode = null;
      this.detailError.set('');
      this.notice.set('Serviço extra adicionado à OS.');
    } catch (error) { this.detailError.set(this.message(error)); }
  }

  removeExtra(order: ServiceOrder, code: string): void {
    try {
      this.patio.removeExtra(order.id, code as ExtraServiceId);
      this.detailError.set('');
      this.notice.set('Serviço extra removido da OS.');
    } catch (error) { this.detailError.set(this.message(error)); }
  }

  availableExtras(order: ServiceOrder): (typeof EXTRA_OS_SERVICES)[number][] {
    return EXTRA_OS_SERVICES.filter(extra => !order.services.some(service => service.code === extra.id));
  }

  formatDateTime(iso: string): string {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso));
  }

  @HostListener('document:keydown', ['$event']) onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.selectedId() !== null) this.closeDetails();
      else if (this.mode()) this.closeForm();
    }
    if (event.key !== 'Tab' || (this.selectedId() === null && !this.mode())) return;
    const dialog = document.querySelector<HTMLElement>('.os-overlay [role="dialog"]');
    const focusable = Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]') ?? []);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const focused = document.activeElement;
    if (event.shiftKey && (focused === first || !focusable.includes(focused as HTMLElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (focused === last || !focusable.includes(focused as HTMLElement))) { event.preventDefault(); first.focus(); }
  }

  private emptyWalkIn(): WalkInInput {
    return { plate: '', vehicle: '', customer: '', service: 'SIMPLES', responsible: '', notes: '' };
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'Não foi possível concluir a operação. Tente novamente.';
  }

  private focus(id: string): void {
    requestAnimationFrame(() => document.getElementById(id)?.focus());
  }
}
