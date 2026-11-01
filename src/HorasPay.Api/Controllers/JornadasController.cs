using HorasPay.Domain;
using HorasPay.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HorasPay.Api.Controllers;

[ApiController]
[Route("api/jornadas")]
public sealed class JornadasController(HorasPayDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<JornadaSalida>>> Listar([FromQuery] DateOnly? desde, [FromQuery] DateOnly? hasta, [FromQuery] string? buscar, CancellationToken ct)
    {
        var consulta = db.Jornadas.Where(x => x.EliminadoEnUtc == null).AsQueryable();
        if (desde is { } inicio) consulta = consulta.Where(x => x.Fecha >= inicio);
        if (hasta is { } fin) consulta = consulta.Where(x => x.Fecha <= fin);
        if (!string.IsNullOrWhiteSpace(buscar)) consulta = consulta.Where(x => x.Nota != null && x.Nota.Contains(buscar));
        return Ok((await consulta.OrderByDescending(x => x.Fecha).ToListAsync(ct)).Select(x => x.AContrato()));
    }

    [HttpPost("preview")]
    public async Task<ActionResult<PrevisualizacionSalida>> Previsualizar(JornadaEntrada entrada, CancellationToken ct) => Ok(await Calcular(entrada, ct));

    [HttpPost]
    public async Task<ActionResult<JornadaSalida>> Crear(JornadaEntrada entrada, CancellationToken ct)
    {
        var resultado = await Calcular(entrada, ct);
        if (entrada.Entrada is not null && entrada.Salida is not null)
        {
            var solapa = await db.Jornadas.AnyAsync(x => x.EliminadoEnUtc == null && x.Fecha == entrada.Fecha && x.Entrada != null && x.Salida != null && entrada.Entrada < x.Salida && entrada.Salida > x.Entrada, ct);
            if (solapa) return Conflict(new ProblemDetails { Title = "Ya tienes una jornada que se solapa en ese horario.", Extensions = { ["code"] = "jornada_solapada" } });
        }
        var jornada = new Jornada { Fecha = entrada.Fecha, Entrada = entrada.Entrada, Salida = entrada.Salida, DescansoMin = entrada.DescansoMin, Nota = entrada.Nota?.Trim(), HorasNormales = resultado.HorasNormales, HorasExtra = resultado.HorasExtra, TarifaAplicada = resultado.Tarifa, MultiplicadorAplicado = resultado.Multiplicador, Monto = resultado.Monto };
        db.Jornadas.Add(jornada); await db.SaveChangesAsync(ct);
        return CreatedAtAction(nameof(Obtener), new { id = jornada.Id }, jornada.AContrato());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<JornadaSalida>> Obtener(Guid id, CancellationToken ct)
    {
        var jornada = await db.Jornadas.FirstOrDefaultAsync(x => x.Id == id && x.EliminadoEnUtc == null, ct);
        return jornada is null ? NotFound() : Ok(jornada.AContrato());
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<JornadaSalida>> Editar(Guid id, JornadaEntrada entrada, CancellationToken ct)
    {
        var jornada = await db.Jornadas.FirstOrDefaultAsync(x => x.Id == id && x.EliminadoEnUtc == null, ct);
        if (jornada is null) return NotFound();
        var resultado = await Calcular(entrada, ct);
        jornada.Fecha = entrada.Fecha; jornada.Entrada = entrada.Entrada; jornada.Salida = entrada.Salida; jornada.DescansoMin = entrada.DescansoMin; jornada.Nota = entrada.Nota?.Trim();
        jornada.HorasNormales = resultado.HorasNormales; jornada.HorasExtra = resultado.HorasExtra; jornada.Monto = resultado.Monto; jornada.TarifaAplicada = resultado.Tarifa; jornada.MultiplicadorAplicado = resultado.Multiplicador;
        await db.SaveChangesAsync(ct); return Ok(jornada.AContrato());
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Eliminar(Guid id, CancellationToken ct)
    {
        var jornada = await db.Jornadas.FindAsync([id], ct); if (jornada is null) return NotFound();
        jornada.EliminadoEnUtc = DateTime.UtcNow; await db.SaveChangesAsync(ct); return NoContent();
    }

    [HttpPost("{id:guid}/restaurar")]
    public async Task<ActionResult<JornadaSalida>> Restaurar(Guid id, CancellationToken ct)
    {
        var jornada = await db.Jornadas.FindAsync([id], ct); if (jornada is null) return NotFound();
        jornada.EliminadoEnUtc = null; await db.SaveChangesAsync(ct); return Ok(jornada.AContrato());
    }

    private async Task<PrevisualizacionSalida> Calcular(JornadaEntrada entrada, CancellationToken ct)
    {
        if (entrada.DescansoMin < 0) throw new ArgumentException("El descanso no puede ser negativo.");
        var tarifa = await db.Tarifas.Where(x => x.VigenteDesde <= entrada.Fecha).OrderByDescending(x => x.VigenteDesde).FirstOrDefaultAsync(ct) ?? new Tarifa { ValorHora = 200m };
        var regla = await db.ReglasExtras.Where(x => x.Activa).OrderByDescending(x => x.Id).FirstOrDefaultAsync(ct) ?? new ReglaExtras();
        ResultadoJornada calculo;
        if (entrada.HorasManual is { } horas) calculo = CalculadoraPago.CalcularHorasManual(horas, tarifa.ValorHora, regla);
        else if (entrada.Entrada is { } inicio && entrada.Salida is { } fin) calculo = CalculadoraPago.Calcular(inicio, fin, entrada.DescansoMin, tarifa.ValorHora, regla);
        else throw new ArgumentException("Indica entrada y salida, o las horas trabajadas.");
        return new PrevisualizacionSalida(calculo.HorasNormales, calculo.HorasExtra, calculo.Monto, calculo.TotalHoras, tarifa.ValorHora, regla.Multiplicador);
    }
}
