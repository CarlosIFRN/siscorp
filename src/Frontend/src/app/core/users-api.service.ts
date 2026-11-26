import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
export type UserRole = 'Admin' | 'Funcionario' | 'Cliente';
export interface ApiUser {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  tipoUsuario: UserRole;
  idEmpresa?: number | null;
}

export interface ApiCompany {
  id: number;
  nome: string;
  cnpj: string;
}

export interface UserInput {
  nome: string;
  email: string;
  telefone: string;
  senha?: string;
  tipoUsuario: UserRole;
  idEmpresa?: number | null;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  list(): Promise<ApiUser[]> { return firstValueFrom(this.http.get<ApiUser[]>('/api/usuarios')); }
  listCompanies(): Promise<ApiCompany[]> { return firstValueFrom(this.http.get<ApiCompany[]>('/api/empresas')); }
  get(id: number): Promise<ApiUser> { return firstValueFrom(this.http.get<ApiUser>(`/api/usuarios/${id}`)); }
  create(input: UserInput): Promise<ApiUser> { return firstValueFrom(this.http.post<ApiUser>('/api/usuarios', input)); }
  update(id: number, input: UserInput): Promise<ApiUser> {
    return firstValueFrom(this.http.put<ApiUser>(`/api/usuarios/${id}`, input));
  }
  deactivate(id: number): Promise<void> { return firstValueFrom(this.http.delete<void>(`/api/usuarios/${id}`)); }
}
