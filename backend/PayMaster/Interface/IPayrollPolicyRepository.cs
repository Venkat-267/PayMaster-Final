using PayMaster.Models;

namespace PayMaster.Interface
{
    public interface IPayrollPolicyRepository
    {
        Task<int> SetPolicyAsync(PayrollPolicy policy);
        Task<PayrollPolicy?> GetLatestPolicyAsync();
    }
}
