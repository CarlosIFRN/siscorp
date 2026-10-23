import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CrmService, Appointment, AppointmentInput, SERVICES, ServiceType, dateKey, formatSlot } from '../core/crm.service';
import { IconComponent } from '../shared/icon.component';

@Component({ selector: 'app-public-booking', standalone: true, imports: [ReactiveFormsModule, RouterLink, IconComponent], templateUrl: './public-booking.component.html' })
export class PublicBookingComponent {
  private readonly fb = inject(FormBuilder);
  private readonly crm = inject(CrmService);
  readonly services = SERVICES;
  readonly hours = [13, 14, 15, 16];
  readonly today = dateKey(new Date());
  readonly busyHours = signal<number[]>([]);
  readonly loadingHours = signal(false);
  readonly availabilityFailed = signal(false);
  readonly submitting = signal(false);
  readonly error = signal('');
  readonly success = signal<Appointment | null>(null);
  readonly formatSlot = formatSlot;
  readonly form = this.fb.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    phone: ['', [Validators.required, Validators.pattern(/^\(?\d{2}\)?\s?\d{4,5}[-\s]?\d{4}$/)]],
    email: ['', [Validators.required, Validators.email]],
    vehicleType: ['', Validators.required],
    vehicleModel: ['', Validators.required],
    vehicleColor: ['', Validators.required],
    licensePlate: ['', [Validators.required, Validators.pattern(/^[A-Za-z]{3}-?[0-9][A-Za-z0-9][0-9]{2}$/)]],
    service: ['', Validators.required],
    date: ['', Validators.required],
    hour: this.fb.control<number | null>(null, Validators.required)
  });
  invalid(name: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[name];
    return control.touched && control.invalid;
  }
  async dateChanged(): Promise<void> {
    const date = this.form.controls.date.value;
    this.form.controls.hour.setValue(null);
    this.busyHours.set([]);
    this.availabilityFailed.set(false);
    this.error.set('');
    if (!date || date < this.today) return;
    this.loadingHours.set(true);
    try {
      const busy = await this.crm.availability(date);
      if (this.form.controls.date.value === date) this.busyHours.set(busy);
    } catch {
      if (this.form.controls.date.value === date) {
        this.availabilityFailed.set(true);
        this.error.set('Não foi possível consultar os horários neste navegador.');
      }
    }
    finally { if (this.form.controls.date.value === date) this.loadingHours.set(false); }
  }
  unavailable(hour: number): boolean {
    const date = this.form.controls.date.value;
    return !date || date < this.today || this.loadingHours() || this.availabilityFailed() || this.busyHours().includes(hour) || `${date}T${String(hour).padStart(2, '0')}:00` <= this.nowKey();
  }
  selectHour(hour: number): void { if (!this.unavailable(hour)) this.form.controls.hour.setValue(hour); }
  async submit(): Promise<void> {
    this.form.markAllAsTouched();
    this.error.set('');
    const hour = this.form.controls.hour.value;
    if (this.form.invalid || hour === null || this.unavailable(hour)) { this.error.set('Revise os campos e escolha um horário disponível.'); return; }
    this.submitting.set(true);
    const raw = this.form.getRawValue();
    const input: AppointmentInput = { ...raw, customerName: raw.customerName.trim(), email: raw.email.trim(), licensePlate: raw.licensePlate.trim().toUpperCase(), service: raw.service as ServiceType, hour };
    try { this.success.set(await this.crm.create(input)); }
    catch (error: any) {
      await this.dateChanged();
      this.error.set(error?.status === 409 ? 'Esse horário acabou de ser ocupado. Escolha outro.' : 'Não foi possível salvar neste navegador. Confira o armazenamento local e tente novamente.');
    } finally { this.submitting.set(false); }
  }
  reset(): void { this.form.reset(); this.success.set(null); this.busyHours.set([]); this.availabilityFailed.set(false); this.error.set(''); }
  private nowKey(): string { const now = new Date(); return `${dateKey(now)}T${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`; }
}
