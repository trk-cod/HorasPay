using HorasPay.Domain;
using Microsoft.EntityFrameworkCore;

namespace HorasPay.Infrastructure;

public sealed class HorasPayDbContext(DbContextOptions<HorasPayDbContext> options) : DbContext(options)
{
    public DbSet<Jornada> Jornadas => Set<Jornada>();
    public DbSet<Tarifa> Tarifas => Set<Tarifa>();
    public DbSet<ReglaExtras> ReglasExtras => Set<ReglaExtras>();
    public DbSet<Configuracion> Configuraciones => Set<Configuracion>();
    public DbSet<TasaCambio> TasasCambio => Set<TasaCambio>();
    public DbSet<IndicadorEconomico> IndicadoresEconomicos => Set<IndicadorEconomico>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Jornada>(e =>
        {
            e.ToTable("JORNADA"); e.HasKey(x => x.Id); e.HasIndex(x => x.Fecha);
            e.Property(x => x.HorasNormales).HasPrecision(8, 2); e.Property(x => x.HorasExtra).HasPrecision(8, 2);
            e.Property(x => x.TarifaAplicada).HasPrecision(12, 2); e.Property(x => x.MultiplicadorAplicado).HasPrecision(6, 2); e.Property(x => x.Monto).HasPrecision(12, 2);
        });
        b.Entity<Tarifa>(e => { e.ToTable("TARIFA"); e.HasIndex(x => x.VigenteDesde); e.Property(x => x.ValorHora).HasPrecision(12, 2); });
        b.Entity<ReglaExtras>(e => { e.ToTable("REGLA_EXTRAS"); e.Property(x => x.UmbralDiario).HasPrecision(6, 2); e.Property(x => x.UmbralSemanal).HasPrecision(6, 2); e.Property(x => x.Multiplicador).HasPrecision(6, 2); });
        b.Entity<Configuracion>().ToTable("CONFIGURACION");
        b.Entity<TasaCambio>(e => { e.ToTable("TASA_CAMBIO"); e.HasKey(x => new { x.MonedaBase, x.MonedaDestino }); e.Property(x => x.Tasa).HasPrecision(18, 6); });
        b.Entity<IndicadorEconomico>(e => { e.ToTable("INDICADOR_ECONOMICO"); e.HasKey(x => new { x.Pais, x.Codigo, x.Anio }); e.Property(x => x.Valor).HasPrecision(18, 4); });
    }
}
