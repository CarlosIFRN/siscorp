import { Injectable, computed, signal } from '@angular/core';

export interface Customer { name: string; phone: string; email: string; }
export interface Vehicle { description: string; service: string; }
export interface Slot { date: string; hour: number; }
export type Payment = 'pix' | 'card' | 'cash';
export interface Receipt { code: string; createdAt: string; }
export interface BookingRecord { customer: Customer; vehicle: Vehicle; slot: Slot; payment: Payment; receipt: Receipt; }
interface BookingState {
  customer: Customer; vehicle: Vehicle; slot: Slot | null;
  payment: Payment | ''; receipt: Receipt | null; reserved: Slot[]; history: BookingRecord[];
}
export const SERVICES = [
  { id: 'simples', name: 'Lavagem simples', description: 'Limpeza externa para renovar o visual do seu veículo.', duration: '30 min' },
  { id: 'completa', name: 'Lavagem completa', description: 'Cuidado por dentro e por fora, com limpeza e aspiração.', duration: '60 min' },
  { id: 'enceramento', name: 'Lavagem + enceramento', description: 'Limpeza completa e uma camada extra de brilho e proteção.', duration: '60 min' }
] as const;
const empty = (): BookingState => ({ customer: { name: '', phone: '', email: '' }, vehicle: { description: '', service: '' }, slot: null, payment: '', receipt: null, reserved: [], history: [] });
const STORAGE_KEY = 'cwos.booking.v1';

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function fromKey(key: string): Date { return new Date(`${key}T12:00:00`); }
export function formatSlot(slot: Slot | null): string {
  if (!slot) return 'Escolha um horário';
  return `${new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(fromKey(slot.date))}, às ${slot.hour}h`;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  readonly state = signal<BookingState>(this.restore());
  readonly customerReady = computed(() => {
    const c = this.state().customer;
    return c.name.trim().length >= 3 && /^\S+@\S+\.\S+$/.test(c.email) && [10, 11].includes(c.phone.replace(/\D/g, '').length);
  });
  readonly vehicleReady = computed(() => this.state().vehicle.description.split(',').filter(p => p.trim()).length === 4 && SERVICES.some(s => s.id === this.state().vehicle.service));
  readonly selectedService = computed(() => SERVICES.find(s => s.id === this.state().vehicle.service));
  readonly ready = computed(() => this.customerReady() && this.vehicleReady() && !!this.state().slot);
  readonly paymentLabel = computed(() => ({ pix: 'Pix', card: 'Cartão', cash: 'Dinheiro' }[this.state().payment || 'pix']));
  readonly history = computed(() => this.state().history);

  update(patch: Partial<Pick<BookingState, 'customer' | 'vehicle' | 'slot' | 'payment'>>): void {
    const current = this.state();
    this.commit({ ...current, ...(current.receipt ? { slot: null } : {}), ...patch, receipt: null });
  }

  status(date: string, hour: number): 'available' | 'busy' | 'progress' | 'past' {
    const moment = fromKey(date);
    moment.setHours(hour, 0, 0, 0);
    if (moment.getTime() <= Date.now()) return 'past';
    if (this.state().reserved.some(slot => slot.date === date && slot.hour === hour)) return 'busy';
    // Grade ilustrativa do protótipo; substituir pelo retorno da API de disponibilidade.
    const pattern = [[0, 0, 2, 0, 0, 0, 1], [1, 0, 1, 0, 1, 0, 0], [1, 1, 0, 1, 1, 0, 0], [0, 1, 0, 1, 0, 1, 1]];
    const value = pattern[hour - 13]?.[moment.getDay()] ?? 0;
    return value === 1 ? 'busy' : value === 2 ? 'progress' : 'available';
  }

  confirm(): boolean {
    const current = this.state();
    if (current.receipt) return true;
    if (!this.ready() || !current.payment || !current.slot || this.status(current.slot.date, current.slot.hour) !== 'available') return false;
    const receipt = { code: `CW-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, createdAt: new Date().toISOString() };
    this.commit({ ...current, reserved: [...current.reserved, current.slot], receipt,
      history: [...current.history, { customer: { ...current.customer }, vehicle: { ...current.vehicle }, slot: { ...current.slot }, payment: current.payment, receipt }] });
    return true;
  }

  reset(): void { this.commit({ ...empty(), reserved: this.state().reserved, history: this.state().history }); }

  private commit(value: BookingState): void {
    this.state.set(value);
    try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value)); } catch { /* A navegação continua sem armazenamento. */ }
  }

  private restore(): BookingState {
    try {
      const raw = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (!raw || !raw.customer || !raw.vehicle || !['name', 'phone', 'email'].every(k => typeof raw.customer[k] === 'string') || typeof raw.vehicle.description !== 'string' || typeof raw.vehicle.service !== 'string') return empty();
      const validSlot = (s: unknown): s is Slot => !!s && typeof s === 'object' && 'date' in s && typeof s.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.date) && !isNaN(fromKey(s.date).getTime()) && 'hour' in s && [13, 14, 15, 16].includes(s.hour as number);
      return {
        customer: raw.customer, vehicle: raw.vehicle,
        slot: validSlot(raw.slot) ? raw.slot : null,
        payment: ['pix', 'card', 'cash'].includes(raw.payment) ? raw.payment : '',
        receipt: typeof raw.receipt?.code === 'string' && typeof raw.receipt?.createdAt === 'string' ? raw.receipt : null,
        reserved: Array.isArray(raw.reserved) ? raw.reserved.filter(validSlot) : [],
        history: Array.isArray(raw.history) ? raw.history.filter((item: unknown): item is BookingRecord => {
          if (!item || typeof item !== 'object') return false;
          const record = item as Partial<BookingRecord>;
          return typeof record.customer?.name === 'string' && typeof record.vehicle?.description === 'string'
            && typeof record.vehicle?.service === 'string' && validSlot(record.slot)
            && ['pix', 'card', 'cash'].includes(record.payment || '')
            && typeof record.receipt?.code === 'string' && typeof record.receipt?.createdAt === 'string';
        }) : []
      };
    } catch { return empty(); }
  }
}
