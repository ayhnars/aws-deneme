using System.Text.Json.Serialization;

namespace MiniERP.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MovementType
{
    In,
    Out
}
