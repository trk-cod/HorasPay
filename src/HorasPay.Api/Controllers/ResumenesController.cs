using HorasPay.Domain;
using HorasPay.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HorasPay.Api.Controllers;

[ApiController]
[Route("api/resumenes")]
public sealed class ResumenesController(HorasPayDbContext db) : ControllerBase
{
    [HttpGet("acumulado")]
    public async Task<IActionResult> Acumulado(CancellationToken ct) => Ok(ServicioResumen.Acumulado(await db.Jornadas.Where(x => x.EliminadoEnUtc == null).ToListAsync(ct)));

    [HttpGet("semanal")]
    public async Task<IActionResult> Semanal([FromQuery] DateOnly? fecha, CancellationToken ct)
    {
        var dia = fecha ?? DateOnly.FromDateTime(DateTime.Today);
        var inicio = dia.AddDays(-((7 + (int)dia.DayOfWeek - 1) % 7));
        var fin = inicio.AddDays(7);
        var jornadas = await db.Jornadas.Where(x => x.EliminadoEnUtc == null && x.Fecha >= inicio && x.Fecha < fin).ToListAsync(ct);
        return Ok(ServicioResumen.Crear(jornadas));
    }

    [HttpGet("prediccion")]
    public async Task<IActionResult> Prediccion(CancellationToken ct)
    {
        var configuracion = await db.Configuraciones.FirstOrDefaultAsync(ct) ?? new Configuracion();
        var dias = configuracion.DiasLaborables.Split(',', StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).Select(x => (DayOfWeek)x).ToHashSet();
        return Ok(ServicioPrediccion.CierreDeMes(await db.Jornadas.Where(x => x.EliminadoEnUtc == null).ToListAsync(ct), DateOnly.FromDateTime(DateTime.Today), dias));
    }
}
