import { Injectable, signal } from '@angular/core';
import { Appointment, SERVICES, ServiceType } from './crm.service';

export const OS_STAGES = [
  { id: 'AGUARDANDO', name: 'Aguardando' },
  { id: 'EM_LAVAGEM', name: 'Em lavagem' },
  { id: 'ACABAMENTO', name: 'Acabamento' },
  { id: 'PRONTO', name: 'Pronto' },
  { id: 'ENTREGUE', name: 'Entregue' }
] as const;
export type OsStage = (typeof OS_STAGES)[number]['id'];
export type PaymentStatus = 'PENDENTE' | 'PAGO';

const BASE_PRICES: Record<ServiceType, number> = { SIMPLES: 4500, COMPLETA: 7500, ENCERAMENTO: 11000 };
export const BASE_OS_SERVICES = SERVICES.map(service => ({ ...service, priceCents: BASE_PRICES[service.id] }));
export const EXTRA_OS_SERVICES = [
  { id: 'ASPIRACAO', name: 'Aspiração interna', priceCents: 2000 },
  { id: 'HIGIENIZACAO', name: 'Higienização de bancos', priceCents: 6000 },
  { id: 'POLIMENTO', name: 'Polimento rápido', priceCents: 5000 }
] as const;
export type ExtraServiceId = (typeof EXTRA_OS_SERVICES)[number]['id'];

export interface OsServiceLine {
  code: string;
  name: string;
  priceCents: number;
  kind: 'BASE' | 'EXTRA';
}
export interface OsHistoryEntry { stage: OsStage; at: string; by: string; }
export interface ServiceOrder {
  id: number;
  appointmentId: number | null;
  plate: string;
  vehicle: string;
  customer: string;
  enteredAt: string;
  responsible: string;
  notes: string;
  stage: OsStage;
  paymentStatus: PaymentStatus;
  services: OsServiceLine[];
  history: OsHistoryEntry[];
}
export interface WalkInInput {
  plate: string;
  vehicle: string;
  customer: string;
  service: ServiceType;
  responsible: string;
  notes: string;
}

const STORAGE_KEY = 'cwos.service-orders.demo.v1';

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}
export function stageName(stage: OsStage): string {
  return OS_STAGES.find(item => item.id === stage)?.name ?? stage;
}
export function nextStage(stage: OsStage): OsStage | null {
  const index = OS_STAGES.findIndex(item => item.id === stage);
  return index < 0 ? null : OS_STAGES[index + 1]?.id ?? null;
}
export function orderTotal(order: ServiceOrder): number {
  return order.services.reduce((total, service) => total + service.priceCents, 0);
}

@Injectable({ providedIn: 'root' })
export class PatioService {
  readonly error = signal('');
  private storageHealthy = true;
  readonly orders = signal<ServiceOrder[]>(this.read());

  refresh(): void { this.orders.set(this.read()); }

  checkIn(appointment: Appointment, responsible: string, notes: string): ServiceOrder {
    const orders = this.current();
    if (appointment.status === 'CONCLUIDO') throw new Error('Este agendamento já foi concluído.');
    if (orders.some(order => order.appointmentId === appointment.id)) {
      throw new Error('Este agendamento já possui uma ordem de serviço.');
    }
    this.ensureNoActivePlate(orders, appointment.licensePlate);
    return this.create(orders, {
      appointmentId: appointment.id,
      plate: appointment.licensePlate,
      vehicle: `${appointment.vehicleType} · ${appointment.vehicleModel}`,
      customer: appointment.customerName,
      service: appointment.service,
      responsible,
      notes
    });
  }

  openWalkIn(input: WalkInInput): ServiceOrder {
    const orders = this.current();
    this.ensureNoActivePlate(orders, input.plate);
    return this.create(orders, { ...input, appointmentId: null });
  }

  advance(id: number, responsible: string): ServiceOrder {
    const orders = this.current();
    const order = this.requireOrder(orders, id);
    const stage = nextStage(order.stage);
    if (!stage) throw new Error('Esta OS já foi entregue.');
    const by = this.requireText(responsible, 'Informe o responsável pela mudança de etapa.');
    const updated = { ...order, stage, responsible: by, history: [...order.history, { stage, at: new Date().toISOString(), by }] };
    this.save(orders.map(item => item.id === id ? updated : item));
    return updated;
  }

  addExtra(id: number, code: ExtraServiceId): ServiceOrder {
    const orders = this.current();
    const order = this.requireOpenOrder(orders, id);
    const extra = EXTRA_OS_SERVICES.find(item => item.id === code);
    if (!extra) throw new Error('Serviço extra não encontrado.');
    if (order.services.some(item => item.code === code)) throw new Error('Este serviço extra já está na OS.');
    const updated = { ...order, services: [...order.services, { code: extra.id, name: extra.name, priceCents: extra.priceCents, kind: 'EXTRA' as const }] };
    this.save(orders.map(item => item.id === id ? updated : item));
    return updated;
  }

  removeExtra(id: number, code: ExtraServiceId): ServiceOrder {
    const orders = this.current();
    const order = this.requireOpenOrder(orders, id);
    if (!order.services.some(item => item.code === code && item.kind === 'EXTRA')) {
      throw new Error('Serviço extra não encontrado nesta OS.');
    }
    const updated = { ...order, services: order.services.filter(item => item.code !== code) };
    this.save(orders.map(item => item.id === id ? updated : item));
    return updated;
  }

  markPaid(id: number): ServiceOrder {
    const orders = this.current();
    const order = this.requireOrder(orders, id);
    if (order.paymentStatus === 'PAGO') throw new Error('Esta OS já foi paga.');
    const updated: ServiceOrder = { ...order, paymentStatus: 'PAGO' };
    this.save(orders.map(item => item.id === id ? updated : item));
    return updated;
  }

  private create(orders: ServiceOrder[], input: WalkInInput & { appointmentId: number | null }): ServiceOrder {
    const plate = this.requireText(input.plate, 'Informe a placa.').replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(plate)) throw new Error('Informe uma placa válida.');
    const vehicle = this.requireText(input.vehicle, 'Informe o veículo.');
    const customer = this.requireText(input.customer, 'Informe o cliente.');
    const responsible = this.requireText(input.responsible, 'Informe o funcionário responsável.');
    const service = BASE_OS_SERVICES.find(item => item.id === input.service);
    if (!service) throw new Error('Selecione um serviço válido.');
    const enteredAt = new Date().toISOString();
    const order: ServiceOrder = {
      id: Math.max(0, ...orders.map(item => item.id)) + 1,
      appointmentId: input.appointmentId,
      plate, vehicle, customer, enteredAt, responsible,
      notes: input.notes.trim(), stage: 'AGUARDANDO', paymentStatus: 'PENDENTE',
      services: [{ code: service.id, name: service.name, priceCents: service.priceCents, kind: 'BASE' }],
      history: [{ stage: 'AGUARDANDO', at: enteredAt, by: responsible }]
    };
    this.save([...orders, order]);
    return order;
  }

  private ensureNoActivePlate(orders: ServiceOrder[], plate: string): void {
    const normalized = plate.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (orders.some(order => order.plate === normalized && order.stage !== 'ENTREGUE')) {
      throw new Error('Este veículo já possui uma OS aberta no pátio.');
    }
  }

  private requireOpenOrder(orders: ServiceOrder[], id: number): ServiceOrder {
    const order = this.requireOrder(orders, id);
    if (order.stage === 'ENTREGUE') throw new Error('Não é possível alterar serviços de uma OS entregue.');
    if (order.paymentStatus === 'PAGO') throw new Error('Não é possível alterar serviços de uma OS já paga.');
    return order;
  }

  private requireOrder(orders: ServiceOrder[], id: number): ServiceOrder {
    const order = orders.find(item => item.id === id);
    if (!order) throw new Error('Ordem de serviço não encontrada.');
    return order;
  }

  private requireText(value: string, message: string): string {
    const text = value?.trim();
    if (!text) throw new Error(message);
    return text;
  }

  private current(): ServiceOrder[] {
    const orders = this.read();
    if (!this.storageHealthy) throw new Error(this.error());
    this.orders.set(orders);
    return orders;
  }

  private read(): ServiceOrder[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      if (!Array.isArray(parsed) || !parsed.every(this.isOrder)) throw new Error('Dados de OS inválidos.');
      this.storageHealthy = true;
      this.error.set('');
      return parsed;
    } catch {
      this.storageHealthy = false;
      this.error.set('Não foi possível ler as ordens de serviço salvas neste navegador.');
      return [];
    }
  }

  private isOrder(value: unknown): value is ServiceOrder {
    if (!value || typeof value !== 'object') return false;
    const order = value as Partial<ServiceOrder>;
    return typeof order.id === 'number' && (order.appointmentId === null || typeof order.appointmentId === 'number')
      && typeof order.plate === 'string' && typeof order.vehicle === 'string'
      && typeof order.customer === 'string' && typeof order.enteredAt === 'string'
      && Number.isFinite(Date.parse(order.enteredAt))
      && typeof order.responsible === 'string' && typeof order.notes === 'string'
      && OS_STAGES.some(stage => stage.id === order.stage)
      && (order.paymentStatus === 'PENDENTE' || order.paymentStatus === 'PAGO')
      && Array.isArray(order.services) && order.services.length > 0 && order.services.every(item =>
        typeof item.code === 'string' && typeof item.name === 'string' && Number.isInteger(item.priceCents)
        && item.priceCents >= 0 && (item.kind === 'BASE' || item.kind === 'EXTRA'))
      && Array.isArray(order.history) && order.history.length > 0 && order.history.every(item =>
        OS_STAGES.some(stage => stage.id === item.stage) && typeof item.at === 'string'
        && Number.isFinite(Date.parse(item.at)) && typeof item.by === 'string');
  }

  private save(orders: ServiceOrder[]): void {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(orders)); }
    catch { throw new Error('Não foi possível salvar a OS neste navegador. Verifique o armazenamento local.'); }
    this.orders.set(orders);
    this.error.set('');
  }
}
