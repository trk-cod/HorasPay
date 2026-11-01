import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({ standalone: true, imports: [FormsModule], template: `
  <header class="page-header"><div><p class="eyebrow">CUENTA CON NOSOTROS</p><h1>Ayuda</h1><p>Respuestas rápidas para seguir trabajando.</p></div></header>
  <section class="panel help"><label>Buscar en ayuda <input [(ngModel)]="busqueda" placeholder="Ej. hora extra"></label><h2>Atajos</h2><div class="shortcut-grid"><p><kbd>Ctrl N</kbd> Nueva jornada</p><p><kbd>Ctrl S</kbd> Guardar</p><p><kbd>Ctrl F</kbd> Buscar</p><p><kbd>Ctrl E</kbd> Exportar CSV</p><p><kbd>Ctrl Z</kbd> Deshacer</p><p><kbd>F1</kbd> Abrir ayuda</p></div><h2>Preguntas frecuentes</h2><details open><summary>¿Cómo se calculan las horas extra?</summary><p>Las horas que superan el umbral diario toman el multiplicador que definiste en Configuración.</p></details><details><summary>¿Necesito internet?</summary><p>No. Tus jornadas funcionan sin conexión. Solo las tasas y datos económicos se actualizan cuando hay internet.</p></details><details><summary>¿Dónde están mis datos?</summary><p>Se guardan solo en tu PC, en la carpeta de datos de HorasPay. Puedes exportar un respaldo cuando quieras.</p></details></section>`, styleUrl: '../../styles.scss' })
export class AyudaPage { busqueda = ''; }
