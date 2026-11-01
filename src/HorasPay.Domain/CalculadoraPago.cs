namespace HorasPay.Domain;

public sealed record ResultadoJornada(decimal HorasNormales, decimal HorasExtra, decimal Monto, decimal TotalHoras);

/// <summary>Reglas de negocio sin dependencias de base de datos ni interfaz.</summary>
public static class CalculadoraPago
{
    public static ResultadoJornada Calcular(
        TimeOnly entrada,
        TimeOnly salida,
        int descansoMin,
        decimal tarifaPorHora,
        ReglaExtras regla,
        decimal horasYaTrabajadasSemana = 0m)
    {
        if (tarifaPorHora <= 0) throw new ArgumentOutOfRangeException(nameof(tarifaPorHora), "La tarifa debe ser positiva.");
        if (regla.UmbralDiario < 0 || regla.Multiplicador < 1) throw new ArgumentException("La regla de extras no es válida.");

        var inicio = entrada.ToTimeSpan();
        var fin = salida.ToTimeSpan();
        if (fin <= inicio) fin += TimeSpan.FromDays(1);
        var duracion = fin - inicio - TimeSpan.FromMinutes(descansoMin);
        if (duracion <= TimeSpan.Zero) throw new ArgumentException("El descanso debe ser menor que la duración de la jornada.");

        var horas = Decimal.Round((decimal)duracion.TotalMinutes / 60m, 2, MidpointRounding.AwayFromZero);
        var normales = Decimal.Min(horas, regla.UmbralDiario);
        var extras = horas - normales;

        if (regla.UmbralSemanal is { } umbralSemanal)
        {
            var normalesDisponibles = Decimal.Max(0m, umbralSemanal - horasYaTrabajadasSemana);
            var normalesReclasificadas = Decimal.Min(normales, normalesDisponibles);
            extras += normales - normalesReclasificadas;
            normales = normalesReclasificadas;
        }

        var monto = Decimal.Round(normales * tarifaPorHora + extras * tarifaPorHora * regla.Multiplicador, 2, MidpointRounding.AwayFromZero);
        return new ResultadoJornada(normales, extras, monto, horas);
    }

    public static ResultadoJornada CalcularHorasManual(decimal horas, decimal tarifaPorHora, ReglaExtras regla, decimal horasYaTrabajadasSemana = 0m)
    {
        if (horas <= 0) throw new ArgumentOutOfRangeException(nameof(horas));
        if (tarifaPorHora <= 0) throw new ArgumentOutOfRangeException(nameof(tarifaPorHora));
        var normales = Decimal.Min(horas, regla.UmbralDiario);
        var extras = horas - normales;
        if (regla.UmbralSemanal is { } umbral)
        {
            var disponibles = Decimal.Max(0m, umbral - horasYaTrabajadasSemana);
            var reclasificadas = Decimal.Min(normales, disponibles);
            extras += normales - reclasificadas;
            normales = reclasificadas;
        }
        var monto = Decimal.Round(normales * tarifaPorHora + extras * tarifaPorHora * regla.Multiplicador, 2, MidpointRounding.AwayFromZero);
        return new ResultadoJornada(normales, extras, monto, horas);
    }
}
