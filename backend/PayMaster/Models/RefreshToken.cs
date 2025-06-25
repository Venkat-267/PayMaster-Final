namespace PayMaster.Models
{
    public class RefreshToken
    {
        public int Id { get; set; }
        public string Token { get; set; }
        public string Username { get; set; }
        public DateTime ExpiryDate { get; set; }
    }
}
