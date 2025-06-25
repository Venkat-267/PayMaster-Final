using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayMaster.DTO;
using PayMaster.Interface;

namespace PayMaster.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminRepository _adminRepo;
        public AdminController(IAdminRepository adminRepo)
        {
            _adminRepo = adminRepo;
        }

        // Audit Logs
        [Authorize(Roles = "Admin")]
        [HttpPost("auditLog")]
        public async Task<IActionResult> LogAction(AuditLogDto dto)
        {
            var logId = await _adminRepo.GenerateAuditLogAsync(dto);
            return Ok(new { Message = "Audit log created", LogId = logId });
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("auditlog/user/{userId}")]
        public async Task<IActionResult> GetUserLogs(int userId)
        {
            var logs = await _adminRepo.GetAuditLogsByUserAsync(userId);
            return Ok(logs);
        }

        [Authorize(Roles = "Admin,Manager,Payroll-Processor")]
        [HttpGet("team/payrolls/{managerId}")]
        public async Task<IActionResult> GetTeamPayrolls(int managerId)
        {
            var list = await _adminRepo.GetTeamPayrollsAsync(managerId);
            return Ok(list);
        }

        [Authorize(Roles = "Admin,Manager,HR-Manager")]
        [HttpGet("team/leave-requests/{managerId}")]
        public async Task<IActionResult> GetTeamPendingLeaves(int managerId)
        {
            var list = await _adminRepo.GetTeamPendingLeavesAsync(managerId);
            return Ok(list);
        }
    }
}
