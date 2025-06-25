using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayMaster.DTO;
using PayMaster.Interface;

namespace PayMaster.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BenefitController : ControllerBase
    {
        private readonly IBenefitRepository _repo;
        public BenefitController(IBenefitRepository repo)
        {
            _repo = repo;
        }

        [Authorize(Roles = "Admin, Payroll-Processor")]
        [HttpPost("add")]
        public async Task<IActionResult> Add(BenefitDto dto)
        {
            var id = await _repo.AddBenefitAsync(dto);
            return Ok(new { Message = "Benefit added", BenefitId = id });
        }

        [Authorize(Roles = "Admin, Payroll-Processor, Manager")]
        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> Get(int employeeId)
        {
            var data = await _repo.GetBenefitsByEmployeeAsync(employeeId);
            return Ok(data);
        }

        [Authorize(Roles = "Admin, Payroll-Processor")]
        [HttpPut("update")]
        public async Task<IActionResult> Update(BenefitDto dto)
        {
            var result = await _repo.UpdateBenefitAsync(dto);
            return result ? Ok("Benefit updated") : NotFound("Benefit not found");
        }

        [Authorize(Roles = "Admin, Payroll-Processor")]
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _repo.DeleteBenefitAsync(id);
            return result ? Ok("Benefit deleted") : NotFound("Benefit not found");
        }
    }
}
