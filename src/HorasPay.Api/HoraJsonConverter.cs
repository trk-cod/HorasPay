using System.Text.Json;
using System.Text.Json.Serialization;

namespace HorasPay.Api;

/// <summary>Acepta la hora corta de los controles HTML, por ejemplo 08:00.</summary>
public sealed class HoraJsonConverter : JsonConverter<TimeOnly>
{
    public override TimeOnly Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var texto = reader.GetString();
        return TimeOnly.TryParse(texto, out var hora) ? hora : throw new JsonException("La hora debe tener formato HH:mm.");
    }

    public override void Write(Utf8JsonWriter writer, TimeOnly value, JsonSerializerOptions options) => writer.WriteStringValue(value.ToString("HH:mm"));
}
