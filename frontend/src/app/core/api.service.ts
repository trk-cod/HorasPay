import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Jornada, Prediccion, Resumen, VistaPrevia } from './modelos';

export interface JornadaEntrada { fecha: string; entrada?: string | null; salida?: string | null; descansoMin: number; horasManual?: number | null; nota?: string | null; }

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = window.horasPay?.apiUrl ?? 'http://127.0.0.1:5157';
  health(): Observable<{ estado: string }> { return this.http.get<{ estado: string }>(`${this.base}/health`); }
  jornadas(): Observable<Jornada[]> { return this.http.get<Jornada[]>(`${this.base}/api/jornadas`); }
  preview(entrada: JornadaEntrada): Observable<VistaPrevia> { return this.http.post<VistaPrevia>(`${this.base}/api/jornadas/preview`, entrada); }
  crear(entrada: JornadaEntrada): Observable<Jornada> { return this.http.post<Jornada>(`${this.base}/api/jornadas`, entrada); }
  eliminar(id: string): Observable<void> { return this.http.delete<void>(`${this.base}/api/jornadas/${id}`); }
  restaurar(id: string): Observable<Jornada> { return this.http.post<Jornada>(`${this.base}/api/jornadas/${id}/restaurar`, {}); }
  acumulado(): Observable<{ fecha: string; montoAcumulado: number }[]> { return this.http.get<{ fecha: string; montoAcumulado: number }[]>(`${this.base}/api/resumenes/acumulado`); }
  semanal(): Observable<Resumen> { return this.http.get<Resumen>(`${this.base}/api/resumenes/semanal`); }
  prediccion(): Observable<Prediccion> { return this.http.get<Prediccion>(`${this.base}/api/resumenes/prediccion`); }
}
