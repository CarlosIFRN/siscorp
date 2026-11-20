import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, apiError } from '../core/auth.service';

@Component({ selector: 'app-login', standalone: true, imports: [FormsModule, RouterLink], templateUrl: './login.component.html' })
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  email = '';
  password = '';
  readonly busy = this.auth.busy;
  readonly error = signal('');

  async submit(): Promise<void> {
    this.error.set('');
    if (!this.email.trim() || !this.password) { this.error.set('Informe e-mail e senha.'); return; }
    try {
      await this.auth.signIn(this.email, this.password);
      this.password = '';
      await this.router.navigateByUrl('/dashboard');
    } catch (error) { this.error.set(apiError(error, 'Não foi possível entrar. Tente novamente.')); }
  }
}
