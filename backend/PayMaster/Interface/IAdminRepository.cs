using PayMaster.DTO;

namespace PayMaster.Interface
{
    public interface IAdminRepository
    {
        // Audit Logs
        Task<int> GenerateAuditLogAsync(AuditLogDto dto);
        Task<List<AuditLogDto>> GetAuditLogsByUserAsync(int userId);

        // Payrolls
        Task<List<PayrollDto>> GetTeamPayrollsAsync(int managerId);
        Task<List<PayrollSummaryDto>> GetPayrollSummaryAsync(int month, int year, string? department = null);
        Task<List<TaxStatementDto>> GetTaxStatementsAsync(int year);

        // Leaves
        Task<List<LeaveRequestDto>> GetTeamPendingLeavesAsync(int managerId);

        // TimeSheets
        Task<List<TimeSheetReportDto>> GetTimeSheetReportAsync(int? employeeId, int? managerId, DateTime? from, DateTime? to);
    }
}
