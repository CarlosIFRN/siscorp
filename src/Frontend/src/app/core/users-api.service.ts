import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiUser, UserRole } from './auth.service';

export interface UserInput {
  nome: string;
  email: string;
  telefone: string;
  senha?: string;
  tipoUsuario: UserRole;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  list(): Promise<ApiUser[]> { return firstValueFrom(this.http.get<ApiUser[]>('/api/usuarios')); }
  get(id: number): Promise<ApiUser> { return firstValueFrom(this.http.get<ApiUser>(`/api/usuarios/${id}`)); }
  create(input: UserInput): Promise<ApiUser> { return firstValueFrom(this.http.post<ApiUser>('/api/usuarios', input)); }
  update(id: number, input: UserInput): Promise<ApiUser> {
    return firstValueFrom(this.http.put<ApiUser>(`/api/usuarios/${id}`, input));
  }
  deactivate(id: number): Promise<void> { return firstValueFrom(this.http.delete<void>(`/api/usuarios/${id}`)); }
}
