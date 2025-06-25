namespace PayMaster.Models
{
    public class Benefit
    {
        public int BenefitId { get; set; }
        public int EmployeeId { get; set; }
        public string BenefitType { get; set; } // "Medical", "Insurance", "Bonus"
        public decimal Amount { get; set; }
        public string Description { get; set; }
        public DateTime AssignedDate { get; set; }

        public Employee Employee { get; set; }
    }
}
