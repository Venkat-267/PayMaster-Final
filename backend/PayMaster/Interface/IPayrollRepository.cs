using PayMaster.DTO;

namespace PayMaster.Interface
{
    public interface IPayrollRepository
    {
        Task<PayrollDto> GeneratePayrollAsync(int employeeId, int month, int year, int processedBy);
        Task<PayrollDto> GetPayrollByEmployeeAndMonthAsync(int employeeId, int month, int year);
        Task<List<PayrollDto>> GetPayrollHistoryAsync(int employeeId);
        Task<bool> VerifyPayrollAsync(int payrollId, int userId);
        Task<bool> MarkPayrollAsPaidAsync(int payrollId, string paymentMode, int paidByUserId);
        Task<List<PayrollFullDto>> GetAllPayrollDetailsAsync();

    }
}
