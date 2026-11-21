import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { apiError } from '../core/api-error';
import { ApiUser, UserInput, UsersApiService } from '../core/users-api.service';

@Component({ selector: 'app-users', standalone: true, imports: [FormsModule], templateUrl: './users.component.html' })
export class UsersComponent {
  private readonly api = inject(UsersApiService);
  readonly users = signal<ApiUser[]>([]);
  readonly loading = signal(false);
  readonly loaded = signal(false);
  readonly available = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly notice = signal('');
  readonly editingId = signal<number | null>(null);
  readonly confirmingId = signal<number | null>(null);
  form: UserInput = this.emptyForm();

  async load(): Promise<void> {
    this.loading.set(true); this.loaded.set(true); this.error.set('');
    try { this.users.set(await this.api.list()); this.available.set(true); }
    catch (error) { this.users.set([]); this.available.set(false); this.error.set(apiError(error, 'Não foi possível carregar os usuários.')); }
    finally { this.loading.set(false); }
  }

  startCreate(): void { this.editingId.set(null); this.form = this.emptyForm(); this.error.set(''); }
  async startEdit(id: number): Promise<void> {
    this.error.set('');
    try {
      const user = await this.api.get(id);
      this.form = { nome: user.nome, email: user.email, telefone: user.telefone,
        senha: '', tipoUsuario: user.tipoUsuario };
      this.editingId.set(id);
      document.getElementById('user-form-title')?.scrollIntoView({ behavior: 'smooth' });
    } catch (error) { this.error.set(apiError(error, 'Não foi possível consultar o usuário.')); }
  }

  async save(): Promise<void> {
    this.error.set(''); this.notice.set('');
    const input: UserInput = { nome: this.form.nome.trim(), email: this.form.email.trim(),
      telefone: this.form.telefone.trim(), tipoUsuario: this.form.tipoUsuario };
    if (this.form.senha) input.senha = this.form.senha;
    if (!input.nome || !input.email || !input.telefone || (this.editingId() === null && !input.senha)) {
      this.error.set('Preencha nome, e-mail, telefone e senha para novos usuários.'); return;
    }
    this.saving.set(true);
    try {
      const id = this.editingId();
      if (id === null) await this.api.create(input);
      else await this.api.update(id, input);
      this.notice.set(id === null ? 'Usuário criado no servidor.' : 'Usuário atualizado no servidor.');
      this.startCreate();
      await this.load();
    } catch (error) { this.error.set(apiError(error, 'Não foi possível salvar o usuário.')); }
    finally { this.saving.set(false); }
  }

  async deactivate(id: number): Promise<void> {
    this.error.set(''); this.notice.set('');
    if (this.confirmingId() !== id) { this.confirmingId.set(id); return; }
    this.saving.set(true);
    try {
      await this.api.deactivate(id);
      this.notice.set('Usuário desativado no servidor.');
      this.confirmingId.set(null);
      await this.load();
    } catch (error) { this.error.set(apiError(error, 'Não foi possível desativar o usuário.')); }
    finally { this.saving.set(false); }
  }

  private emptyForm(): UserInput {
    return { nome: '', email: '', telefone: '', senha: '', tipoUsuario: 'Funcionario' };
  }
}
