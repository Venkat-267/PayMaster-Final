namespace PayMaster.Models
{
    public class TimeSheet
    {
        public int TimeSheetId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime WorkDate { get; set; }
        public decimal HoursWorked { get; set; }
        public string TaskDescription { get; set; }

        public bool IsApproved { get; set; } = false;
        public int? ApprovedBy { get; set; }
        public DateTime? ApprovedDate { get; set; }

        public Employee Employee { get; set; }
        public User Approver { get; set; }
    }
}
