import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '../core/api.service';
import { DineroPipe } from '../core/money.pipe';
import { Jornada } from '../core/modelos';

@Component({ standalone: true, imports: [FormsModule, MatButtonModule, DineroPipe, DecimalPipe, DatePipe], template: `
  <header class="page-header"><div><p class="eyebrow">TODO EN ORDEN</p><h1>Historial</h1><p>Busca, revisa o corrige tus jornadas.</p></div><button mat-stroked-button (click)="exportar()">↓ Exportar CSV <kbd>Ctrl E</kbd></button></header>
  <section class="panel"><div class="filters"><label>Buscar <input [(ngModel)]="buscar" placeholder="Nota o proyecto"></label><label>Desde <input type="date" [(ngModel)]="desde"></label><label>Hasta <input type="date" [(ngModel)]="hasta"></label></div>
  <div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Horario</th><th>Normales</th><th>Extras</th><th>Ganado</th><th aria-label="Acciones"></th></tr></thead><tbody>@for (item of filtradas(); track item.id) { <tr><td>{{item.fecha | date:'dd/MM/yyyy'}}</td><td>{{item.entrada || 'Manual'}} {{item.salida ? '– ' + item.salida : ''}}</td><td>{{item.horasNormales | number:'1.0-2'}} h</td><td class="extra">{{item.horasExtra | number:'1.0-2'}} h</td><td><b>{{item.monto | dinero}}</b></td><td><button mat-button color="warn" (click)="eliminar(item)">Eliminar</button></td></tr> } @empty { <tr><td colspan="6"><div class="empty-state"><span>☷</span><h3>No hay jornadas que mostrar</h3><p>Registra la primera cuando estés listo.</p></div></td></tr> }</tbody><tfoot><tr><td colspan="4">Total visible</td><td><b>{{total() | dinero}}</b></td><td></td></tr></tfoot></table></div></section>
  @if (ultimoEliminado()) { <div class="undo-bar" role="status">Jornada eliminada. <button (click)="deshacer()">Deshacer</button></div> }`, styleUrl: '../../styles.scss' })
export class HistorialPage {
  private readonly api = inject(ApiService); private readonly destroyRef = inject(DestroyRef); jornadas = signal<Jornada[]>([]); ultimoEliminado = signal<Jornada | null>(null); buscar = ''; desde = ''; hasta = ''; private undoTimeout?: ReturnType<typeof setTimeout>;
  constructor() { this.cargar(); }
  cargar(): void { this.api.jornadas().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({ next: x => this.jornadas.set(x) }); }
  filtradas = () => this.jornadas().filter(x => (!this.desde || x.fecha >= this.desde) && (!this.hasta || x.fecha <= this.hasta) && (!this.buscar || (x.nota ?? '').toLocaleLowerCase().includes(this.buscar.toLocaleLowerCase())));
  total = () => this.filtradas().reduce((s, x) => s + x.monto, 0);
  eliminar(item: Jornada): void { this.api.eliminar(item.id).subscribe(() => { this.jornadas.update(x => x.filter(j => j.id !== item.id)); this.ultimoEliminado.set(item); clearTimeout(this.undoTimeout); this.undoTimeout = setTimeout(() => this.ultimoEliminado.set(null), 8000); }); }
  deshacer(): void { const item = this.ultimoEliminado(); if (!item) return; this.api.restaurar(item.id).subscribe(j => { this.jornadas.update(x => [j, ...x]); this.ultimoEliminado.set(null); }); }
  exportar(): void { window.open('http://127.0.0.1:5157/api/jornadas/csv', '_blank'); }
}
