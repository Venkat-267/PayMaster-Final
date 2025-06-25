using Microsoft.EntityFrameworkCore;
using PayMaster.DTO;
using PayMaster.Interface;
using PayMaster.Models;
using System.Security.Cryptography;
using System.Text;

namespace PayMaster.Repository
{
    public class UserRepository : IUserRepository
    {
        private readonly PayMasterDbContext _context;
        public UserRepository(PayMasterDbContext context)
        {
            _context = context;
        }

        private string ComputeHash(string input)
        {
            using var sha256 = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(input);
            var hash = sha256.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        public async Task<int> RegisterUser(UserRegistrationDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.UserName == dto.UserName))
            {
                throw new Exception("Username Already Exists!");
            }

            var passwordHash = ComputeHash(dto.Password);

            var user = new User { UserName = dto.UserName, Email = dto.Email, Password = passwordHash, RoleId = dto.RoleId, IsActive = true, CreatedAt = DateTime.UtcNow };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return user.UserId;
        }

        public async Task<User> LoginUser(LoginDto dto)
        {
            var user = await _context.Users.Include(u=>u.Role).FirstOrDefaultAsync(u => u.UserName == dto.UserName);

            if (user == null || user.IsActive == false || user.Password != ComputeHash(dto.Password))
            {
                throw new Exception("Invalid Credentials!");
            }

            return user;
        }
    }
}
