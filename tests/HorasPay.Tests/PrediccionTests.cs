using HorasPay.Domain;

namespace HorasPay.Tests;

public sealed class PrediccionTests
{
    [Fact]
    public void Prediccion_sin_jornadas_es_cero_y_no_falla()
    {
        var p = ServicioPrediccion.CierreDeMes([], new DateOnly(2026, 11, 1), new HashSet<DayOfWeek> { DayOfWeek.Monday });
        Assert.Equal(0m, p.Esperado); Assert.True(p.DiasLaborablesRestantes >= 0);
    }
}
