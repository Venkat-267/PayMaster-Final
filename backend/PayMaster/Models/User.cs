namespace PayMaster.Models
{
    public class User
    {
        public int UserId { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public int RoleId { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        public Role Role { get; set; }
        public Employee Employee { get; set; }
        
        public ICollection<AuditLog> AuditLogs { get; set; }
        public ICollection<LeaveRequest> ApprovedLeaveRequests {  get; set; }
        public ICollection<Payroll> ProcessedPayrolls { get; set; }
        public ICollection<Payroll> VerifiedPayrolls { get; set; }
        public ICollection<TimeSheet> ApprovedTimeSheets { get; set; }

    }
}
