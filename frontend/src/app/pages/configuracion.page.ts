import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({ standalone: true, imports: [ReactiveFormsModule, MatButtonModule, MatCheckboxModule, MatFormFieldModule, MatInputModule], template: `
  <header class="page-header"><div><p class="eyebrow">A TU MANERA</p><h1>Configuración</h1><p>Estos valores se aplicarán a las jornadas nuevas; tus registros anteriores no cambian.</p></div></header>
  <form class="settings" [formGroup]="form" (ngSubmit)="guardar()">
    <section class="panel"><h2>Tarifa y horas extra</h2><div class="form-grid"><mat-form-field appearance="outline"><mat-label>Tarifa por hora (RD$)</mat-label><input matInput type="number" formControlName="tarifa" min="1"></mat-form-field><mat-form-field appearance="outline"><mat-label>Horas normales por día</mat-label><input matInput type="number" formControlName="umbral" min="0"></mat-form-field><mat-form-field appearance="outline"><mat-label>Multiplicador extra</mat-label><input matInput type="number" step=".05" formControlName="multiplicador" min="1"></mat-form-field></div><p class="muted">Ejemplo: ×1.5 significa que cada hora extra paga 50 % más.</p></section>
    <section class="panel"><h2>Moneda</h2><div class="form-grid"><mat-form-field appearance="outline"><mat-label>Moneda base</mat-label><input matInput formControlName="monedaBase" maxlength="3"></mat-form-field><mat-form-field appearance="outline"><mat-label>Moneda para mostrar</mat-label><input matInput formControlName="monedaVisual" maxlength="3"></mat-form-field></div><p class="muted">Tasas por <a href="https://www.exchangerate-api.com/" target="_blank" rel="noopener">ExchangeRate-API</a>. Se guardan hasta 24 h y la app funciona con la última tasa aun sin internet.</p></section>
    <section class="panel"><h2>Datos y apariencia</h2><label><input type="checkbox" formControlName="temaOscuro"> Usar tema oscuro</label><p><button mat-stroked-button type="button">Exportar respaldo</button> <button mat-stroked-button type="button">Importar respaldo</button></p><p class="muted">Los respaldos automáticos se conservan 14 días en Documentos/HorasPay/Respaldos.</p></section>
    <div class="actions"><button mat-flat-button color="primary" [disabled]="form.invalid">Guardar cambios</button></div>
  </form>`, styleUrl: '../../styles.scss' })
export class ConfiguracionPage { private readonly fb = inject(NonNullableFormBuilder); guardado = signal(false); form = this.fb.group({ tarifa: [200, [Validators.min(1)]], umbral: [8, [Validators.min(0)]], multiplicador: [1.5, [Validators.min(1)]], monedaBase: ['DOP'], monedaVisual: ['DOP'], temaOscuro: [false] }); guardar(): void { this.guardado.set(true); } }
