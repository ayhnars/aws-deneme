using System.ComponentModel.DataAnnotations;
using MiniERP.Api.Models;

namespace MiniERP.Api.DTOs;

public class StockMovementCreateDto
{
    [Required]
    public int ProductId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [Required]
    public MovementType MovementType { get; set; }
}
