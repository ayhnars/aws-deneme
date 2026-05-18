using MiniERP.Api.Models;

namespace MiniERP.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (context.Users.Any())
            return;

        var admin = new AppUser
        {
            FullName = "System Admin",
            Email = "admin@minierp.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!"),
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        var products = new List<Product>
        {
            new()
            {
                Name = "Laptop",
                Description = "Business laptop 15 inch",
                Price = 1299.99m,
                StockQuantity = 25,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Name = "Wireless Mouse",
                Description = "Ergonomic wireless mouse",
                Price = 29.99m,
                StockQuantity = 150,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Name = "USB-C Hub",
                Description = "7-in-1 USB-C hub adapter",
                Price = 49.99m,
                StockQuantity = 80,
                CreatedAt = DateTime.UtcNow
            }
        };

        context.Users.Add(admin);
        context.Products.AddRange(products);
        await context.SaveChangesAsync();
    }
}
