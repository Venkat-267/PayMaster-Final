using Microsoft.EntityFrameworkCore;
using PayMaster.DTO;
using PayMaster.Interface;
using PayMaster.Models;

namespace PayMaster.Repository
{
    public class PayrollRepository : IPayrollRepository
    {
        private readonly PayMasterDbContext _context;

        public PayrollRepository(PayMasterDbContext context)
        {
            _context = context;
        }

        private decimal CalculateIncomeTax(decimal annualGross)
        {
            if (annualGross <= 400000)
                return 0;
            else if (annualGross <= 800000)
                return (annualGross - 400000) * 0.05m;
            else if (annualGross <= 1200000)
                return (400000 * 0.05m) + (annualGross - 800000) * 0.10m;
            else if (annualGross <= 1600000)
                return (400000 * 0.05m) + (400000 * 0.10m) + (annualGross - 1200000) * 0.15m;
            else if (annualGross <= 2000000)
                return (400000 * 0.05m) + (400000 * 0.10m) + (400000 * 0.15m) + (annualGross - 1600000) * 0.20m;
            else if (annualGross <= 2400000)
                return (400000 * 0.05m) + (400000 * 0.10m) + (400000 * 0.15m) + (400000 * 0.20m) + (annualGross - 2000000) * 0.25m;
            else
                return (400000 * 0.05m) + (400000 * 0.10m) + (400000 * 0.15m) + (400000 * 0.20m) + (400000 * 0.25m) + (annualGross - 2400000) * 0.30m;
        }

        public async Task<PayrollDto> GeneratePayrollAsync(int employeeId, int month, int year, int processedBy)
        {
            // Avoid duplication
            var existing = await _context.Payrolls.FirstOrDefaultAsync(p =>
                p.EmployeeId == employeeId && p.Month == month && p.Year == year);

            if (existing != null)
                throw new Exception("Payroll already generated for this period.");

            // Get latest salary structure
            var salary = await _context.SalaryStructures
                .Where(s => s.EmployeeId == employeeId)
                .OrderByDescending(s => s.EffectiveFrom)
                .FirstOrDefaultAsync();

            if (salary == null)
                throw new Exception("No salary structure found for this employee.");

            var policy = await _context.PayrollPolicies
                .OrderByDescending(p => p.EffectiveFrom)
                .FirstOrDefaultAsync();

            // Get all benefits for this employee (optional: filter by month/year if you want)
            var benefits = await _context.Benefits
                .Where(b => b.EmployeeId == employeeId)
                .ToListAsync();

            decimal benefitTotal = benefits.Sum(b => b.Amount);

            // Base + HRA + Allowances + Benefits
            decimal gross = salary.BasicPay + (salary.HRA ?? 0) + (salary.Allowances ?? 0) + benefitTotal;
            decimal pfRate = (salary.PFPercentage ?? policy?.DefaultPFPercent ?? 12) / 100;
            decimal employeePF = salary.BasicPay * pfRate;
            decimal employerPF = salary.BasicPay * pfRate;
            decimal annualGross = gross * 12;
            decimal incomeTax = CalculateIncomeTax(annualGross) / 12; // Monthly TDS

            decimal netPay = gross - employeePF  - incomeTax;

            var payroll = new Payroll
            {
                EmployeeId = employeeId,
                Month = month,
                Year = year,
                GrossPay = gross,
                EmployeePF = employeePF,
                EmployerPF = employerPF,
                IncomeTax = incomeTax,
                NetPay = netPay,
                ProcessedBy = processedBy,
                ProcessedDate = DateTime.Now
            };

            _context.Payrolls.Add(payroll);
            await _context.SaveChangesAsync();

            return new PayrollDto
            {
                PayrollId = payroll.PayRollId,
                EmployeeId = payroll.EmployeeId,
                Month = payroll.Month,
                Year = payroll.Year,
                GrossPay = payroll.GrossPay,
                EmployeePF = payroll.EmployeePF,
                EmployerPF = payroll.EmployerPF,
                IncomeTax = payroll.IncomeTax,
                NetPay = payroll.NetPay,
                ProcessedBy = payroll.ProcessedBy,
                ProcessedDate = payroll.ProcessedDate
            };
        }

        public async Task<bool> VerifyPayrollAsync(int payrollId, int userId)
        {
            var payroll = await _context.Payrolls.FindAsync(payrollId);
            if (payroll == null || payroll.IsVerified == true) return false;

            payroll.IsVerified = true;
            payroll.VerifiedBy = userId;
            payroll.VerifiedDate = DateTime.Now;

            _context.Payrolls.Update(payroll);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> MarkPayrollAsPaidAsync(int payrollId, string paymentMode, int paidByUserId)
        {
            var payroll = await _context.Payrolls.FindAsync(payrollId);
            if (payroll == null || !payroll.IsVerified)
                return false;

            payroll.IsPaid = true;
            payroll.PaidDate = DateTime.Now;
            payroll.PaymentMode = paymentMode;

            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<PayrollDto> GetPayrollByEmployeeAndMonthAsync(int employeeId, int month, int year)
        {
            var payroll = await _context.Payrolls
                .FirstOrDefaultAsync(p => p.EmployeeId == employeeId && p.Month == month && p.Year == year);

            if (payroll == null) return null;

            return new PayrollDto
            {
                PayrollId = payroll.PayRollId,
                EmployeeId = payroll.EmployeeId,
                Month = payroll.Month,
                Year = payroll.Year,
                GrossPay = payroll.GrossPay,
                EmployeePF = payroll.EmployeePF,
                EmployerPF = payroll.EmployerPF,
                NetPay = payroll.NetPay,
                ProcessedBy = payroll.ProcessedBy,
                ProcessedDate = payroll.ProcessedDate
            };
        }

        public async Task<List<PayrollDto>> GetPayrollHistoryAsync(int employeeId)
        {
            return await _context.Payrolls
                .Where(p => p.EmployeeId == employeeId)
                .OrderByDescending(p => p.Year)
                .ThenByDescending(p => p.Month)
                .Select(p => new PayrollDto
                {
                    PayrollId = p.PayRollId,
                    EmployeeId = p.EmployeeId,
                    Month = p.Month,
                    Year = p.Year,
                    GrossPay = p.GrossPay,
                    EmployeePF = p.EmployeePF,
                    EmployerPF = p.EmployerPF,
                    NetPay = p.NetPay,
                    ProcessedBy = p.ProcessedBy,
                    ProcessedDate = p.ProcessedDate
                }).ToListAsync();
        }

        public async Task<List<PayrollFullDto>> GetAllPayrollDetailsAsync()
        {
            return await _context.Payrolls
                .Include(p => p.Employee)
                .Include(p => p.Processor)
                .Include(p => p.Verifier)
                .OrderByDescending(p => p.Year)
                .ThenByDescending(p => p.Month)
                .Select(p => new PayrollFullDto
                {
                    PayrollId = p.PayRollId,
                    EmployeeId = p.EmployeeId,
                    EmployeeName = p.Employee.FirstName + " " + p.Employee.LastName,
                    Month = p.Month,
                    Year = p.Year,
                    GrossPay = p.GrossPay,
                    EmployeePF = p.EmployeePF,
                    EmployerPF = p.EmployerPF,
                    IncomeTax = p.IncomeTax,
                    NetPay = p.NetPay,
                    ProcessedBy = p.ProcessedBy,
                    ProcessedByName = p.Processor != null ? p.Processor.UserName : null,
                    ProcessedDate = p.ProcessedDate,
                    IsVerified = p.IsVerified,
                    VerifiedBy = p.VerifiedBy,
                    VerifiedByName = p.Verifier != null ? p.Verifier.UserName : null,
                    VerifiedDate = p.VerifiedDate,
                    IsPaid = p.IsPaid,
                    PaidDate = p.PaidDate,
                    PaymentMode = p.PaymentMode
                })
                .ToListAsync();
        }

    }
}
