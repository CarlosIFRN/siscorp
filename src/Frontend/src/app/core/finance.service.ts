import { Injectable, inject, signal } from '@angular/core';
import { dateKey } from './crm.service';
import { orderTotal, PatioService } from './patio.service';

export type FinanceRole = 'FUNCIONARIO' | 'ADMIN';
export type PaymentMethod = 'DINHEIRO' | 'PIX' | 'CARTAO';
export type MovementType = 'RECEBIMENTO' | 'DESPESA';
export type ExpenseCategory = 'INSUMOS' | 'MANUTENCAO' | 'CONTAS' | 'OUTROS';

export const PAYMENT_METHODS: { id: PaymentMethod; name: string }[] = [
  { id: 'DINHEIRO', name: 'Dinheiro' }, { id: 'PIX', name: 'Pix' }, { id: 'CARTAO', name: 'Cartão' }
];
export const EXPENSE_CATEGORIES: { id: ExpenseCategory; name: string }[] = [
  { id: 'INSUMOS', name: 'Insumos' }, { id: 'MANUTENCAO', name: 'Manutenção' },
  { id: 'CONTAS', name: 'Contas e utilidades' }, { id: 'OUTROS', name: 'Outros' }
];

export interface FinancialMovement {
  id: number;
  occurredAt: string;
  orderId: number | null;
  plate: string | null;
  description: string;
  amountCents: number;
  type: MovementType;
  method: PaymentMethod;
  responsible: string;
  category: ExpenseCategory | null;
}
export interface DailyClosing {
  date: string;
  closedAt: string;
  responsible: string;
  cashCents: number;
  pixCents: number;
  cardCents: number;
  expensesCents: number;
  expectedCashCents: number;
  countedCashCents: number;
  differenceCents: number;
}
interface FinanceState { movements: FinancialMovement[]; closings: DailyClosing[]; }
export interface DailySummary {
  receivedCents: number;
  cashCents: number;
  pixCents: number;
  cardCents: number;
  expensesCents: number;
  cashExpensesCents: number;
  balanceCents: number;
  expectedCashCents: number;
}

const STORAGE_KEY = 'cwos.finance.demo.v1';

export function methodName(method: PaymentMethod): string {
  return PAYMENT_METHODS.find(item => item.id === method)?.name ?? method;
}
export function categoryName(category: ExpenseCategory | null): string {
  return EXPENSE_CATEGORIES.find(item => item.id === category)?.name ?? '—';
}
export function parseMoneyCents(value: string, allowZero = false): number {
  const match = /^(0|[1-9]\d{0,8})(?:[.,](\d{1,2}))?$/.exec(value.trim());
  if (!match) throw new Error('Informe um valor válido com até duas casas decimais.');
  const cents = Number(match[1]) * 100 + Number((match[2] ?? '').padEnd(2, '0'));
  if (!allowZero && cents === 0) throw new Error('O valor deve ser maior que zero.');
  return cents;
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly patio = inject(PatioService);
  readonly error = signal('');
  private storageHealthy = true;
  readonly state = signal<FinanceState>(this.read());

  refresh(): void { this.state.set(this.read()); }

  movementsFor(date: string, method: PaymentMethod | 'TODAS' = 'TODAS'): FinancialMovement[] {
    return this.state().movements.filter(item => dateKey(new Date(item.occurredAt)) === date
      && (method === 'TODAS' || item.method === method))
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  }

  summary(date: string): DailySummary {
    const movements = this.movementsFor(date);
    const receipts = movements.filter(item => item.type === 'RECEBIMENTO');
    const expenses = movements.filter(item => item.type === 'DESPESA');
    const total = (items: FinancialMovement[]) => items.reduce((sum, item) => sum + item.amountCents, 0);
    const cashCents = total(receipts.filter(item => item.method === 'DINHEIRO'));
    const pixCents = total(receipts.filter(item => item.method === 'PIX'));
    const cardCents = total(receipts.filter(item => item.method === 'CARTAO'));
    const expensesCents = total(expenses);
    const cashExpensesCents = total(expenses.filter(item => item.method === 'DINHEIRO'));
    return {
      receivedCents: cashCents + pixCents + cardCents,
      cashCents, pixCents, cardCents, expensesCents, cashExpensesCents,
      balanceCents: cashCents + pixCents + cardCents - expensesCents,
      expectedCashCents: cashCents - cashExpensesCents
    };
  }

  closingFor(date: string): DailyClosing | undefined {
    return this.state().closings.find(item => item.date === date);
  }

  historicalClosings(role: FinanceRole): DailyClosing[] {
    if (role !== 'ADMIN') throw new Error('Somente ADMIN pode consultar fechamentos anteriores.');
    return [...this.state().closings].sort((a, b) => b.date.localeCompare(a.date));
  }

  recordPayment(orderId: number, amount: string, method: PaymentMethod, responsible: string): FinancialMovement {
    const state = this.current();
    this.ensureOpenToday(state);
    this.patio.refresh();
    if (this.patio.error()) throw new Error(this.patio.error());
    const order = this.patio.orders().find(item => item.id === orderId);
    if (!order) throw new Error('OS não encontrada.');
    if (order.stage !== 'PRONTO' && order.stage !== 'ENTREGUE') {
      throw new Error('O recebimento só pode ser registrado quando o serviço estiver Pronto ou Entregue.');
    }
    if (order.paymentStatus === 'PAGO' || state.movements.some(item => item.type === 'RECEBIMENTO' && item.orderId === orderId)) {
      throw new Error('Esta OS já possui recebimento registrado.');
    }
    this.requireMethod(method);
    const cents = parseMoneyCents(amount);
    if (cents !== orderTotal(order)) throw new Error('O pagamento deve ser integral e igual ao total da OS.');
    const by = this.requireText(responsible, 'Informe o responsável pelo recebimento.');
    const movement: FinancialMovement = {
      id: this.nextId(state), occurredAt: new Date().toISOString(), orderId,
      plate: order.plate, description: order.services.map(item => item.name).join(' + '),
      amountCents: cents, type: 'RECEBIMENTO', method, responsible: by, category: null
    };
    this.write({ ...state, movements: [...state.movements, movement] });
    try { this.patio.markPaid(orderId); }
    catch (error) {
      try { this.write(state); }
      catch { this.error.set('Falha ao concluir a baixa local. Confira a OS e as movimentações antes de tentar novamente.'); }
      throw error;
    }
    return movement;
  }

  recordExpense(description: string, category: ExpenseCategory, amount: string,
      method: PaymentMethod, responsible: string, role: FinanceRole): FinancialMovement {
    if (role !== 'ADMIN') throw new Error('Somente ADMIN pode registrar despesas nesta prévia.');
    const state = this.current();
    this.ensureOpenToday(state);
    if (!EXPENSE_CATEGORIES.some(item => item.id === category)) throw new Error('Selecione uma categoria válida.');
    this.requireMethod(method);
    const movement: FinancialMovement = {
      id: this.nextId(state), occurredAt: new Date().toISOString(), orderId: null, plate: null,
      description: this.requireText(description, 'Informe a descrição da despesa.'),
      amountCents: parseMoneyCents(amount), type: 'DESPESA', method,
      responsible: this.requireText(responsible, 'Informe o responsável pela despesa.'), category
    };
    this.write({ ...state, movements: [...state.movements, movement] });
    return movement;
  }

  closeDay(date: string, countedCash: string, responsible: string, role: FinanceRole): DailyClosing {
    if (role !== 'ADMIN') throw new Error('Somente ADMIN pode fechar o caixa.');
    const state = this.current();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(`${date}T12:00:00`))
        || dateKey(new Date(`${date}T12:00:00`)) !== date || date > dateKey(new Date())) {
      throw new Error('Selecione uma data válida para o fechamento.');
    }
    if (state.closings.some(item => item.date === date)) throw new Error('O caixa desta data já foi fechado.');
    const summary = this.summary(date);
    const countedCashCents = parseMoneyCents(countedCash, true);
    const closing: DailyClosing = {
      date, closedAt: new Date().toISOString(),
      responsible: this.requireText(responsible, 'Informe o administrador responsável.'),
      cashCents: summary.cashCents, pixCents: summary.pixCents, cardCents: summary.cardCents,
      expensesCents: summary.expensesCents, expectedCashCents: summary.expectedCashCents,
      countedCashCents, differenceCents: countedCashCents - summary.expectedCashCents
    };
    this.write({ ...state, closings: [...state.closings, closing] });
    return closing;
  }

  private ensureOpenToday(state: FinanceState): void {
    if (state.closings.some(item => item.date === dateKey(new Date()))) {
      throw new Error('O caixa de hoje já foi fechado. Novos lançamentos estão bloqueados.');
    }
  }

  private nextId(state: FinanceState): number {
    return Math.max(0, ...state.movements.map(item => item.id)) + 1;
  }

  private requireMethod(method: PaymentMethod): void {
    if (!PAYMENT_METHODS.some(item => item.id === method)) throw new Error('Selecione uma forma de pagamento válida.');
  }

  private requireText(value: string, message: string): string {
    const text = value?.trim();
    if (!text) throw new Error(message);
    return text;
  }

  private current(): FinanceState {
    const state = this.read();
    if (!this.storageHealthy) throw new Error(this.error());
    this.state.set(state);
    return state;
  }

  private read(): FinanceState {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : { movements: [], closings: [] };
      if (!this.isState(parsed)) throw new Error('Dados financeiros inválidos.');
      this.storageHealthy = true;
      this.error.set('');
      return parsed;
    } catch {
      this.storageHealthy = false;
      this.error.set('Não foi possível ler os lançamentos financeiros salvos neste navegador.');
      return { movements: [], closings: [] };
    }
  }

  private isState(value: unknown): value is FinanceState {
    if (!value || typeof value !== 'object') return false;
    const state = value as Partial<FinanceState>;
    return Array.isArray(state.movements) && state.movements.every(item =>
      Number.isInteger(item.id) && Number.isFinite(Date.parse(item.occurredAt))
      && (item.orderId === null || Number.isInteger(item.orderId))
      && typeof item.description === 'string' && Number.isInteger(item.amountCents) && item.amountCents > 0
      && (item.type === 'RECEBIMENTO' || item.type === 'DESPESA')
      && PAYMENT_METHODS.some(method => method.id === item.method) && typeof item.responsible === 'string')
      && Array.isArray(state.closings) && state.closings.every(item =>
        typeof item.date === 'string' && Number.isFinite(Date.parse(item.closedAt))
        && typeof item.responsible === 'string' && Number.isInteger(item.cashCents)
        && Number.isInteger(item.pixCents) && Number.isInteger(item.cardCents)
        && Number.isInteger(item.expensesCents) && Number.isInteger(item.expectedCashCents)
        && Number.isInteger(item.countedCashCents) && Number.isInteger(item.differenceCents));
  }

  private write(state: FinanceState): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { throw new Error('Não foi possível salvar o lançamento neste navegador.'); }
    this.state.set(state);
    this.error.set('');
  }
}
