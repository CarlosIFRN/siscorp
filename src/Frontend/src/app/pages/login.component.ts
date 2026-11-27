import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);
  readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  readonly password = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  readonly form = new FormGroup({ email: this.email, password: this.password });
  readonly passwordVisible = signal(false);
  readonly loading = signal(false);
  readonly notice = signal('');

  constructor() {
    const url = new URL(window.location.href);
    if (url.searchParams.has('email') || url.searchParams.has('password')) {
      url.searchParams.delete('email');
      url.searchParams.delete('password');
      window.history.replaceState(window.history.state, '', url.pathname + url.search + url.hash);
    }
  }

  async signIn(): Promise<void> {
    this.email.markAsTouched();
    this.password.markAsTouched();
    this.notice.set('');
    if (this.email.invalid || this.password.invalid || this.loading()) return;

    this.loading.set(true);
    try {
      await this.auth.login(this.email.value, this.password.value);
      const requested = this.route.snapshot.queryParamMap.get('returnUrl');
      const destination = requested?.startsWith('/') && !requested.startsWith('//')
        ? requested : '/dashboard';
      await this.router.navigateByUrl(destination);
    } catch (error) {
      this.notice.set(error instanceof HttpErrorResponse && error.status === 401
        ? 'E-mail ou senha inválidos.'
        : 'Não foi possível entrar. Verifique a conexão com o servidor.');
    } finally {
      this.loading.set(false);
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update(visible => !visible);
  }

  requestPasswordReset(): void {
    this.email.markAsTouched();
    this.notice.set(
      this.email.invalid
        ? 'Informe um e-mail válido para solicitar a redefinição de senha.'
        : 'A recuperação de senha ainda não está disponível.'
    );
  }
}
