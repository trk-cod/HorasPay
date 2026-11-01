using HorasPay.Infrastructure;
using HorasPay.Api;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var appData = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
var databasePath = Path.Combine(appData, "HorasPay", "horaspay.db");
Directory.CreateDirectory(Path.GetDirectoryName(databasePath)!);
var provider = builder.Configuration["Database:Provider"] ?? "Sqlite";

builder.Services.AddControllers().AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new HoraJsonConverter()));
builder.Services.AddProblemDetails();
builder.Services.AddHttpClient<IProveedorTasas, ProveedorOpenErApi>(x => x.Timeout = TimeSpan.FromSeconds(6));
builder.Services.AddScoped<ServicioConversion>();
builder.Services.AddScoped<ServicioRespaldo>();
builder.Services.AddDbContext<HorasPayDbContext>(options =>
{
    if (provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase))
        options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres") ?? "Host=127.0.0.1;Port=5432;Database=horaspay;Username=horaspay;Password=horaspay");
    else options.UseSqlite(builder.Configuration.GetConnectionString("Sqlite") ?? $"Data Source={databasePath}");
});
builder.Services.AddCors(x => x.AddPolicy("local", policy => policy.SetIsOriginAllowed(origen => origen == "null" || origen.StartsWith("http://localhost", StringComparison.OrdinalIgnoreCase) || origen.StartsWith("http://127.0.0.1", StringComparison.OrdinalIgnoreCase)).AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseExceptionHandler(error => error.Run(async context =>
{
    var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
    app.Logger.LogError(exception, "Error no controlado");
    var problem = Results.Problem("Tus datos no se modificaron.", statusCode: 500, title: "No se pudo completar la operación.", extensions: new Dictionary<string, object?> { ["code"] = "error_interno" });
    await problem.ExecuteAsync(context);
}));
app.UseCors("local");
app.MapGet("/health", () => Results.Ok(new { estado = "listo", utc = DateTime.UtcNow }));
app.MapControllers();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<HorasPayDbContext>();
    await db.Database.EnsureCreatedAsync();
}
await app.RunAsync();
