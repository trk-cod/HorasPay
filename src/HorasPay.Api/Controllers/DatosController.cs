using HorasPay.Domain;
using HorasPay.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HorasPay.Api.Controllers;

[ApiController]
[Route("api")]
public sealed class DatosController(HorasPayDbContext db, ServicioConversion conversion, ServicioRespaldo respaldo) : ControllerBase
{
    [HttpGet("configuracion")]
    public async Task<IActionResult> ObtenerConfiguracion(CancellationToken ct) => Ok(await db.Configuraciones.FirstOrDefaultAsync(ct) ?? new Configuracion());

    [HttpPut("configuracion")]
    public async Task<IActionResult> GuardarConfiguracion(ConfiguracionEntrada entrada, CancellationToken ct)
    {
        var configuracion = await db.Configuraciones.FirstOrDefaultAsync(ct);
        var esNueva = configuracion is null;
        configuracion ??= new Configuracion();
        configuracion.MonedaBase = entrada.MonedaBase.ToUpperInvariant(); configuracion.MonedaVisualizacion = entrada.MonedaVisualizacion.ToUpperInvariant(); configuracion.UsarTasaFija = entrada.UsarTasaFija; configuracion.TasaFija = entrada.TasaFija;
        configuracion.DiasLaborables = entrada.DiasLaborables; configuracion.Tema = entrada.Tema; configuracion.BienvenidaCompletada = entrada.BienvenidaCompletada;
        if (esNueva) db.Configuraciones.Add(configuracion); else db.Update(configuracion);
        if (entrada.TarifaActual is { } tarifa && tarifa > 0) db.Tarifas.Add(new Tarifa { ValorHora = tarifa, VigenteDesde = DateOnly.FromDateTime(DateTime.Today) });
        db.ReglasExtras.Add(new ReglaExtras { UmbralDiario = entrada.UmbralDiario, UmbralSemanal = entrada.UmbralSemanal, Multiplicador = entrada.Multiplicador });
        await db.SaveChangesAsync(ct); return Ok(configuracion);
    }

    [HttpGet("tasas")]
    public async Task<IActionResult> Tasa([FromQuery] string de, [FromQuery] string a, [FromQuery] bool reintentar, CancellationToken ct)
    {
        var tasa = await conversion.ObtenerTasaAsync(de, a, reintentar, ct);
        return tasa is null ? NotFound(new ProblemDetails { Title = "No hay una tasa disponible sin conexión.", Extensions = { ["code"] = "tasa_no_disponible" } }) : Ok(tasa);
    }

    [HttpGet("respaldo")]
    public async Task<FileContentResult> ExportarRespaldo(CancellationToken ct) => File(await respaldo.ExportarAsync(ct), "application/octet-stream", $"horaspay-{DateTime.Today:yyyyMMdd}.horaspay");

    [HttpGet("jornadas/csv")]
    public async Task<FileContentResult> ExportarCsv(CancellationToken ct)
    {
        var jornadas = await db.Jornadas.Where(x => x.EliminadoEnUtc == null).OrderBy(x => x.Fecha).ToListAsync(ct);
        var lineas = new List<string> { "Fecha,Entrada,Salida,DescansoMin,HorasNormales,HorasExtra,TarifaBase,MontoBase,Nota" };
        lineas.AddRange(jornadas.Select(x => $"{x.Fecha:yyyy-MM-dd},{x.Entrada},{x.Salida},{x.DescansoMin},{x.HorasNormales:0.00},{x.HorasExtra:0.00},{x.TarifaAplicada:0.00},{x.Monto:0.00},\"{x.Nota?.Replace("\"", "\"\"")}\""));
        return File(System.Text.Encoding.UTF8.GetBytes(string.Join(Environment.NewLine, lineas)), "text/csv", "horaspay-jornadas.csv");
    }
}
