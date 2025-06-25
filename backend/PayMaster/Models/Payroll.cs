namespace PayMaster.Models
{
    public class Payroll
    {
        public int PayRollId { get; set; }
        public int EmployeeId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }

        public decimal? GrossPay { get; set; }
        public decimal? EmployeePF { get; set; }
        public decimal? EmployerPF { get; set; }
        public decimal? IncomeTax { get; set; }
        public decimal? NetPay { get; set; }

        public int? ProcessedBy { get; set; }
        public DateTime ProcessedDate { get; set; }

        public bool IsVerified { get; set; } = false;
        public int? VerifiedBy { get; set; }
        public DateTime? VerifiedDate { get; set; }

        public bool IsPaid { get; set; } = false;
        public DateTime? PaidDate { get; set; }
        public string? PaymentMode { get; set; }

        public Employee Employee { get; set; }
        public User Processor { get; set; }
        public User Verifier { get; set; }
    }
}
