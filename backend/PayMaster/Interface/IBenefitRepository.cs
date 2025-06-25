using PayMaster.DTO;

namespace PayMaster.Interface
{
    public interface IBenefitRepository
    {
        Task<int> AddBenefitAsync(BenefitDto dto);
        Task<List<BenefitDto>> GetBenefitsByEmployeeAsync(int employeeId);
        Task<bool> UpdateBenefitAsync(BenefitDto dto);
        Task<bool> DeleteBenefitAsync(int benefitId);
    }
}
