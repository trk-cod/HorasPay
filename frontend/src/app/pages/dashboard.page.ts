import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { DineroPipe } from '../core/money.pipe';
import { Jornada, Resumen } from '../core/modelos';

@Component({
  standalone: true, imports: [BaseChartDirective, RouterLink, DineroPipe, DecimalPipe, DatePipe],
  template: `
    <header class="page-header"><div><p class="eyebrow">TU DINERO, CLARO</p><h1>Dashboard</h1><p>Así va tu trabajo y lo que llevas ganado.</p></div><a class="primary-action" routerLink="/registrar">＋ Nueva jornada <kbd>Ctrl N</kbd></a></header>
    <section class="kpis" aria-label="Indicadores principales">
      <article class="kpi blue"><span>Esta semana</span><strong>{{ semanal()?.totalGanado ?? 0 | dinero }}</strong><small>{{ semanal()?.horasNormales ?? 0 | number:'1.0-1' }} h normales</small></article>
      <article class="kpi emerald"><span>Este mes</span><strong>{{ totalMes() | dinero }}</strong><small>Cuánto llevas ganado</small></article>
      <article class="kpi orange"><span>Horas extra</span><strong>{{ extras() | number:'1.0-1' }} h</strong><small>en tus jornadas</small></article>
      <article class="kpi slate"><span>Acumulado</span><strong>{{ acumulado() | dinero }}</strong><small>{{ jornadas().length }} jornadas registradas</small></article>
    </section>
    <section class="panel chart-panel"><div class="panel-heading"><div><h2>Ganancia acumulada</h2><p>Tu avance a lo largo del tiempo</p></div><span class="pill">Todo el tiempo</span></div><canvas baseChart [data]="chartData()" [options]="chartOptions" type="line" aria-label="Gráfico de ganancia acumulada"></canvas></section>
    <section class="panel"><div class="panel-heading"><div><h2>Últimas jornadas</h2><p>Lo más reciente que registraste</p></div><a routerLink="/historial">Ver historial</a></div>
      @if (jornadas().length) { <div class="recent-list">@for (jornada of jornadas().slice(0, 4); track jornada.id) { <div><b>{{ jornada.fecha | date:'EEE d MMM':'':'es-DO' }}</b><span>{{ jornada.entrada || 'Manual' }}–{{ jornada.salida || jornada.horasNormales + ' h' }}</span><small>{{ jornada.horasExtra ? jornada.horasExtra + ' h extra' : 'Sin extras' }}</small><strong>{{ jornada.monto | dinero }}</strong></div> }</div> }
      @else { <div class="empty-state"><span>◷</span><h3>Aún no has registrado una jornada</h3><p>Empieza con la de hoy; toma menos de un minuto.</p><a class="primary-action" routerLink="/registrar">Registrar mi primera jornada</a></div> }
    </section>`,
  styleUrl: '../../styles.scss'
})
export class DashboardPage {
  private readonly api = inject(ApiService); private readonly destroyRef = inject(DestroyRef);
  jornadas = signal<Jornada[]>([]); semanal = signal<Resumen | null>(null); chartData = signal<ChartData<'line'>>({ labels: [], datasets: [{ data: [], label: 'Ganado', borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,.12)', fill: true, tension: .35 }] });
  chartOptions: ChartOptions<'line'> = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { ticks: { callback: value => new Intl.NumberFormat('es-DO', { style: 'currency', currency: 'DOP', maximumFractionDigits: 0 }).format(Number(value)) } } } };
  constructor() {
    this.api.jornadas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: value => this.jornadas.set(value), error: () => this.jornadas.set([]) });
    this.api.semanal().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: value => this.semanal.set(value) });
    this.api.acumulado().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(value => this.chartData.set({ labels: value.map(x => x.fecha), datasets: [{ data: value.map(x => x.montoAcumulado), label: 'Ganado', borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,.12)', fill: true, tension: .35 }] }));
  }
  acumulado = () => this.jornadas().reduce((suma, x) => suma + x.monto, 0);
  extras = () => this.jornadas().reduce((suma, x) => suma + x.horasExtra, 0);
  totalMes = () => { const mes = new Date().toISOString().slice(0, 7); return this.jornadas().filter(x => x.fecha.startsWith(mes)).reduce((suma, x) => suma + x.monto, 0); };
}
