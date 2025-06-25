using System.ComponentModel.DataAnnotations;

namespace PayMaster.Models
{
    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; }
    }
}
