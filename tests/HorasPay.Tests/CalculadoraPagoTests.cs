using HorasPay.Domain;

namespace HorasPay.Tests;

public sealed class CalculadoraPagoTests
{
    private static readonly ReglaExtras Regla = new() { UmbralDiario = 8m, Multiplicador = 1.5m };

    [Fact]
    public void Jornada_normal_calcula_ocho_horas_sin_extra()
    {
        var r = CalculadoraPago.Calcular(new TimeOnly(8, 0), new TimeOnly(16, 0), 0, 200m, Regla);
        Assert.Equal(8m, r.HorasNormales); Assert.Equal(0m, r.HorasExtra); Assert.Equal(1600m, r.Monto);
    }

    [Fact]
    public void Jornada_con_descanso_y_extra_calcula_monto_exacto()
    {
        var r = CalculadoraPago.Calcular(new TimeOnly(8, 0), new TimeOnly(17, 30), 60, 200m, Regla);
        Assert.Equal(8m, r.HorasNormales); Assert.Equal(0.5m, r.HorasExtra); Assert.Equal(1750m, r.Monto);
    }

    [Fact]
    public void Jornada_que_cruza_medianoche_conserva_duracion()
    {
        var r = CalculadoraPago.Calcular(new TimeOnly(22, 0), new TimeOnly(6, 30), 30, 100m, Regla);
        Assert.Equal(8m, r.HorasNormales); Assert.Equal(0m, r.HorasExtra); Assert.Equal(800m, r.Monto);
    }

    [Fact]
    public void Umbral_semanal_reclasifica_horas_normales()
    {
        var regla = new ReglaExtras { UmbralDiario = 8m, UmbralSemanal = 40m, Multiplicador = 1.5m };
        var r = CalculadoraPago.Calcular(new TimeOnly(8, 0), new TimeOnly(16, 0), 0, 100m, regla, 38m);
        Assert.Equal(2m, r.HorasNormales); Assert.Equal(6m, r.HorasExtra); Assert.Equal(1100m, r.Monto);
    }
}
