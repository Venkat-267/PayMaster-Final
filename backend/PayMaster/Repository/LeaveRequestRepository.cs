using Microsoft.EntityFrameworkCore;
using PayMaster.DTO;
using PayMaster.Interface;
using PayMaster.Models;

namespace PayMaster.Repository
{
    public class LeaveRequestRepository : ILeaveRequestRepository
    {
        private readonly PayMasterDbContext _context;
        public LeaveRequestRepository(PayMasterDbContext context)
        {
            _context = context;
        }

        public async Task<int> SubmitLeaveRequest(LeaveRequestDto dto)
        {
            var leave = new LeaveRequest
            {
                EmployeeId = dto.EmployeeId,
                LeaveType = dto.LeaveType,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Reason = dto.Reason,
                Status = "Pending",
                AppliedDate = DateTime.Now
            };

            _context.LeaveRequests.Add(leave);
            await _context.SaveChangesAsync();
            return leave.LeaveId;
        }

        public async Task<bool> ApproveOrDenyLeave(int leaveId, int approverId, string action)
        {
            var leave = await _context.LeaveRequests.FindAsync(leaveId);
            if (leave == null || leave.Status != "Pending") return false;

            if (action.ToLower() == "approve")
                leave.Status = "Approved";
            else if (action.ToLower() == "deny" || action.ToLower() == "reject")
                leave.Status = "Rejected";
            else
                return false;
            leave.ApprovedBy = approverId;
            leave.ApprovedDate = DateTime.Now;

            _context.LeaveRequests.Update(leave);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<LeaveRequestDto>> GetLeaveRequestsByEmployee(int employeeId)
        {
            return await _context.LeaveRequests.Where(l => l.EmployeeId == employeeId)
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

        public async Task<List<LeaveRequestDto>> SearchLeaveRequests(int? employeeId = null, string? status = null, string? leaveType = null, DateTime? from = null, DateTime? to = null)
        {
            var query = _context.LeaveRequests.AsQueryable();

            if (employeeId.HasValue)
                query = query.Where(l => l.EmployeeId == employeeId);

            if (!string.IsNullOrEmpty(status))
                query = query.Where(l => l.Status == status);

            if (!string.IsNullOrEmpty(leaveType))
                query = query.Where(l => l.LeaveType == leaveType);

            if (from.HasValue)
                query = query.Where(l => l.StartDate >= from.Value);

            if (to.HasValue)
                query = query.Where(l => l.EndDate <= to.Value);

            return await query.Select(l => new LeaveRequestDto
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
    }
}
