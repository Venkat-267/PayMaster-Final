using Microsoft.EntityFrameworkCore;
using PayMaster.DTO;
using PayMaster.Interface;
using PayMaster.Models;

namespace PayMaster.Repository
{
    public class BenefitRepository : IBenefitRepository
    {
        private readonly PayMasterDbContext _context;
        public BenefitRepository(PayMasterDbContext context)
        {
            _context = context;
        }

        public async Task<int> AddBenefitAsync(BenefitDto dto)
        {
            var benefit = new Benefit
            {
                EmployeeId = dto.EmployeeId,
                BenefitType = dto.BenefitType,
                Amount = dto.Amount,
                Description = dto.Description,
                AssignedDate = dto.AssignedDate
            };

            _context.Benefits.Add(benefit);
            await _context.SaveChangesAsync();
            return benefit.BenefitId;
        }

        public async Task<List<BenefitDto>> GetBenefitsByEmployeeAsync(int employeeId)
        {
            return await _context.Benefits
                .Where(b => b.EmployeeId == employeeId)
                .Select(b => new BenefitDto
                {
                    BenefitId = b.BenefitId,
                    EmployeeId = b.EmployeeId,
                    BenefitType = b.BenefitType,
                    Amount = b.Amount,
                    Description = b.Description,
                    AssignedDate = b.AssignedDate
                }).ToListAsync();
        }

        public async Task<bool> UpdateBenefitAsync(BenefitDto dto)
        {
            var benefit = await _context.Benefits.FindAsync(dto.BenefitId);
            if (benefit == null) return false;

            benefit.BenefitType = dto.BenefitType;
            benefit.Amount = dto.Amount;
            benefit.Description = dto.Description;
            benefit.AssignedDate = dto.AssignedDate;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteBenefitAsync(int benefitId)
        {
            var benefit = await _context.Benefits.FindAsync(benefitId);
            if (benefit == null) return false;

            _context.Benefits.Remove(benefit);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
