import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'dashboard', title: 'Dashboard · HorasPay', loadComponent: () => import('./pages/dashboard.page').then(m => m.DashboardPage) },
  { path: 'registrar', title: 'Nueva jornada · HorasPay', loadComponent: () => import('./pages/registrar.page').then(m => m.RegistrarPage) },
  { path: 'historial', title: 'Historial · HorasPay', loadComponent: () => import('./pages/historial.page').then(m => m.HistorialPage) },
  { path: 'resumenes', title: 'Resúmenes · HorasPay', loadComponent: () => import('./pages/resumenes.page').then(m => m.ResumenesPage) },
  { path: 'prediccion', title: 'Predicción · HorasPay', loadComponent: () => import('./pages/prediccion.page').then(m => m.PrediccionPage) },
  { path: 'configuracion', title: 'Configuración · HorasPay', loadComponent: () => import('./pages/configuracion.page').then(m => m.ConfiguracionPage) },
  { path: 'ayuda', title: 'Ayuda · HorasPay', loadComponent: () => import('./pages/ayuda.page').then(m => m.AyudaPage) },
  { path: '**', redirectTo: 'dashboard' }
];
