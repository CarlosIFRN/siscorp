import { HttpClient, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export type UserRole = 'Admin' | 'Funcionario' | 'Cliente';
export interface ApiUser {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  tipoUsuario: UserRole;
}

@Injectable({ providedIn: 'root' })
export class BasicCredentials {
  private header = '';
  get value(): string { return this.header; }
  set(email: string, password: string): void {
    const bytes = new TextEncoder().encode(`${email}:${password}`);
    this.header = `Basic ${btoa(String.fromCharCode(...bytes))}`;
  }
  clear(): void { this.header = ''; }
}

export const basicAuthInterceptor: HttpInterceptorFn = (request, next) => {
  const header = inject(BasicCredentials).value;
  return next(header && request.url.startsWith('/api/')
    ? request.clone({ setHeaders: { Authorization: header } }) : request);
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly credentials = inject(BasicCredentials);
  readonly user = signal<ApiUser | null>(null);
  readonly busy = signal(false);

  async signIn(email: string, password: string): Promise<ApiUser> {
    this.busy.set(true);
    this.credentials.set(email.trim(), password);
    try {
      const user = await firstValueFrom(this.http.get<ApiUser>('/api/auth/me'));
      this.user.set(user);
      return user;
    } catch (error) {
      this.signOut();
      throw error;
    } finally { this.busy.set(false); }
  }

  signOut(): void { this.credentials.clear(); this.user.set(null); }
}

export function apiError(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) return 'Não foi possível conectar ao Spring Boot. Verifique se a API está em execução.';
    if (error.status === 401) return 'Credenciais inválidas ou sessão encerrada. Entre novamente.';
    if (error.status === 403) return 'Sua conta não tem permissão para esta operação.';
    if (error.status === 404) return 'Registro não encontrado no servidor.';
    if (error.status === 409) return 'Já existe um registro com estes dados ou há conflito com outro registro.';
    if (error.status === 400) return 'Dados inválidos. Confira os campos e tente novamente.';
  }
  return fallback;
}
