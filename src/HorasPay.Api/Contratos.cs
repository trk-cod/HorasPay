using HorasPay.Domain;

namespace HorasPay.Api;

public sealed record JornadaEntrada(DateOnly Fecha, TimeOnly? Entrada, TimeOnly? Salida, int DescansoMin, decimal? HorasManual, string? Nota);
public sealed record JornadaSalida(Guid Id, DateOnly Fecha, TimeOnly? Entrada, TimeOnly? Salida, int DescansoMin, decimal HorasNormales, decimal HorasExtra, decimal TarifaAplicada, decimal MultiplicadorAplicado, decimal Monto, string? Nota);
public sealed record PrevisualizacionSalida(decimal HorasNormales, decimal HorasExtra, decimal Monto, decimal TotalHoras, decimal Tarifa, decimal Multiplicador);
public sealed record ConfiguracionEntrada(decimal? TarifaActual, decimal UmbralDiario, decimal? UmbralSemanal, decimal Multiplicador, string MonedaBase, string MonedaVisualizacion, bool UsarTasaFija, decimal? TasaFija, string DiasLaborables, string Tema, bool BienvenidaCompletada);

public static class Mapeos
{
    public static JornadaSalida AContrato(this Jornada x) => new(x.Id, x.Fecha, x.Entrada, x.Salida, x.DescansoMin, x.HorasNormales, x.HorasExtra, x.TarifaAplicada, x.MultiplicadorAplicado, x.Monto, x.Nota);
}
