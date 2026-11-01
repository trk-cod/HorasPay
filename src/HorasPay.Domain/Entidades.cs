namespace HorasPay.Domain;

public sealed class Jornada
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateOnly Fecha { get; set; }
    public TimeOnly? Entrada { get; set; }
    public TimeOnly? Salida { get; set; }
    public int DescansoMin { get; set; }
    public decimal HorasNormales { get; set; }
    public decimal HorasExtra { get; set; }
    public decimal TarifaAplicada { get; set; }
    public decimal MultiplicadorAplicado { get; set; }
    public decimal Monto { get; set; }
    public string? Nota { get; set; }
    public DateTime CreadoEnUtc { get; set; } = DateTime.UtcNow;
    public DateTime? EliminadoEnUtc { get; set; }

    public decimal TotalHoras => HorasNormales + HorasExtra;
}

public sealed class Tarifa
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public decimal ValorHora { get; set; }
    public DateOnly VigenteDesde { get; set; }
}

public sealed class ReglaExtras
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public decimal UmbralDiario { get; set; } = 8m;
    public decimal? UmbralSemanal { get; set; }
    public decimal Multiplicador { get; set; } = 1.5m;
    public bool Activa { get; set; } = true;
}

public sealed class Configuracion
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string MonedaBase { get; set; } = "DOP";
    public string MonedaVisualizacion { get; set; } = "DOP";
    public bool UsarTasaFija { get; set; }
    public decimal? TasaFija { get; set; }
    public DayOfWeek InicioSemana { get; set; } = DayOfWeek.Monday;
    public string DiasLaborables { get; set; } = "1,2,3,4,5";
    public bool IndicadoresActivos { get; set; }
    public string PaisIndicadores { get; set; } = "DO";
    public string Tema { get; set; } = "sistema";
    public bool BienvenidaCompletada { get; set; }
}

public sealed class TasaCambio
{
    public string MonedaBase { get; set; } = "DOP";
    public string MonedaDestino { get; set; } = "USD";
    public decimal Tasa { get; set; }
    public DateTime ObtenidaEnUtc { get; set; } = DateTime.UtcNow;
    public string Proveedor { get; set; } = "ExchangeRate-API";
}

public sealed class IndicadorEconomico
{
    public string Pais { get; set; } = "DO";
    public string Codigo { get; set; } = string.Empty;
    public int Anio { get; set; }
    public decimal Valor { get; set; }
    public DateTime ObtenidaEnUtc { get; set; } = DateTime.UtcNow;
}
