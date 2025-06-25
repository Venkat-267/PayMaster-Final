using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayMaster.DTO;
using PayMaster.Interface;

namespace PayMaster.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SalaryStructureController : ControllerBase
    {
        private readonly ISalaryStructureRepository _salaryRepo;

        public SalaryStructureController(ISalaryStructureRepository salaryRepo)
        {
            _salaryRepo = salaryRepo;
        }

        [Authorize(Roles = "Admin, Manager, Payroll-Processor")]
        [HttpPost("assign")]
        public async Task<IActionResult> Assign(SalaryStructureDto dto)
        {
            var salaryId = await _salaryRepo.AssignSalaryStructure(dto);
            return Ok(new { Message = "Salary structure assigned", SalaryId = salaryId });
        }

        [Authorize(Roles = "Admin, Manager,Employee, Payroll-Processor")]
        [HttpGet("current/{employeeId}")]
        public async Task<IActionResult> GetCurrent(int employeeId)
        {
            var salary = await _salaryRepo.GetCurrentSalaryStructure(employeeId);
            if (salary == null) return NotFound(new { Error = "No salary structure found" });

            return Ok(salary);
        }
    }
}
