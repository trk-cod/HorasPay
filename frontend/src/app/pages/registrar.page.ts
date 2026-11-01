import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { debounceTime, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService, JornadaEntrada } from '../core/api.service';
import { VistaPrevia } from '../core/modelos';
import { DineroPipe } from '../core/money.pipe';
import { interpretarEntradaRapida } from '../core/entrada-rapida';

@Component({
  standalone: true, imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, DineroPipe],
  template: `
    <header class="page-header"><div><p class="eyebrow">REGISTRA EN SEGUNDOS</p><h1>Nueva jornada</h1><p>Indica tus horarios y verás el cálculo antes de guardar.</p></div></header>
    <form class="entry-layout" [formGroup]="form" (ngSubmit)="guardar()">
      <section class="panel form-panel"><label class="quick-entry">Entrada rápida <input #rapida placeholder="hoy 8-17:30 d60" (keyup.enter)="interpretar(rapida.value)" aria-describedby="quick-help"><span id="quick-help">Ejemplo: hoy 8-17:30 d60</span></label>
        <div class="form-grid"><mat-form-field appearance="outline"><mat-label>Fecha</mat-label><input matInput type="date" formControlName="fecha"></mat-form-field><mat-form-field appearance="outline"><mat-label>Entrada</mat-label><input matInput type="time" step="300" formControlName="entrada"></mat-form-field><mat-form-field appearance="outline"><mat-label>Salida</mat-label><input matInput type="time" step="300" formControlName="salida"></mat-form-field><mat-form-field appearance="outline"><mat-label>Descanso (min)</mat-label><input matInput type="number" min="0" formControlName="descansoMin"></mat-form-field></div>
        <mat-form-field appearance="outline" class="wide"><mat-label>Nota (opcional)</mat-label><input matInput formControlName="nota" placeholder="Ej. Proyecto de nómina"></mat-form-field>
        @if (form.hasError('horario')) { <p class="field-error">La salida debe ser posterior a la entrada. Para cruzar medianoche, usa una salida anterior.</p> }
        <div class="actions"><button type="button" mat-button (click)="cancelar()">Cancelar</button><button mat-flat-button color="primary" type="submit" [disabled]="form.invalid || guardando()">Guardar jornada <kbd>Ctrl S</kbd></button></div>
      </section>
      <aside class="preview" aria-live="polite"><span class="preview-label">VISTA PREVIA EN VIVO</span>@if (previsualizacion()) { <div class="preview-row"><span>Horas normales</span><b>{{previsualizacion()!.horasNormales}} h</b></div><div class="preview-row"><span>Horas extra</span><b class="extra">{{previsualizacion()!.horasExtra}} h</b></div><div class="preview-row"><span>Tarifa</span><b>{{previsualizacion()!.tarifa | dinero}}/h · ×{{previsualizacion()!.multiplicador}}</b></div><hr><div class="total"><span>Total estimado</span><strong>{{previsualizacion()!.monto | dinero}}</strong></div> } @else { <p>Completa horarios válidos para ver cuánto ganarás.</p> }</aside>
    </form>`,
  styleUrl: '../../styles.scss'
})
export class RegistrarPage {
  private readonly fb = inject(NonNullableFormBuilder); private readonly api = inject(ApiService); private readonly router = inject(Router); private readonly destroyRef = inject(DestroyRef);
  form = this.fb.group({ fecha: [new Date().toISOString().slice(0, 10), Validators.required], entrada: ['08:00', Validators.required], salida: ['17:30', Validators.required], descansoMin: [60, [Validators.required, Validators.min(0)]], nota: [''] });
  previsualizacion = signal<VistaPrevia | null>(null); guardando = signal(false);
  constructor() { this.form.valueChanges.pipe(startWith(this.form.getRawValue()), debounceTime(180), takeUntilDestroyed(this.destroyRef)).subscribe(() => this.actualizarVista()); this.actualizarVista(); }
  private datos(): JornadaEntrada { const v = this.form.getRawValue(); return { fecha: v.fecha, entrada: v.entrada, salida: v.salida, descansoMin: v.descansoMin, nota: v.nota || null }; }
  actualizarVista(): void { if (this.form.invalid) return; this.api.preview(this.datos()).subscribe({ next: v => this.previsualizacion.set(v), error: () => this.previsualizacion.set(null) }); }
  interpretar(texto: string): void { const valores = interpretarEntradaRapida(texto); if (valores) this.form.patchValue(valores); }
  guardar(): void { if (this.form.invalid) return; this.guardando.set(true); this.api.crear(this.datos()).subscribe({ next: () => this.router.navigateByUrl('/dashboard'), error: () => this.guardando.set(false) }); }
  cancelar(): void { this.router.navigateByUrl('/dashboard'); }
}
