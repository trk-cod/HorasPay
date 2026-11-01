using System.IO.Compression;
using System.Net.Http.Json;
using System.Text.Json;
using HorasPay.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace HorasPay.Infrastructure;

public interface IProveedorTasas
{
    Task<IReadOnlyDictionary<string, decimal>> ObtenerTasasAsync(string monedaBase, CancellationToken cancellationToken = default);
}

public sealed class ProveedorOpenErApi(HttpClient client) : IProveedorTasas
{
    public async Task<IReadOnlyDictionary<string, decimal>> ObtenerTasasAsync(string monedaBase, CancellationToken cancellationToken = default)
    {
        var respuesta = await client.GetFromJsonAsync<RespuestaErApi>($"https://open.er-api.com/v6/latest/{monedaBase}", cancellationToken);
        if (respuesta?.Rates is null || !string.Equals(respuesta.Result, "success", StringComparison.OrdinalIgnoreCase))
            throw new HttpRequestException("El proveedor de tasas no devolvió datos válidos.");
        return respuesta.Rates.ToDictionary(x => x.Key, x => x.Value);
    }

    private sealed class RespuestaErApi { public string? Result { get; set; } public Dictionary<string, decimal>? Rates { get; set; } }
}

public sealed record Cotizacion(decimal Tasa, DateTime FechaUtc, bool DesdeCache, bool SinConexion, string Proveedor);

public sealed class ServicioConversion(HorasPayDbContext db, IProveedorTasas proveedor, ILogger<ServicioConversion> logger)
{
    public async Task<Cotizacion?> ObtenerTasaAsync(string origen, string destino, bool forzar = false, CancellationToken ct = default)
    {
        if (origen.Equals(destino, StringComparison.OrdinalIgnoreCase)) return new Cotizacion(1m, DateTime.UtcNow, true, false, "Base");
        var cache = await db.TasasCambio.FindAsync([origen.ToUpperInvariant(), destino.ToUpperInvariant()], ct);
        if (!forzar && cache is not null && cache.ObtenidaEnUtc >= DateTime.UtcNow.AddHours(-24))
            return new Cotizacion(cache.Tasa, cache.ObtenidaEnUtc, true, false, cache.Proveedor);
        try
        {
            var tasas = await proveedor.ObtenerTasasAsync(origen.ToUpperInvariant(), ct);
            if (!tasas.TryGetValue(destino.ToUpperInvariant(), out var tasa)) return cache is null ? null : new Cotizacion(cache.Tasa, cache.ObtenidaEnUtc, true, true, cache.Proveedor);
            cache ??= new TasaCambio { MonedaBase = origen.ToUpperInvariant(), MonedaDestino = destino.ToUpperInvariant() };
            cache.Tasa = tasa; cache.ObtenidaEnUtc = DateTime.UtcNow; cache.Proveedor = "ExchangeRate-API";
            db.Update(cache); await db.SaveChangesAsync(ct);
            return new Cotizacion(tasa, cache.ObtenidaEnUtc, false, false, cache.Proveedor);
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            logger.LogWarning(ex, "No se pudo actualizar la tasa {Origen}/{Destino}; se usa caché.", origen, destino);
            return cache is null ? null : new Cotizacion(cache.Tasa, cache.ObtenidaEnUtc, true, true, cache.Proveedor);
        }
    }
}

public sealed class ServicioRespaldo(HorasPayDbContext db)
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public async Task<byte[]> ExportarAsync(CancellationToken ct = default)
    {
        var datos = new Respaldo(1, await db.Jornadas.IgnoreQueryFilters().ToListAsync(ct), await db.Tarifas.ToListAsync(ct), await db.ReglasExtras.ToListAsync(ct), await db.Configuraciones.ToListAsync(ct));
        await using var memoria = new MemoryStream();
        using (var zip = new ZipArchive(memoria, ZipArchiveMode.Create, true))
        await using (var destino = zip.CreateEntry("horaspay.json").Open()) await JsonSerializer.SerializeAsync(destino, datos, Json, ct);
        return memoria.ToArray();
    }

    public sealed record Respaldo(int VersionEsquema, List<Jornada> Jornadas, List<Tarifa> Tarifas, List<ReglaExtras> Reglas, List<Configuracion> Configuraciones);
}
