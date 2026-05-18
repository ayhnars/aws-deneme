using System.ComponentModel.DataAnnotations;
using MiniERP.Api.Models;

namespace MiniERP.Api.DTOs;

public class RegisterRequestDto
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public UserRole Role { get; set; } = UserRole.Employee;
}
