using Microsoft.AspNetCore.Mvc;
using MiniERP.Api.DTOs;
using MiniERP.Api.Services;

namespace MiniERP.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var result = await _authService.LoginAsync(request);
            if (result is null)
                return Unauthorized(new { message = "Invalid email or password." });

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during login.", error = ex.Message });
        }
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        try
        {
            var (response, error) = await _authService.RegisterAsync(request);
            if (error is not null)
                return BadRequest(new { message = error });

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "An error occurred during registration.", error = ex.Message });
        }
    }
}
