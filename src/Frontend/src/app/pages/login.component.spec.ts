import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;

  beforeEach(() => {
    component = new LoginComponent();
  });

  it('does not sign in with invalid email or missing password', () => {
    component.email.setValue('not-an-email');
    component.password.setValue('');

    component.signIn();

    expect(component.email.touched).toBeTrue();
    expect(component.password.touched).toBeTrue();
    expect(component.notice()).toBe('');
  });

  it('explains that password sign-in is not connected', () => {
    component.email.setValue('person@example.com');
    component.password.setValue('password123');

    component.signIn();

    expect(component.notice()).toContain('login por e-mail e senha');
    expect(component.notice()).toContain('Nenhum acesso foi realizado');
  });

  it('explains that password recovery is not available yet', () => {
    component.email.setValue('person@example.com');

    component.requestPasswordReset();

    expect(component.notice()).toContain('recuperação de senha estará disponível');
  });

  it('toggles password visibility', () => {
    expect(component.passwordVisible()).toBeFalse();

    component.togglePasswordVisibility();

    expect(component.passwordVisible()).toBeTrue();
  });

  it('explains that the selected SSO provider is not configured', () => {
    component.showProviderNotice('Microsoft');

    expect(component.notice()).toContain('Microsoft');
    expect(component.notice()).toContain('SSO for configurado');
  });
});
