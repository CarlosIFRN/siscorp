import { TestBed } from '@angular/core/testing';
import { dateKey } from './crm.service';
import { FinanceService, parseMoneyCents } from './finance.service';
import { PatioService, ServiceOrder } from './patio.service';

describe('FinanceService', () => {
  const financeKey = 'cwos.finance.demo.v1';
  const patioKey = 'cwos.service-orders.demo.v1';
  let finance: FinanceService;
  let patio: PatioService;
  let order: ServiceOrder;

  beforeEach(() => {
    localStorage.removeItem(financeKey);
    localStorage.removeItem(patioKey);
    TestBed.configureTestingModule({});
    patio = TestBed.inject(PatioService);
    finance = TestBed.inject(FinanceService);
    order = patio.openWalkIn({ plate: 'ABC-1234', vehicle: 'Civic', customer: 'Ana',
      service: 'COMPLETA', responsible: 'Lia', notes: '' });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.removeItem(financeKey);
    localStorage.removeItem(patioKey);
  });

  function makeReady(): void {
    patio.advance(order.id, 'Lia');
    patio.advance(order.id, 'Lia');
    patio.advance(order.id, 'Lia');
  }

  it('registra somente o valor integral de uma OS pronta e impede baixa duplicada', () => {
    expect(() => finance.recordPayment(order.id, '75,00', 'PIX', 'Lia')).toThrowError(/Pronto ou Entregue/);
    makeReady();
    expect(() => finance.recordPayment(order.id, '74,99', 'PIX', 'Lia')).toThrowError(/integral/);
    expect(finance.state().movements.length).toBe(0);

    const receipt = finance.recordPayment(order.id, '75,00', 'PIX', 'Lia');
    expect(receipt.amountCents).toBe(7500);
    expect(receipt.method).toBe('PIX');
    expect(patio.orders()[0].stage).toBe('PRONTO');
    expect(patio.orders()[0].paymentStatus).toBe('PAGO');
    expect(finance.summary(dateKey(new Date())).receivedCents).toBe(7500);
    expect(() => finance.recordPayment(order.id, '75,00', 'PIX', 'Lia')).toThrowError(/já possui/);
    expect(() => patio.addExtra(order.id, 'ASPIRACAO')).toThrowError(/já paga/);
  });

  it('separa despesas e fecha o caixa com a diferença de dinheiro contado', () => {
    makeReady();
    finance.recordPayment(order.id, '75.00', 'DINHEIRO', 'Lia');
    expect(() => finance.recordExpense('Shampoo', 'INSUMOS', '20,00', 'DINHEIRO', 'Lia', 'FUNCIONARIO'))
      .toThrowError(/Somente ADMIN/);
    finance.recordExpense('Shampoo', 'INSUMOS', '20,00', 'DINHEIRO', 'Lia', 'ADMIN');
    const today = dateKey(new Date());
    const summary = finance.summary(today);
    expect(summary.receivedCents).toBe(7500);
    expect(summary.expensesCents).toBe(2000);
    expect(summary.balanceCents).toBe(5500);
    expect(summary.expectedCashCents).toBe(5500);
    expect(finance.movementsFor(today, 'DINHEIRO').length).toBe(2);
    expect(finance.movementsFor(today, 'PIX').length).toBe(0);

    expect(() => finance.closeDay(today, '54,50', 'Admin', 'FUNCIONARIO')).toThrowError(/Somente ADMIN/);
    const closing = finance.closeDay(today, '54,50', 'Admin', 'ADMIN');
    expect(closing.differenceCents).toBe(-50);
    expect(finance.historicalClosings('ADMIN')[0].date).toBe(today);
    expect(() => finance.historicalClosings('FUNCIONARIO')).toThrowError(/Somente ADMIN/);
    expect(() => finance.closeDay(today, '54,50', 'Admin', 'ADMIN')).toThrowError(/já foi fechado/);
    expect(() => finance.recordExpense('Outro', 'OUTROS', '1,00', 'PIX', 'Admin', 'ADMIN'))
      .toThrowError(/já foi fechado/);
  });

  it('persiste lançamentos e não grava dados sensíveis do meio de pagamento', () => {
    makeReady();
    finance.recordPayment(order.id, '75,00', 'CARTAO', 'Lia');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const reopened = TestBed.inject(FinanceService);
    expect(reopened.state().movements[0].method).toBe('CARTAO');
    expect(reopened.state().movements[0].amountCents).toBe(7500);
    expect(localStorage.getItem(financeKey)).not.toContain('numeroCartao');
  });

  it('valida centavos sem arredondar cobranças', () => {
    expect(parseMoneyCents('12,3')).toBe(1230);
    expect(parseMoneyCents('0', true)).toBe(0);
    expect(() => parseMoneyCents('12,345')).toThrowError(/até duas casas/);
    expect(() => parseMoneyCents('0')).toThrowError(/maior que zero/);
  });
});
