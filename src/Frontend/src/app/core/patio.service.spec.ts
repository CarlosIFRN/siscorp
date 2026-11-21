import { Appointment, dateKey } from './crm.service';
import { orderTotal, PatioService } from './patio.service';

describe('PatioService', () => {
  const storageKey = 'cwos.service-orders.demo.v1';
  let service: PatioService;
  let appointment: Appointment;

  beforeEach(() => {
    localStorage.removeItem(storageKey);
    service = new PatioService();
    appointment = {
      id: 7, customerName: 'Ana Silva', phone: '84999990000', email: 'ana@example.com',
      vehicleType: 'Carro', vehicleModel: 'Civic', vehicleColor: 'Prata', licensePlate: 'ABC-1234',
      service: 'SIMPLES', date: dateKey(new Date()), hour: 14, status: 'AGENDADO',
      createdAt: new Date().toISOString()
    };
  });

  afterEach(() => localStorage.removeItem(storageKey));

  it('faz check-in uma única vez por agendamento e bloqueia outra OS ativa para a placa', () => {
    const order = service.checkIn(appointment, 'Carlos', 'Risco na porta');
    expect(order.appointmentId).toBe(7);
    expect(order.stage).toBe('AGUARDANDO');
    expect(order.paymentStatus).toBe('PENDENTE');
    expect(order.history[0].by).toBe('Carlos');
    expect(order.notes).toBe('Risco na porta');
    expect(() => service.checkIn(appointment, 'Carlos', '')).toThrowError(/já possui/);
    expect(() => service.openWalkIn({ plate: 'ABC1234', vehicle: 'Civic', customer: 'Ana', service: 'COMPLETA', responsible: 'Carlos', notes: '' })).toThrowError(/OS aberta/);
    expect(service.orders().length).toBe(1);
  });

  it('avança apenas pela sequência, registra responsável e mantém pagamento separado', () => {
    const order = service.checkIn(appointment, 'Carlos', '');
    for (const stage of ['EM_LAVAGEM', 'ACABAMENTO', 'PRONTO', 'ENTREGUE'] as const) {
      const updated = service.advance(order.id, 'Marina');
      expect(updated.stage).toBe(stage);
      expect(updated.history.at(-1)?.by).toBe('Marina');
      expect(updated.history.at(-1)?.at).toBeTruthy();
      expect(updated.paymentStatus).toBe('PENDENTE');
    }
    expect(service.orders()[0].history.length).toBe(5);
    expect(() => service.advance(order.id, 'Marina')).toThrowError(/entregue/);
  });

  it('recalcula extras e persiste a OS avulsa entre sessões', () => {
    const order = service.openWalkIn({ plate: 'def-5678', vehicle: 'HB20', customer: 'Bruno', service: 'COMPLETA', responsible: 'Lia', notes: '' });
    expect(order.plate).toBe('DEF5678');
    expect(orderTotal(order)).toBe(7500);
    const withExtra = service.addExtra(order.id, 'ASPIRACAO');
    expect(orderTotal(withExtra)).toBe(9500);
    expect(() => service.addExtra(order.id, 'ASPIRACAO')).toThrowError(/já está/);
    const reopened = new PatioService();
    expect(reopened.orders()[0].services.length).toBe(2);
    expect(orderTotal(reopened.removeExtra(order.id, 'ASPIRACAO'))).toBe(7500);
    for (let i = 0; i < 4; i++) reopened.advance(order.id, 'Lia');
    expect(() => reopened.addExtra(order.id, 'ASPIRACAO')).toThrowError(/entregue/);
  });

  it('não sobrescreve dados locais inválidos', () => {
    localStorage.setItem(storageKey, '{invalido');
    const reopened = new PatioService();
    expect(reopened.error()).toContain('Não foi possível ler');
    expect(() => reopened.checkIn(appointment, 'Carlos', '')).toThrowError(/Não foi possível ler/);
    expect(localStorage.getItem(storageKey)).toBe('{invalido');
  });
});
