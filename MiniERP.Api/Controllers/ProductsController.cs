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
public class ProductsController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ProductsController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var products = await _context.Products
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new ProductResponseDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Description = p.Description,
                    Price = p.Price,
                    StockQuantity = p.StockQuantity,
                    CreatedAt = p.CreatedAt
                })
                .ToListAsync();

            return Ok(products);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve products.", error = ex.Message });
        }
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product is null)
                return NotFound(new { message = $"Product with id {id} not found." });

            return Ok(MapToDto(product));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to retrieve product.", error = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductCreateDto dto)
    {
        try
        {
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                Price = dto.Price,
                StockQuantity = dto.StockQuantity,
                CreatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = product.Id }, MapToDto(product));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to create product.", error = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] ProductUpdateDto dto)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product is null)
                return NotFound(new { message = $"Product with id {id} not found." });

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.Price = dto.Price;
            product.StockQuantity = dto.StockQuantity;

            await _context.SaveChangesAsync();

            return Ok(MapToDto(product));
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to update product.", error = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try
        {
            var product = await _context.Products.FindAsync(id);
            if (product is null)
                return NotFound(new { message = $"Product with id {id} not found." });

            var hasMovements = await _context.StockMovements.AnyAsync(m => m.ProductId == id);
            if (hasMovements)
                return BadRequest(new { message = "Cannot delete product with existing stock movements." });

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Product deleted successfully." });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Failed to delete product.", error = ex.Message });
        }
    }

    private static ProductResponseDto MapToDto(Product product) => new()
    {
        Id = product.Id,
        Name = product.Name,
        Description = product.Description,
        Price = product.Price,
        StockQuantity = product.StockQuantity,
        CreatedAt = product.CreatedAt
    };
}
