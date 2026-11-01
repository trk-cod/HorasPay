import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from './core/api.service';

@Component({
  selector: 'hp-root', standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatSelectModule],
  template: `
    <div class="app-shell">
      <aside class="sidebar" aria-label="Navegación principal">
        <a class="brand" routerLink="/dashboard" aria-label="HorasPay, inicio"><span>◷</span> HorasPay</a>
        <nav>
          @for (item of enlaces; track item.ruta) { <a [routerLink]="item.ruta" routerLinkActive="activo"><span>{{item.icono}}</span>{{item.texto}}</a> }
        </nav>
        <a class="help-link" routerLink="/ayuda">? Ayuda y atajos</a>
      </aside>
      <main class="content"><router-outlet /></main>
      <footer class="statusbar" aria-live="polite">
        <span [class.offline]="!conectado()" class="dot"></span>{{ conectado() ? 'Datos listos' : 'Comprobando tus datos…' }}
        <span class="status-separator">·</span><span>Moneda</span>
        <select aria-label="Moneda de visualización" (change)="moneda.set($any($event.target).value)"><option value="DOP">RD$</option><option value="USD">US$</option></select>
        <span>1 US$ ≈ RD$ 60.50 · última tasa guardada</span>
      </footer>
    </div>`,
  styleUrl: '../styles.scss'
})
export class AppComponent {
  private readonly api = inject(ApiService); private readonly router = inject(Router);
  conectado = signal(false); moneda = signal('DOP');
  enlaces = [{ ruta: '/dashboard', texto: 'Dashboard', icono: '⌂' }, { ruta: '/registrar', texto: 'Registrar', icono: '+' }, { ruta: '/historial', texto: 'Historial', icono: '☷' }, { ruta: '/resumenes', texto: 'Resúmenes', icono: '▥' }, { ruta: '/prediccion', texto: 'Predicción', icono: '↗' }, { ruta: '/configuracion', texto: 'Configuración', icono: '⚙' }];
  constructor() { this.api.health().subscribe({ next: () => this.conectado.set(true), error: () => this.conectado.set(false) }); window.horasPay?.onNavigate(ruta => void this.router.navigateByUrl(ruta)); }
}
