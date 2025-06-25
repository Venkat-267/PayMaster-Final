using PayMaster.DTO;

namespace PayMaster.Interface
{
    public interface ISalaryStructureRepository
    {
        Task<int> AssignSalaryStructure(SalaryStructureDto dto);
        Task<SalaryStructureDto> GetCurrentSalaryStructure(int empId);
    }
}
