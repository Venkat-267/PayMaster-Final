namespace PayMaster.Models
{
    public class PayrollPolicy
    {
        public int Id { get; set; }
        public decimal DefaultPFPercent { get; set; }
        // public decimal ProfessionalTax { get; set; }
        public decimal OvertimeRatePerHour { get; set; }
        public DateTime EffectiveFrom { get; set; }
    }
}
