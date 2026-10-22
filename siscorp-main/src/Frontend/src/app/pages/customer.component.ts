import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookingService } from '../core/booking.service';
import { IconComponent } from '../shared/icon.component';

@Component({ selector: 'app-customer', standalone: true, imports: [ReactiveFormsModule, IconComponent], templateUrl: './customer.component.html' })
export class CustomerComponent {
  readonly booking = inject(BookingService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  readonly form = this.fb.nonNullable.group({
    name: [this.booking.state().customer.name, [Validators.required, Validators.pattern(/.*\S.{2,}/), Validators.maxLength(100)]],
    phone: [this.booking.state().customer.phone, [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}$/)]],
    email: [this.booking.state().customer.email, [Validators.required, Validators.email, Validators.pattern(/^\S+@\S+\.\S+$/), Validators.maxLength(100)]]
  });
  constructor() { this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.booking.update({ customer: this.form.getRawValue() })); }
  invalid(name: 'name' | 'phone' | 'email'): boolean { return this.form.controls[name].touched && this.form.controls[name].invalid; }
  formatPhone(): void {
    const raw = this.form.controls.phone.value.replace(/\D/g, '').slice(0, 11);
    if (raw.length >= 10) this.form.controls.phone.setValue(`(${raw.slice(0, 2)}) ${raw.slice(2, -4)}-${raw.slice(-4)}`);
  }
  submit(): void {
    this.form.controls.name.setValue(this.form.controls.name.value.trim());
    this.form.controls.email.setValue(this.form.controls.email.value.trim());
    this.form.markAllAsTouched();
    if (this.form.invalid) { requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return; }
    void this.router.navigateByUrl('/formulario_cliente-servico');
  }
}
