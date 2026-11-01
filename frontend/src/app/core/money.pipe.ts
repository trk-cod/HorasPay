import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'dinero', standalone: true })
export class DineroPipe implements PipeTransform {
  transform(monto: number | null | undefined, moneda = 'DOP'): string {
    return new Intl.NumberFormat('es-DO', { style: 'currency', currency: moneda, minimumFractionDigits: 2 }).format(monto ?? 0);
  }
}
