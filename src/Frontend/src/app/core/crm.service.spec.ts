import { AppointmentInput, CrmService, dateKey } from './crm.service';

describe('CrmService', () => {
  const storageKey = 'cwos.appointments.demo.v1';
  let service: CrmService;
  let input: AppointmentInput;

  beforeEach(() => {
    localStorage.removeItem(storageKey);
    service = new CrmService();
    const date = new Date();
    date.setDate(date.getDate() + 10);
    input = {
      customerName: 'Cliente Teste', phone: '(84) 99999-1234', email: 'teste@example.com',
      vehicleType: 'Carro', vehicleModel: 'Civic', vehicleColor: 'Prata', licensePlate: 'ABC-1234',
      service: 'SIMPLES', date: dateKey(date), hour: 14
    };
  });

  afterEach(() => localStorage.removeItem(storageKey));

  it('shows a public booking in the management agenda and blocks a duplicate slot', async () => {
    const created = await service.create(input);
    expect(service.appointments().some(item => item.id === created.id)).toBeTrue();
    expect(await service.availability(input.date)).toContain(14);
    await expectAsync(service.create(input)).toBeRejectedWith(jasmine.objectContaining({ status: 409 }));
  });

  it('keeps status changes after opening a new session', async () => {
    const created = await service.create(input);
    await service.updateStatus(created.id, 'EM_LAVAGEM');
    expect(new CrmService().appointments().find(item => item.id === created.id)?.status).toBe('EM_LAVAGEM');
  });
});
