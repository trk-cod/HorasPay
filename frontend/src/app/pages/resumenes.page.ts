import { Component, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { ApiService } from '../core/api.service';
import { DineroPipe } from '../core/money.pipe';
import { Resumen } from '../core/modelos';

@Component({ standalone: true, imports: [DineroPipe, DecimalPipe], template: `
  <header class="page-header"><div><p class="eyebrow">MIRA EL PANORAMA</p><h1>Resúmenes</h1><p>Una vista sencilla de tu semana.</p></div><button class="subtle-button" (click)="mostrarCalculo.set(!mostrarCalculo())">ⓘ ¿Cómo se calcula?</button></header>
  @if (mostrarCalculo()) { <aside class="explanation">Sumamos tus jornadas de lunes a domingo. Las horas que superan tu umbral se cuentan como extra y usan el multiplicador configurado.</aside> }
  <section class="kpis three"> <article class="kpi blue"><span>Horas normales</span><strong>{{resumen()?.horasNormales ?? 0 | number:'1.0-1'}} h</strong></article><article class="kpi orange"><span>Horas extra</span><strong>{{resumen()?.horasExtra ?? 0 | number:'1.0-1'}} h</strong></article><article class="kpi emerald"><span>Total ganado</span><strong>{{resumen()?.totalGanado ?? 0 | dinero}}</strong><small>Promedio {{resumen()?.promedioPorDia ?? 0 | dinero}} / día</small></article></section>
  <section class="panel"><div class="panel-heading"><div><h2>Esta semana</h2><p>De lunes a domingo</p></div><span class="pill">Semanal</span></div><div class="summary-bars"><div><span>Lun</span><i style="width:70%"></i></div><div><span>Mar</span><i style="width:85%"></i></div><div><span>Mié</span><i style="width:60%"></i></div><div><span>Jue</span><i style="width:90%"></i></div><div><span>Vie</span><i style="width:45%"></i></div></div></section>
  <details class="panel economy"><summary>Contexto económico (opcional)</summary><p>Actívalo en Configuración para ver PIB e inflación. No afecta tus montos ni cálculos.</p></details>`, styleUrl: '../../styles.scss' })
export class ResumenesPage { private readonly api = inject(ApiService); resumen = signal<Resumen | null>(null); mostrarCalculo = signal(false); constructor() { this.api.semanal().subscribe(x => this.resumen.set(x)); } }
