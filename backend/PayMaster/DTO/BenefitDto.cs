namespace PayMaster.DTO
{
    public class BenefitDto
    {
        public int? BenefitId { get; set; }
        public int EmployeeId { get; set; }
        public string BenefitType { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; }
        public DateTime AssignedDate { get; set; }
    }
}
