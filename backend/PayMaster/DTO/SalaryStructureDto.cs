namespace PayMaster.DTO
{
    public class SalaryStructureDto
    {
        public int? SalaryId { get; set; }
        public int EmployeeId { get; set; }
        public decimal BasicPay { get; set; }
        public decimal? HRA { get; set; }
        public decimal? Allowances { get; set; }
        public decimal? PFPercentage { get; set; }
        public DateTime EffectiveFrom { get; set; }
    }
}
