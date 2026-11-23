import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    component = TestBed.createComponent(LoginComponent).componentInstance;
    router = TestBed.inject(Router);
    spyOn(router, 'navigateByUrl').and.resolveTo(true);
  });

  it('does not open the dashboard with invalid email or missing password', () => {
    component.email.setValue('not-an-email');
    component.password.setValue('');

    component.signIn();

    expect(component.email.touched).toBeTrue();
    expect(component.password.touched).toBeTrue();
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('opens the dashboard with any valid email and non-empty password', () => {
    component.email.setValue('person@example.com');
    component.password.setValue('password123');

    component.signIn();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
  });

  it('opens the dashboard directly in demo mode without credentials', () => {
    component.enterDemo();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/dashboard');
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

});
