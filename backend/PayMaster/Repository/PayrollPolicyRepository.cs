using Microsoft.EntityFrameworkCore;
using PayMaster.Interface;
using PayMaster.Models;

namespace PayMaster.Repository
{
    public class PayrollPolicyRepository : IPayrollPolicyRepository
    {
        private readonly PayMasterDbContext _context;
        public PayrollPolicyRepository(PayMasterDbContext context)
        {
            _context = context;
        }

        public async Task<int> SetPolicyAsync(PayrollPolicy policy)
        {
            policy.EffectiveFrom = DateTime.Now;
            _context.PayrollPolicies.Add(policy);
            await _context.SaveChangesAsync();
            return policy.Id;
        }

        public async Task<PayrollPolicy?> GetLatestPolicyAsync()
        {
            return await _context.PayrollPolicies
            .OrderByDescending(p => p.EffectiveFrom)
            .FirstOrDefaultAsync();
        }
    }
}
