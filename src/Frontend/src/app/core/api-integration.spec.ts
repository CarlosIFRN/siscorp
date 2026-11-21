import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApiUser, UsersApiService } from './users-api.service';
import { AppointmentsApiService } from './appointments-api.service';

describe('integração HTTP da API', () => {
  let http: HttpTestingController;
  const admin: ApiUser = { id: 1, nome: 'Ana', email: 'ana@example.com', telefone: '84999990000',
    ativo: true, tipoUsuario: 'Admin' };

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting()
    ] });
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('envia o CRUD de usuários aos endpoints existentes', async () => {
    const api = TestBed.inject(UsersApiService);
    const list = api.list();
    const listed = http.expectOne('/api/usuarios');
    expect(listed.request.method).toBe('GET');
    expect(listed.request.headers.has('Authorization')).toBeFalse();
    listed.flush([admin]);
    expect((await list)[0].email).toBe(admin.email);

    const created = api.create({ nome: 'Bia', email: 'bia@example.com', telefone: '84999990001',
      senha: 'senha1234', tipoUsuario: 'Funcionario' });
    const posted = http.expectOne('/api/usuarios');
    expect(posted.request.method).toBe('POST');
    expect(posted.request.body.tipoUsuario).toBe('Funcionario');
    posted.flush({ ...admin, id: 2, nome: 'Bia' });
    await created;

    const deactivated = api.deactivate(2);
    const deleted = http.expectOne('/api/usuarios/2');
    expect(deleted.request.method).toBe('DELETE');
    deleted.flush(null);
    await deactivated;
  });

  it('consulta e atualiza agendamentos usando os IDs e o formato da API', async () => {
    const api = TestBed.inject(AppointmentsApiService);
    const list = api.list('2030-02-10');
    const queried = http.expectOne(req => req.url === '/api/agendamentos' && req.params.get('data') === '2030-02-10');
    expect(queried.request.method).toBe('GET');
    queried.flush([{ idAgendamento: 4, idVeiculo: 2, idServico: 3,
      dataHora: '2030-02-10T13:00:00', status: 'AGENDADO' }]);
    expect((await list)[0].idVeiculo).toBe(2);

    const updated = api.update(4, { idVeiculo: 2, idServico: 3,
      dataHora: '2030-02-10T13:00:00', status: 'PRONTO' });
    const put = http.expectOne('/api/agendamentos/4');
    expect(put.request.method).toBe('PUT');
    expect(put.request.body.status).toBe('PRONTO');
    put.flush({ idAgendamento: 4, ...put.request.body });
    expect((await updated).status).toBe('PRONTO');
  });
});
