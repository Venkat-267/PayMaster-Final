using PayMaster.DTO;
using PayMaster.Models;

namespace PayMaster.Interface
{
    public interface IUserRepository
    {
        Task<int> RegisterUser(UserRegistrationDto dto);
        Task<User> LoginUser(LoginDto dto);
    }
}
