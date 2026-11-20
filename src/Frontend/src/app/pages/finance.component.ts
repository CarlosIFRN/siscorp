import { Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { dateKey } from '../core/crm.service';
import {
  categoryName, EXPENSE_CATEGORIES, ExpenseCategory, FinanceRole, FinanceService,
  methodName, PAYMENT_METHODS, PaymentMethod, parseMoneyCents
} from '../core/finance.service';
import { formatMoney, orderTotal, PatioService, ServiceOrder, stageName } from '../core/patio.service';
import { IconComponent } from '../shared/icon.component';

type FinanceModal = 'payment' | 'expense' | 'confirm' | null;

@Component({
  selector: 'app-finance', standalone: true,
  imports: [FormsModule, IconComponent],
  templateUrl: './finance.component.html'
})
export class FinanceComponent implements OnInit {
  readonly finance = inject(FinanceService);
  readonly patio = inject(PatioService);
  readonly today = dateKey(new Date());
  readonly selectedDate = signal(this.today);
  readonly rolePreview = signal<FinanceRole>('FUNCIONARIO');
  readonly methodFilter = signal<PaymentMethod | 'TODAS'>('TODAS');
  readonly modal = signal<FinanceModal>(null);
  readonly selectedOrderId = signal<number | null>(null);
  readonly formError = signal('');
  readonly notice = signal('');
  readonly paymentMethods = PAYMENT_METHODS;
  readonly expenseCategories = EXPENSE_CATEGORIES;
  readonly formatMoney = formatMoney;
  readonly orderTotal = orderTotal;
  readonly methodName = methodName;
  readonly categoryName = categoryName;
  readonly parseMoneyCents = parseMoneyCents;
  readonly stageName = stageName;

  readonly summary = computed(() => this.finance.summary(this.selectedDate()));
  readonly pendingOrders = computed(() => this.patio.orders()
    .filter(order => order.paymentStatus === 'PENDENTE')
    .sort((a, b) => a.enteredAt.localeCompare(b.enteredAt)));
  readonly pendingCents = computed(() => this.pendingOrders().reduce((total, order) => total + orderTotal(order), 0));
  readonly movements = computed(() => this.finance.movementsFor(this.selectedDate(), this.methodFilter()));
  readonly closing = computed(() => this.finance.closingFor(this.selectedDate()));
  readonly selectedOrder = computed(() => this.patio.orders().find(order => order.id === this.selectedOrderId()) ?? null);
  readonly historical = computed(() => this.rolePreview() === 'ADMIN'
    ? this.finance.historicalClosings('ADMIN') : []);
  readonly canOperate = computed(() => this.selectedDate() === this.today && !this.finance.closingFor(this.today)
    && !this.finance.error() && !this.patio.error());
  readonly countedDifference = computed(() => {
    try { return parseMoneyCents(this.countedCash(), true) - this.summary().expectedCashCents; }
    catch { return null; }
  });

  paymentAmount = '';
  paymentMethod: PaymentMethod = 'DINHEIRO';
  paymentResponsible = '';
  expenseDescription = '';
  expenseCategory: ExpenseCategory = 'INSUMOS';
  expenseAmount = '';
  expenseMethod: PaymentMethod = 'DINHEIRO';
  expenseResponsible = '';
  closingResponsible = '';
  readonly countedCash = signal('');

  ngOnInit(): void { this.patio.refresh(); this.finance.refresh(); }

  selectRole(value: string): void {
    if (value !== 'FUNCIONARIO' && value !== 'ADMIN') return;
    this.rolePreview.set(value);
    if (value === 'FUNCIONARIO') this.selectedDate.set(this.today);
    this.methodFilter.set('TODAS');
    this.closeModal();
  }

  selectDate(value: string): void {
    if (this.rolePreview() !== 'ADMIN' || !/^\d{4}-\d{2}-\d{2}$/.test(value) || value > this.today) return;
    this.selectedDate.set(value);
    this.methodFilter.set('TODAS');
    this.notice.set('');
  }

  canPay(order: ServiceOrder): boolean {
    return this.canOperate() && (order.stage === 'PRONTO' || order.stage === 'ENTREGUE');
  }

  openPayment(order: ServiceOrder): void {
    if (!this.canPay(order)) return;
    this.selectedOrderId.set(order.id);
    this.paymentAmount = (orderTotal(order) / 100).toFixed(2);
    this.paymentMethod = 'DINHEIRO';
    this.paymentResponsible = '';
    this.formError.set('');
    this.modal.set('payment');
    this.focus('finance-modal-title');
  }

  savePayment(): void {
    const order = this.selectedOrder();
    if (!order) { this.formError.set('OS não encontrada.'); return; }
    try {
      this.finance.recordPayment(order.id, this.paymentAmount, this.paymentMethod, this.paymentResponsible);
      this.modal.set(null);
      this.selectedOrderId.set(null);
      this.formError.set('');
      this.notice.set(`Recebimento integral da OS #${order.id} registrado.`);
      this.focus('finance-page-title');
    } catch (error) { this.formError.set(this.message(error)); }
  }

  openExpense(): void {
    if (!this.canOperate() || this.rolePreview() !== 'ADMIN') return;
    this.expenseDescription = '';
    this.expenseCategory = 'INSUMOS';
    this.expenseAmount = '';
    this.expenseMethod = 'DINHEIRO';
    this.expenseResponsible = '';
    this.formError.set('');
    this.modal.set('expense');
    this.focus('finance-modal-title');
  }

  saveExpense(): void {
    try {
      this.finance.recordExpense(this.expenseDescription, this.expenseCategory,
        this.expenseAmount, this.expenseMethod, this.expenseResponsible, this.rolePreview());
      this.modal.set(null);
      this.formError.set('');
      this.notice.set('Despesa registrada no caixa de hoje.');
      this.focus('finance-add-expense');
    } catch (error) { this.formError.set(this.message(error)); }
  }

  prepareClose(): void {
    if (this.rolePreview() !== 'ADMIN' || this.closing()) return;
    this.formError.set('');
    try {
      parseMoneyCents(this.countedCash(), true);
      if (!this.closingResponsible.trim()) throw new Error('Informe o administrador responsável.');
      this.modal.set('confirm');
      this.focus('finance-modal-title');
    } catch (error) { this.formError.set(this.message(error)); }
  }

  confirmClose(): void {
    try {
      this.finance.closeDay(this.selectedDate(), this.countedCash(), this.closingResponsible, this.rolePreview());
      this.modal.set(null);
      this.formError.set('');
      this.notice.set(`Caixa de ${this.formatDay(this.selectedDate())} fechado.`);
      this.focus('finance-close-button');
    } catch (error) { this.formError.set(this.message(error)); }
  }

  closeModal(): void {
    const modal = this.modal();
    const orderId = this.selectedOrderId();
    this.modal.set(null);
    this.formError.set('');
    this.selectedOrderId.set(null);
    if (modal === 'payment' && orderId !== null) this.focus(`finance-pay-${orderId}`);
    else if (modal === 'expense') this.focus('finance-add-expense');
    else if (modal === 'confirm') this.focus('finance-close-button');
  }

  formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  }
  formatDay(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(new Date(`${value}T12:00:00`));
  }

  @HostListener('window:storage') onStorage(): void { this.patio.refresh(); this.finance.refresh(); }
  @HostListener('document:keydown', ['$event']) onKeydown(event: KeyboardEvent): void {
    if (!this.modal()) return;
    if (event.key === 'Escape') { event.preventDefault(); this.closeModal(); return; }
    if (event.key !== 'Tab') return;
    const dialog = document.querySelector<HTMLElement>('.finance-overlay [role="dialog"]');
    const focusable = Array.from(dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]') ?? []);
    if (!focusable.length) return;
    const first = focusable[0], last = focusable[focusable.length - 1], focused = document.activeElement;
    if (event.shiftKey && (focused === first || !focusable.includes(focused as HTMLElement))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (focused === last || !focusable.includes(focused as HTMLElement))) { event.preventDefault(); first.focus(); }
  }

  private message(error: unknown): string {
    return error instanceof Error ? error.message : 'Não foi possível concluir a operação. Tente novamente.';
  }
  private focus(id: string): void { requestAnimationFrame(() => document.getElementById(id)?.focus()); }
}
