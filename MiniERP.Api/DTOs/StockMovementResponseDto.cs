using MiniERP.Api.Models;

namespace MiniERP.Api.DTOs;

public class StockMovementResponseDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public MovementType MovementType { get; set; }
    public DateTime CreatedAt { get; set; }
}
