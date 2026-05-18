using MiniERP.Api.DTOs;

namespace MiniERP.Api.Services;

public interface IAuthService
{
    Task<AuthResponseDto?> LoginAsync(LoginRequestDto request);
    Task<(AuthResponseDto? Response, string? Error)> RegisterAsync(RegisterRequestDto request);
}
