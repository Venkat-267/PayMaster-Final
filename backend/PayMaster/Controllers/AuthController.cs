using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PayMaster.DTO;
using PayMaster.Interface;
using PayMaster.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace PayMaster.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IUserRepository _userRepo;
        private readonly IAdminRepository _adminRepo;
        private readonly TokenService _tokenService;
        private readonly PayMasterDbContext _context;

        public AuthController(IConfiguration configuration, IAdminRepository adminRepo, TokenService tokenService, IUserRepository userRepo, PayMasterDbContext context)
        {
            _configuration = configuration;
            _tokenService = tokenService;
            _userRepo = userRepo;
            _adminRepo = adminRepo;
            _context = context;
        }

        // PRIVATE HELPERS

        private string IssueAccessToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.UserId.ToString()),
                new Claim(ClaimTypes.Name, user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.RoleName)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var bytes = new byte[32];
            using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
            rng.GetBytes(bytes);
            return Convert.ToBase64String(bytes);
        }

        //[Authorize(Roles = "Admin")]
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegistrationDto dto)
        {
            try
            {
                var userId = await _userRepo.RegisterUser(dto);
                await _adminRepo.GenerateAuditLogAsync(new AuditLogDto
                {
                    UserId = userId,
                    Action = "Register User",
                    Description = $"User {dto.UserName} has been created"
                });
                return Ok(new { Message = "User Registered Successfully!", UserId = userId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto dto)
        {
            try
            {
                var user = await _userRepo.LoginUser(dto);
                if (user == null)
                    return Unauthorized(new { Error = "Invalid credentials" });

                var accessToken = IssueAccessToken(user);
                var refreshToken = GenerateRefreshToken();

                await _tokenService.SaveRefreshToken(user.UserName, refreshToken);

                await _adminRepo.GenerateAuditLogAsync(new AuditLogDto
                {
                    UserId = user.UserId,
                    Action = "Login",
                    Description = $"User {user.UserName} logged in"
                });

                return Ok(new
                {
                    Message = "Login successful",
                    UserId = user.UserId,
                    Role = user.Role.RoleName,
                    AccessToken = accessToken,
                    RefreshToken = refreshToken
                });
            }
            catch (Exception ex)
            {
                return Unauthorized(new { Error = ex.Message });
            }
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.RefreshToken))
                return BadRequest("Refresh token required.");

            var username = await _tokenService.RetrieveUsernameByRefreshToken(request.RefreshToken);
            if (string.IsNullOrEmpty(username))
                return Unauthorized("Invalid refresh token.");

            var user = await _context.Users
                .Include(u => u.Role)
                .FirstOrDefaultAsync(u => u.UserName == username);

            if (user == null)
                return Unauthorized("Invalid user.");

            var newAccessToken = IssueAccessToken(user);
            var newRefreshToken = GenerateRefreshToken();

            await _tokenService.SaveRefreshToken(user.UserName, newRefreshToken);

            return Ok(new
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken
            });
        }

        [HttpPost("revoke")]
        public async Task<IActionResult> Revoke([FromBody] RefreshTokenRequest request)
        {
            var success = await _tokenService.RevokeRefreshToken(request.RefreshToken);
            return success ? Ok("Token revoked.") : NotFound("Token not found.");
        }
    }
}
