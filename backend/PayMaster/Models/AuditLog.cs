namespace PayMaster.Models
{
    public class AuditLog
    {
        public int LogId { get; set; }
        public int UserId { get; set; }
        public string Action { get; set; }
        public string Description { get; set; }
        public DateTime Timestamp { get; set; }

        public User User { get; set; }
    }
}
