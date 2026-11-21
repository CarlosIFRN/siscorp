import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type ServerAppointmentStatus = 'AGENDADO' | 'EM_LAVAGEM' | 'PRONTO' | 'CONCLUIDO' | 'CANCELADO';
export interface ServerAppointment {
  idAgendamento: number;
  idVeiculo: number;
  idServico: number;
  dataHora: string;
  status: ServerAppointmentStatus;
}
export interface ServerAppointmentInput {
  idVeiculo: number;
  idServico: number;
  dataHora: string;
  status?: ServerAppointmentStatus;
}

@Injectable({ providedIn: 'root' })
export class AppointmentsApiService {
  private readonly http = inject(HttpClient);
  list(date?: string): Promise<ServerAppointment[]> {
    const params = date ? new HttpParams().set('data', date) : undefined;
    return firstValueFrom(this.http.get<ServerAppointment[]>('/api/agendamentos', { params }));
  }
  get(id: number): Promise<ServerAppointment> {
    return firstValueFrom(this.http.get<ServerAppointment>(`/api/agendamentos/${id}`));
  }
  create(input: ServerAppointmentInput): Promise<ServerAppointment> {
    return firstValueFrom(this.http.post<ServerAppointment>('/api/agendamentos', input));
  }
  update(id: number, input: ServerAppointmentInput): Promise<ServerAppointment> {
    return firstValueFrom(this.http.put<ServerAppointment>(`/api/agendamentos/${id}`, input));
  }
  delete(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`/api/agendamentos/${id}`));
  }
}
