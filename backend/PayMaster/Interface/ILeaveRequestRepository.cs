using PayMaster.DTO;

namespace PayMaster.Interface
{
    public interface ILeaveRequestRepository
    {
        Task<int> SubmitLeaveRequest(LeaveRequestDto dto);
        Task<bool> ApproveOrDenyLeave(int leaveId, int approverId, string action);
        Task<List<LeaveRequestDto>> GetLeaveRequestsByEmployee(int employeeId);
        Task<List<LeaveRequestDto>> SearchLeaveRequests(int? employeeId = null, string? status = null, string? leaveType = null, DateTime? from = null, DateTime? to = null);
    }
}
