import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export interface AuthUser {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  ativo: boolean;
  tipoUsuario: 'Admin' | 'Funcionario' | 'Cliente';
}

interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  usuario: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly userState = signal<AuthUser | null>(null);
  readonly user = this.userState.asReadonly();
  private accessToken: string | null = null;
  private refreshPending: Promise<boolean> | null = null;

  get token(): string | null {
    return this.accessToken;
  }

  async login(email: string, senha: string): Promise<void> {
    await this.csrf();
    const response = await firstValueFrom(this.http.post<AuthResponse>('/api/auth/login', { email, senha }));
    this.save(response);
  }

  async restore(): Promise<boolean> {
    return this.accessToken !== null || this.renew();
  }

  renew(): Promise<boolean> {
    if (!this.refreshPending) {
      this.refreshPending = this.refresh().finally(() => {
        this.refreshPending = null;
      });
    }
    return this.refreshPending;
  }

  async logout(): Promise<void> {
    await this.csrf();
    await firstValueFrom(this.http.post<void>('/api/auth/logout', {}));
    this.clear();
  }

  private async refresh(): Promise<boolean> {
    try {
      await this.csrf();
      const response = await firstValueFrom(this.http.post<AuthResponse>('/api/auth/refresh', {}));
      this.save(response);
      return true;
    } catch {
      this.clear();
      return false;
    }
  }

  private async csrf(): Promise<void> {
    await firstValueFrom(this.http.get<void>('/api/auth/csrf'));
  }

  private save(response: AuthResponse): void {
    this.accessToken = response.accessToken;
    this.userState.set(response.usuario);
  }

  private clear(): void {
    this.accessToken = null;
    this.userState.set(null);
  }
}
