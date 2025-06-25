using Microsoft.EntityFrameworkCore;
using PayMaster.DTO;
using PayMaster.Interface;
using PayMaster.Models;

namespace PayMaster.Repository
{
    public class TimeSheetRepository : ITimeSheetRepository
    {
        private readonly PayMasterDbContext _context;
        public TimeSheetRepository(PayMasterDbContext context)
        {
            _context = context;
        }

        public async Task<int> SubmitTimeSheetAsync(TimeSheetDto dto)
        {
            var timesheet = new TimeSheet
            {
                EmployeeId = dto.EmployeeId,
                WorkDate = dto.WorkDate,
                HoursWorked = dto.HoursWorked,
                TaskDescription = dto.TaskDescription
            };

            _context.TimeSheets.Add(timesheet);
            await _context.SaveChangesAsync();
            return timesheet.TimeSheetId;
        }

        public async Task<List<TimeSheetDto>> GetByEmployeeAsync(int employeeId)
        {
            return await _context.TimeSheets
                .Where(t => t.EmployeeId == employeeId)
                .Select(t => new TimeSheetDto
                {
                    TimeSheetId = t.TimeSheetId,
                    EmployeeId = t.EmployeeId,
                    WorkDate = t.WorkDate,
                    HoursWorked = t.HoursWorked,
                    TaskDescription = t.TaskDescription,
                    IsApproved = t.IsApproved
                })
                .ToListAsync();
        }

        public async Task<List<TimeSheetDto>> GetPendingApprovalsAsync(int managerId)
        {
            var employees = await _context.Employees
                .Where(e => e.ManagerId == managerId)
                .Select(e => e.EmployeeId)
                .ToListAsync();

            return await _context.TimeSheets
                .Where(t => employees.Contains(t.EmployeeId) && !t.IsApproved)
                .Select(t => new TimeSheetDto
                {
                    TimeSheetId = t.TimeSheetId,
                    EmployeeId = t.EmployeeId,
                    WorkDate = t.WorkDate,
                    HoursWorked = t.HoursWorked,
                    TaskDescription = t.TaskDescription,
                    IsApproved = t.IsApproved
                }).ToListAsync();
        }

        public async Task<bool> ApproveTimeSheetAsync(int timeSheetId, int approverId)
        {
            var timesheet = await _context.TimeSheets.FindAsync(timeSheetId);
            if (timesheet == null || timesheet.IsApproved) return false;

            timesheet.IsApproved = true;
            timesheet.ApprovedBy = approverId;
            timesheet.ApprovedDate = DateTime.Now;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}