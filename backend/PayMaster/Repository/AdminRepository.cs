using Microsoft.EntityFrameworkCore;
using PayMaster.DTO;
using PayMaster.Interface;
using PayMaster.Models;

namespace PayMaster.Repository
{
    public class AdminRepository : IAdminRepository
    {
        private readonly PayMasterDbContext _context;
        public AdminRepository(PayMasterDbContext context)
        {
            _context = context;
        }

        public async Task<int> GenerateAuditLogAsync(AuditLogDto dto)
        {
            var log = new AuditLog
            {
                UserId = dto.UserId,
                Action = dto.Action,
                Description = dto.Description,
                Timestamp = DateTime.UtcNow
            };

            _context.AuditLogs.Add(log);
            await _context.SaveChangesAsync();
            return log.LogId;
        }

        public async Task<List<AuditLogDto>> GetAuditLogsByUserAsync(int userId)
        {
            return await _context.AuditLogs.Where(a => a.UserId == userId)
                .OrderByDescending(a => a.Timestamp)
                .Select(a => new AuditLogDto
                {
                    LogId = a.LogId,
                    UserId = a.UserId,
                    Action = a.Action,
                    Description = a.Description,
                    Timestamp = a.Timestamp
                }).ToListAsync();
        }

        public async Task<List<PayrollDto>> GetTeamPayrollsAsync(int managerId)
        {
            var employeeIds = await _context.Employees
                .Where(e => e.ManagerId == managerId)
                .Select(e => e.EmployeeId)
                .ToListAsync();

            return await _context.Payrolls
                .Where(p => employeeIds.Contains(p.EmployeeId))
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

        public async Task<List<PayrollSummaryDto>> GetPayrollSummaryAsync(int month, int year, string? department = null)
        {
            var query = _context.Payrolls
                .Where(p => p.Month == month && p.Year == year)
                .Include(p => p.Employee)
                .AsQueryable();

            if (!string.IsNullOrEmpty(department))
                query = query.Where(p => p.Employee.Department == department);

            return await query.Select(p => new PayrollSummaryDto
            {
                EmployeeId = p.EmployeeId,
                EmployeeName = p.Employee.FirstName + " " + p.Employee.LastName,
                Month = p.Month,
                Year = p.Year,
                GrossPay = p.GrossPay ?? 0,
                EmployeePF = p.EmployeePF ?? 0,
                IncomeTax = p.IncomeTax ?? 0,
                NetPay = p.NetPay ?? 0
            }).ToListAsync();
        }

        public async Task<List<TaxStatementDto>> GetTaxStatementsAsync(int year)
        {
            return await _context.Payrolls
                .Where(p => p.Year == year)
                .GroupBy(p => new { p.EmployeeId, p.Employee.FirstName, p.Employee.LastName })
                .Select(g => new TaxStatementDto
                {
                    EmployeeId = g.Key.EmployeeId,
                    EmployeeName = g.Key.FirstName + " " + g.Key.LastName,
                    TotalEmployeePF = g.Sum(x => x.EmployeePF ?? 0),
                    TotalIncomeTax = g.Sum(x => x.IncomeTax ?? 0)
                })
                .ToListAsync();
        }

        public async Task<List<LeaveRequestDto>> GetTeamPendingLeavesAsync(int managerId)
        {
            var employeeIds = await _context.Employees
                .Where(e => e.ManagerId == managerId)
                .Select(e => e.EmployeeId)
                .ToListAsync();

            return await _context.LeaveRequests
                .Where(l => employeeIds.Contains(l.EmployeeId) && l.Status == "Pending")
                .Select(l => new LeaveRequestDto
                {
                    LeaveId = l.LeaveId,
                    EmployeeId = l.EmployeeId,
                    LeaveType = l.LeaveType,
                    StartDate = l.StartDate,
                    EndDate = l.EndDate,
                    Reason = l.Reason,
                    Status = l.Status,
                    ApprovedBy = l.ApprovedBy,
                    AppliedDate = l.AppliedDate,
                    ApprovedDate = l.ApprovedDate
                }).ToListAsync();
        }

        public async Task<List<TimeSheetReportDto>> GetTimeSheetReportAsync(int? employeeId, int? managerId, DateTime? from, DateTime? to)
        {
            var query = _context.TimeSheets
                .Include(t => t.Employee)
                .AsQueryable();

            if (employeeId.HasValue)
                query = query.Where(t => t.EmployeeId == employeeId.Value);

            if (managerId.HasValue)
            {
                var subordinates = await _context.Employees
                    .Where(e => e.ManagerId == managerId)
                    .Select(e => e.EmployeeId)
                    .ToListAsync();

                query = query.Where(t => subordinates.Contains(t.EmployeeId));
            }

            if (from.HasValue)
                query = query.Where(t => t.WorkDate >= from.Value);

            if (to.HasValue)
                query = query.Where(t => t.WorkDate <= to.Value);

            return await query.Select(t => new TimeSheetReportDto
            {
                EmployeeName = t.Employee.FirstName + " " + t.Employee.LastName,
                WorkDate = t.WorkDate,
                HoursWorked = t.HoursWorked,
                TaskDescription = t.TaskDescription,
                IsApproved = t.IsApproved
            }).ToListAsync();
        }
    }
}
