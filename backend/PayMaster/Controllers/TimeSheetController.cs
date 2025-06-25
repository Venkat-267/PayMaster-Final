using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayMaster.DTO;
using PayMaster.Interface;
using System.Security.Claims;

namespace PayMaster.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TimeSheetController : ControllerBase
    {
        private readonly ITimeSheetRepository _repo;
        private readonly IAdminRepository _adminRepo;
        public TimeSheetController(ITimeSheetRepository repo, IAdminRepository adminRepo)
        {
            _repo = repo;
            _adminRepo = adminRepo;
        }

        [Authorize(Roles = "Employee, Manager, Admin")]
        [HttpPost("submit")]
        public async Task<IActionResult> Submit(TimeSheetDto dto)
        {
            var id = await _repo.SubmitTimeSheetAsync(dto);
            if (id!=null)
            {
                await _adminRepo.GenerateAuditLogAsync(new AuditLogDto
                {
                    UserId = dto.EmployeeId,
                    Action = "Submit TimeSheet",
                    Description = $"Employee {dto.EmployeeId} has submitted TimeSheet"
                });
            }
            return Ok(new { Message = "Submitted", TimeSheetId = id });
        }

        [Authorize(Roles = "Employee,Manager,Admin")]
        [HttpGet("my/{employeeId}")]
        public async Task<IActionResult> GetMine(int employeeId)
        {
            var data = await _repo.GetByEmployeeAsync(employeeId);
            return Ok(data);
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpGet("pending/{managerId}")]
        public async Task<IActionResult> GetPending(int managerId)
        {
            var data = await _repo.GetPendingApprovalsAsync(managerId);
            return Ok(data);
        }

        [Authorize(Roles = "Manager,Admin")]
        [HttpPost("approve")]
        public async Task<IActionResult> Approve([FromQuery] int id, [FromQuery] int approverId)
        {
            var result = await _repo.ApproveTimeSheetAsync(id, approverId);
            if (result)
            {
                await _adminRepo.GenerateAuditLogAsync(new AuditLogDto
                {
                    UserId = approverId,
                    Action = "Approve TimeSheet",
                    Description = $"TimeSheet {id} has been approved by {approverId}"
                });
            }
            return result ? Ok("Approved") : BadRequest("Already approved or not found");
        }
    }
}
