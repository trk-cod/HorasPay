import { Component, inject, signal } from '@angular/core';
import { ApiService } from '../core/api.service';
import { Prediccion } from '../core/modelos';
import { DineroPipe } from '../core/money.pipe';

@Component({ standalone: true, imports: [DineroPipe], template: `
  <header class="page-header"><div><p class="eyebrow">PLANIFICA TRANQUILO</p><h1>Predicción</h1><p>Una estimación basada en tus propias jornadas recientes.</p></div></header>
  <section class="prediction-hero"><span>Cierre estimado del mes</span><strong>{{prediccion()?.esperado ?? 0 | dinero}}</strong><p>Ganado hasta hoy: <b>{{prediccion()?.ganadoActual ?? 0 | dinero}}</b> · {{prediccion()?.diasLaborablesRestantes ?? 0}} días laborables restantes</p><div class="range"><span>{{prediccion()?.minimo ?? 0 | dinero}}</span><i></i><b>Esperado</b><i></i><span>{{prediccion()?.maximo ?? 0 | dinero}}</span></div></section>
  <section class="panel"><h2>¿Cómo se calcula?</h2><p>{{prediccion()?.explicacion || 'Registra algunas jornadas para crear una predicción.'}}</p><p class="muted">El rango es una orientación, no una promesa: refleja las variaciones de tus días trabajados.</p></section>`, styleUrl: '../../styles.scss' })
export class PrediccionPage { private readonly api = inject(ApiService); prediccion = signal<Prediccion | null>(null); constructor() { this.api.prediccion().subscribe(x => this.prediccion.set(x)); } }
