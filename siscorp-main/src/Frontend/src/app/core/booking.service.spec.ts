import { BookingService, dateKey } from './booking.service';

describe('BookingService', () => {
  let service: BookingService;
  let friday: string;
  beforeEach(() => {
    sessionStorage.removeItem('cwos.booking.v1');
    service = new BookingService();
    const next = new Date();
    next.setDate(next.getDate() + ((5 - next.getDay() + 7) % 7) + 7);
    friday = dateKey(next);
  });
  afterEach(() => sessionStorage.removeItem('cwos.booking.v1'));
  function completeDraft(): void {
    service.update({ customer: { name: 'Cliente Teste', phone: '(85) 99999-1234', email: 'teste@example.com' }, vehicle: { description: 'Moto, Honda, Vermelha, ABC-1234', service: 'simples' }, slot: { date: friday, hour: 14 }, payment: 'pix' });
  }
  it('requires customer, vehicle and slot before confirmation', () => {
    expect(service.confirm()).toBeFalse();
    expect(service.state().receipt).toBeNull();
  });
  it('rejects occupied and past slots even if assigned directly', () => {
    completeDraft();
    service.update({ slot: { date: friday, hour: 16 } });
    expect(service.confirm()).toBeFalse();
    service.update({ slot: { date: '2000-01-01', hour: 14 } });
    expect(service.confirm()).toBeFalse();
  });
  it('confirms once and retains occupied slots when starting again', () => {
    completeDraft();
    expect(service.confirm()).toBeTrue();
    const code = service.state().receipt!.code;
    expect(service.confirm()).toBeTrue();
    expect(service.state().receipt?.code).toBe(code);
    expect(service.state().reserved.length).toBe(1);
    service.reset();
    expect(service.state().customer.name).toBe('');
    expect(service.state().slot).toBeNull();
    expect(service.status(friday, 14)).toBe('busy');
  });
  it('keeps confirmed bookings in the dashboard history after starting a new draft', () => {
    completeDraft();
    expect(service.confirm()).toBeTrue();
    const code = service.state().receipt!.code;
    service.reset();
    expect(service.history().length).toBe(1);
    expect(service.history()[0].receipt.code).toBe(code);
    expect(service.history()[0].customer.name).toBe('Cliente Teste');
    expect(new BookingService().history()[0].receipt.code).toBe(code);
  });
  it('restores drafts from the current session', () => {
    completeDraft();
    expect(new BookingService().state()).toEqual(service.state());
  });
  it('recovers from corrupted session data', () => {
    sessionStorage.setItem('cwos.booking.v1', '{broken');
    expect(new BookingService().ready()).toBeFalse();
    sessionStorage.setItem('cwos.booking.v1', JSON.stringify({ customer: 5, vehicle: {} }));
    expect(new BookingService().state().customer.name).toBe('');
  });
  it('requires a new time when a confirmed draft is edited', () => {
    completeDraft();
    service.confirm();
    service.update({ customer: { name: 'Outro Cliente', phone: '(85) 98888-1234', email: 'outro@example.com' } });
    expect(service.state().receipt).toBeNull();
    expect(service.state().slot).toBeNull();
    expect(service.status(friday, 14)).toBe('busy');
  });
});
