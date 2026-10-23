import { Component, computed, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CrmService, dateKey, formatSlot, serviceName, statusName } from '../core/crm.service';
import { IconComponent } from '../shared/icon.component';

@Component({ selector: 'app-dashboard', standalone: true, imports: [RouterLink, IconComponent], templateUrl: './dashboard.component.html' })
export class DashboardComponent implements OnInit {
  readonly crm = inject(CrmService);
  readonly todayKey = dateKey(new Date());
  readonly todayLabel = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(new Date());
  readonly formatSlot = formatSlot;
  readonly serviceName = serviceName;
  readonly statusName = statusName;
  readonly inProgress = computed(() => this.crm.appointments().filter(item => item.status === 'EM_LAVAGEM').length);
  readonly ready = computed(() => this.crm.appointments().filter(item => item.status === 'PRONTO').length);
  readonly scheduled = computed(() => this.crm.appointments().filter(item => item.status === 'AGENDADO').length);
  readonly next = computed(() => this.crm.upcoming().slice(0, 6));
  ngOnInit(): void { void this.crm.refresh(); }
}
