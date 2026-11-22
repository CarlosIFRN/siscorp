import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../shared/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  readonly email = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  readonly password = new FormControl('', { nonNullable: true, validators: [Validators.required] });
  readonly passwordVisible = signal(false);
  readonly notice = signal('');

  signIn(): void {
    this.email.markAsTouched();
    this.password.markAsTouched();
    this.notice.set('');
    if (this.email.invalid || this.password.invalid) return;

    this.notice.set('O login por e-mail e senha ainda não está conectado. Nenhum acesso foi realizado.');
  }

  togglePasswordVisibility(): void {
    this.passwordVisible.update(visible => !visible);
  }

  requestPasswordReset(): void {
    this.email.markAsTouched();
    this.notice.set(
      this.email.invalid
        ? 'Informe um e-mail válido para solicitar a redefinição de senha.'
        : 'A recuperação de senha estará disponível quando a autenticação for configurada.'
    );
  }

  showProviderNotice(provider: 'Google' | 'Microsoft'): void {
    this.notice.set(`O acesso com ${provider} estará disponível quando o SSO for configurado.`);
  }
}
