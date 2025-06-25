using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayMaster.Interface;
using PayMaster.Models;

namespace PayMaster.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PayrollPolicyController : ControllerBase
    {
        private readonly IPayrollPolicyRepository _repo;
        public PayrollPolicyController(IPayrollPolicyRepository repo)
        {
            _repo = repo;
        }

        [Authorize(Roles = "Admin,Payroll-Processor")]
        [HttpPost("set")]
        public async Task<IActionResult> SetPolicy(PayrollPolicy policy)
        {
            var id = await _repo.SetPolicyAsync(policy);
            return Ok(new { Message = "Policy saved", PolicyId = id });
        }

        [Authorize(Roles = "Admin,Payroll-Processor,Employee,Manager")]
        [HttpGet("latest")]
        public async Task<IActionResult> GetLatest()
        {
            var policy = await _repo.GetLatestPolicyAsync();
            return policy == null ? NotFound() : Ok(policy);
        }
    }
}
