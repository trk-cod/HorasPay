namespace HorasPay.Domain;

public sealed record ResumenPeriodo(decimal HorasNormales, decimal HorasExtra, decimal TotalGanado, decimal PromedioPorDia, decimal? VariacionPct);
public sealed record PuntoAcumulado(DateOnly Fecha, decimal MontoAcumulado);
public sealed record Prediccion(decimal Minimo, decimal Esperado, decimal Maximo, decimal GanadoActual, int DiasLaborablesRestantes, string Explicacion);

public static class ServicioResumen
{
    public static ResumenPeriodo Crear(IEnumerable<Jornada> jornadas, IEnumerable<Jornada>? periodoAnterior = null)
    {
        var lista = jornadas.Where(x => x.EliminadoEnUtc is null).ToList();
        var ganado = lista.Sum(x => x.Monto);
        var anterior = periodoAnterior?.Where(x => x.EliminadoEnUtc is null).Sum(x => x.Monto);
        decimal? variacion = anterior is > 0 ? Decimal.Round((ganado - anterior.Value) / anterior.Value * 100m, 1) : null;
        return new ResumenPeriodo(lista.Sum(x => x.HorasNormales), lista.Sum(x => x.HorasExtra), ganado,
            lista.Count == 0 ? 0m : Decimal.Round(ganado / lista.Count, 2), variacion);
    }

    public static IReadOnlyList<PuntoAcumulado> Acumulado(IEnumerable<Jornada> jornadas) => jornadas
        .Where(x => x.EliminadoEnUtc is null)
        .OrderBy(x => x.Fecha)
        .GroupBy(x => x.Fecha)
        .Aggregate(new List<PuntoAcumulado>(), (puntos, grupo) =>
        {
            puntos.Add(new PuntoAcumulado(grupo.Key, (puntos.LastOrDefault()?.MontoAcumulado ?? 0m) + grupo.Sum(x => x.Monto)));
            return puntos;
        });
}

public static class ServicioPrediccion
{
    public static Prediccion CierreDeMes(IEnumerable<Jornada> jornadas, DateOnly hoy, IReadOnlySet<DayOfWeek> diasLaborables, int ultimosDias = 20)
    {
        var activas = jornadas.Where(x => x.EliminadoEnUtc is null).OrderBy(x => x.Fecha).ToList();
        var hastaHoy = activas.Where(x => x.Fecha <= hoy).ToList();
        var valores = hastaHoy.TakeLast(ultimosDias).Select(x => x.Monto).ToList();
        var promedio = valores.Count == 0 ? 0m : valores.Average();
        var desviacion = DesviacionEstandar(valores);
        var fin = new DateOnly(hoy.Year, hoy.Month, DateTime.DaysInMonth(hoy.Year, hoy.Month));
        var restantes = Enumerable.Range(1, fin.Day - hoy.Day).Select(hoy.AddDays).Count(x => diasLaborables.Contains(x.DayOfWeek));
        var ganado = hastaHoy.Where(x => x.Fecha.Month == hoy.Month && x.Fecha.Year == hoy.Year).Sum(x => x.Monto);
        var esperado = ganado + promedio * restantes;
        return new Prediccion(
            Decimal.Max(0m, Decimal.Round(ganado + (promedio - desviacion) * restantes, 2)),
            Decimal.Round(esperado, 2),
            Decimal.Round(ganado + (promedio + desviacion) * restantes, 2),
            ganado, restantes,
            $"Promedio de {valores.Count} jornadas recientes ± una desviación estándar, por {restantes} días laborables restantes.");
    }

    public static decimal DesviacionEstandar(IReadOnlyCollection<decimal> valores)
    {
        if (valores.Count < 2) return 0m;
        var promedio = valores.Average();
        var varianza = valores.Sum(x => (x - promedio) * (x - promedio)) / valores.Count;
        return Decimal.Round((decimal)Math.Sqrt((double)varianza), 2);
    }
}
