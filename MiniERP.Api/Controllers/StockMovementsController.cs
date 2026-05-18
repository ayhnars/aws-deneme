using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MiniERP.Api.Data;
using MiniERP.Api.DTOs;
using MiniERP.Api.Models;

namespace MiniERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StockMovementsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public StockMovementsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var movements = await _context.StockMovements
                .Include(m => m.Product)
                .OrderByDescending(m => m.CreatedAt)
                .Select(m => new StockMovementResponseDto
                {
                    Id = m.Id,
                    ProductId = m.ProductId,
                    ProductName = m.Product.Name,
                    Quantity = m.Quantity,
                    MovementType = m.MovementType,
                    CreatedAt = m.CreatedAt
                })
                .ToListAsync();

            return Ok(movements);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve stock movements.", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] StockMovementCreateDto dto)
    {
        try
        {
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product is null)
                return NotFound(new { message = $"Product with id {dto.ProductId} not found." });

            if (dto.MovementType == MovementType.Out && product.StockQuantity < dto.Quantity)
                return BadRequest(new { message = "Insufficient stock for this movement." });

            if (dto.MovementType == MovementType.In)
                product.StockQuantity += dto.Quantity;
            else
                product.StockQuantity -= dto.Quantity;

            var movement = new StockMovement
            {
                ProductId = dto.ProductId,
                Quantity = dto.Quantity,
                MovementType = dto.MovementType,
                CreatedAt = DateTime.UtcNow
            };

            _context.StockMovements.Add(movement);
            await _context.SaveChangesAsync();

            var response = new StockMovementResponseDto
            {
                Id = movement.Id,
                ProductId = movement.ProductId,
                ProductName = product.Name,
                Quantity = movement.Quantity,
                MovementType = movement.MovementType,
                CreatedAt = movement.CreatedAt
            };

            return CreatedAtAction(nameof(GetAll), new { id = movement.Id }, response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to create stock movement.", error = ex.Message });
        }
    }
}
