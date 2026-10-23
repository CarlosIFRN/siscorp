import { Injectable, computed, signal } from '@angular/core';

export type ServiceType = 'SIMPLES' | 'COMPLETA' | 'ENCERAMENTO';
export type AppointmentStatus = 'AGENDADO' | 'EM_LAVAGEM' | 'PRONTO' | 'CONCLUIDO';
export interface AppointmentInput {
  customerName: string; phone: string; email: string;
  vehicleType: string; vehicleModel: string; vehicleColor: string; licensePlate: string;
  service: ServiceType; date: string; hour: number;
}
export interface Appointment extends AppointmentInput {
  id: number; status: AppointmentStatus; createdAt: string;
}
export const SERVICES: { id: ServiceType; name: string; duration: string }[] = [
  { id: 'SIMPLES', name: 'Lavagem simples', duration: '30 min' },
  { id: 'COMPLETA', name: 'Lavagem completa', duration: '60 min' },
  { id: 'ENCERAMENTO', name: 'Lavagem + enceramento', duration: '60 min' }
];
export const STATUSES: { id: AppointmentStatus; name: string }[] = [
  { id: 'AGENDADO', name: 'Agendado' }, { id: 'EM_LAVAGEM', name: 'Em lavagem' },
  { id: 'PRONTO', name: 'Pronto' }, { id: 'CONCLUIDO', name: 'Concluído' }
];
const STORAGE_KEY = 'cwos.appointments.demo.v1';

export function dateKey(date: Date): string { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function fromKey(key: string): Date { return new Date(`${key}T12:00:00`); }
export function serviceName(id: ServiceType): string { return SERVICES.find(item => item.id === id)?.name || id; }
export function statusName(id: AppointmentStatus): string { return STATUSES.find(item => item.id === id)?.name || id; }
export function formatSlot(item: { date: string; hour: number }): string {
  return `${new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(fromKey(item.date))} · ${item.hour}:00`;
}

function exampleAppointments(): Appointment[] {
  const today = new Date();
  const day = (offset: number): string => { const date = new Date(today); date.setDate(today.getDate() + offset); return dateKey(date); };
  const base = { phone: '(84) 99999-0000', email: 'exemplo@cwos.local', vehicleType: 'Carro', vehicleColor: 'Prata', createdAt: today.toISOString() };
  return [
    { ...base, id: 1, customerName: 'Cliente exemplo · Ana', vehicleModel: 'Honda Civic', licensePlate: 'ABC-1234', service: 'SIMPLES', date: day(0), hour: 13, status: 'AGENDADO' },
    { ...base, id: 2, customerName: 'Cliente exemplo · Bruno', vehicleModel: 'Toyota Corolla', licensePlate: 'DEF-5678', service: 'COMPLETA', date: day(0), hour: 15, status: 'EM_LAVAGEM' },
    { ...base, id: 3, customerName: 'Cliente exemplo · Carla', vehicleModel: 'Fiat Argo', licensePlate: 'GHI-9012', service: 'ENCERAMENTO', date: day(1), hour: 14, status: 'AGENDADO' },
    { ...base, id: 4, customerName: 'Cliente exemplo · Diego', vehicleModel: 'Hyundai HB20', licensePlate: 'JKL-3456', service: 'SIMPLES', date: day(0), hour: 16, status: 'PRONTO' },
    { ...base, id: 5, customerName: 'Cliente exemplo · Elisa', vehicleModel: 'Chevrolet Onix', licensePlate: 'PQR-3456', service: 'COMPLETA', date: day(3), hour: 16, status: 'AGENDADO' }
  ];
}

@Injectable({ providedIn: 'root' })
export class CrmService {
  readonly appointments = signal<Appointment[]>(this.read());
  readonly loading = signal(false);
  readonly error = signal('');
  readonly today = computed(() => this.appointments().filter(item => item.date === dateKey(new Date())));
  readonly upcoming = computed(() => {
    const now = Date.now();
    return this.appointments().filter(item => item.status !== 'CONCLUIDO' && new Date(`${item.date}T${String(item.hour).padStart(2, '0')}:00:00`).getTime() >= now)
      .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour);
  });

  async refresh(): Promise<void> {
    this.error.set('');
    this.appointments.set(this.read());
  }

  async updateStatus(id: number, status: AppointmentStatus): Promise<void> {
    const items = this.appointments().map(item => item.id === id ? { ...item, status } : item);
    this.save(items);
  }

  async create(input: AppointmentInput): Promise<Appointment> {
    const items = this.read();
    if (items.some(item => item.date === input.date && item.hour === input.hour)) throw { status: 409 };
    const appointment: Appointment = { ...input, id: Math.max(0, ...items.map(item => item.id)) + 1, status: 'AGENDADO', createdAt: new Date().toISOString() };
    this.save([...items, appointment]);
    return appointment;
  }

  async availability(date: string): Promise<number[]> {
    return this.read().filter(item => item.date === date).map(item => item.hour);
  }

  private read(): Appointment[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed as Appointment[] : [];
      }
      const examples = exampleAppointments();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(examples));
      return examples;
    } catch {
      return [];
    }
  }

  private save(items: Appointment[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    this.appointments.set(items);
  }
}
