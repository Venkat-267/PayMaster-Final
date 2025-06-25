using PayMaster.DTO;

namespace PayMaster.Interface
{
    public interface ITimeSheetRepository
    {
        Task<int> SubmitTimeSheetAsync(TimeSheetDto dto);
        Task<List<TimeSheetDto>> GetByEmployeeAsync(int employeeId);
        Task<List<TimeSheetDto>> GetPendingApprovalsAsync(int managerId);
        Task<bool> ApproveTimeSheetAsync(int timeSheetId, int approverId);
    }
}
