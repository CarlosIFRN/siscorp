import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookingService, SERVICES } from '../core/booking.service';
import { IconComponent } from '../shared/icon.component';

@Component({ selector: 'app-vehicle', standalone: true, imports: [ReactiveFormsModule, RouterLink, IconComponent], templateUrl: './vehicle.component.html' })
export class VehicleComponent {
  readonly booking = inject(BookingService);
  readonly services = SERVICES;
  private readonly router = inject(Router);
  readonly form = inject(FormBuilder).nonNullable.group({
    description: [this.booking.state().vehicle.description, [Validators.required, Validators.maxLength(150), Validators.pattern(/^\s*[^,\s][^,]*,\s*[^,\s][^,]*,\s*[^,\s][^,]*,\s*[^,\s][^,]*$/)]],
    service: [this.booking.state().vehicle.service, Validators.required]
  });
  constructor() { this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.booking.update({ vehicle: this.form.getRawValue() })); }
  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) { requestAnimationFrame(() => document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()); return; }
    void this.router.navigateByUrl('/agenda-da-semana');
  }
}
