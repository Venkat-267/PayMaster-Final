using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayMaster.DTO;
using PayMaster.Interface;
using PayMaster.Models;
using System.Security.Claims;

namespace PayMaster.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeeController : ControllerBase
    {
        private readonly IEmployeeRepository _employeeRepo;
        private readonly IAdminRepository _adminRepo;
        public EmployeeController(IEmployeeRepository employeeRepo, IAdminRepository adminRepo)
        {
            _employeeRepo = employeeRepo;
            _adminRepo = adminRepo;
        }

        [Authorize(Roles = "Admin, Manager, HR-Manager")]
        [HttpPost("add")]
        public async Task<IActionResult> Add(EmployeeDto dto)
        {
            try
            {
                var empId = await _employeeRepo.AddEmployee(dto);
                await _adminRepo.GenerateAuditLogAsync(new AuditLogDto
                {
                    UserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value),
                    Action = "Create Employee",
                    Description = $"Employee {empId} has been created"
                });
                return Ok(new { Message = "Employee added", EmployeeId = empId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [Authorize(Roles = "Admin, Manager, Payroll-Processor, HR-Manager")]
        [HttpGet("all-users")]
        public async Task<IActionResult> GetAll()
        {
            var employees = await _employeeRepo.GetAllEmployees();
            return Ok(employees);
        }

        [Authorize(Roles = "Admin,Employee, Manager, Payroll-Processor, HR-Manager")]
        [HttpGet("{employeeId}")]
        public async Task<IActionResult> Get(int employeeId)
        {
            var emp = await _employeeRepo.GetEmployeeById(employeeId);
            if (emp == null) return NotFound(new { Error = "Employee not found" });
            return Ok(emp);
        }

        [Authorize(Roles = "Admin,Payroll-Processor, Manager")]
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string? name, [FromQuery] string? department, [FromQuery] string? designation, [FromQuery] int? managerId)
        {
            var result = await _employeeRepo.SearchEmployeesAsync(name, department, designation, managerId);
            return Ok(result);
        }

        [Authorize(Roles = "Admin, Manager")]
        [HttpPut("update/{employeeId}")]
        public async Task<IActionResult> Update(int employeeId, EmployeeDto dto)
        {
            var success = await _employeeRepo.UpdateEmployee(employeeId, dto);
            if (!success) return NotFound(new { Error = "Employee not found" });
            await _adminRepo.GenerateAuditLogAsync(new AuditLogDto
            {
                UserId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value),
                Action = "Update Employee",
                Description = $"Employee {employeeId} has been updated"
            });
            return Ok(new { Message = "Employee updated" });
        }

        [Authorize(Roles = "Employee")]
        [HttpPut("update-personal")]
        public async Task<IActionResult> UpdatePersonalInfo([FromBody] UpdatePersonalInfoDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value);

            var success = await _employeeRepo.UpdatePersonalInfo(userId, dto);
            if (!success)
                return NotFound(new { Error = "Employee not found" });
            await _adminRepo.GenerateAuditLogAsync(new AuditLogDto
            {
                UserId = userId,
                Action = "Update Employee",
                Description = $"Employee {userId} has been updated"
            });
            return Ok(new { Message = "Personal information updated successfully." });
        }
    }
}
