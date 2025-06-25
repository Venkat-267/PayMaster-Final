namespace PayMaster.DTO
{
    public class TimeSheetDto
    {
        public int? TimeSheetId { get; set; }
        public int EmployeeId { get; set; }
        public DateTime WorkDate { get; set; }
        public decimal HoursWorked { get; set; }
        public string TaskDescription { get; set; }
        public bool IsApproved { get; set; }
    }

    public class TimeSheetReportDto
    {
        public string EmployeeName { get; set; }
        public DateTime WorkDate { get; set; }
        public decimal HoursWorked { get; set; }
        public string TaskDescription { get; set; }
        public bool IsApproved { get; set; }
    }

}
