using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PayMaster.Interface;
using System.Text;

namespace PayMaster.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReportsController : ControllerBase
    {
        private readonly IAdminRepository _repo;
        public ReportsController(IAdminRepository repo)
        {
            _repo = repo;
        }

        [Authorize(Roles = "Admin,Payroll-Processor,Manager")]
        [HttpGet("payroll-summary")]
        public async Task<IActionResult> GetPayrollSummary([FromQuery] int month, [FromQuery] int year, [FromQuery] string? department)
        {
            var data = await _repo.GetPayrollSummaryAsync(month, year, department);
            return Ok(data);
        }

        [Authorize(Roles = "Admin,Payroll-Processor,Manager")]
        [HttpGet("tax-statements")]
        public async Task<IActionResult> GetTaxStatements([FromQuery] int year)
        {
            var data = await _repo.GetTaxStatementsAsync(year);
            return Ok(data);
        }

        [Authorize(Roles = "Admin,Payroll-Processor,Manager")]
        [HttpGet("payroll-summary/download")]
        public async Task<IActionResult> DownloadCsv([FromQuery] int month, [FromQuery] int year, [FromQuery] string? department)
        {
            var summary = await _repo.GetPayrollSummaryAsync(month, year, department);

            var csv = new StringBuilder();
            csv.AppendLine("EmployeeId,Name,Month,Year,GrossPay,PF,Tax,NetPay");

            foreach (var item in summary)
            {
                csv.AppendLine($"{item.EmployeeId},{item.EmployeeName},{item.Month},{item.Year},{item.GrossPay},{item.EmployeePF},{item.IncomeTax},{item.NetPay}");
            }

            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            return File(bytes, "text/csv", $"PayrollSummary_{month}_{year}.csv");
        }

        [Authorize(Roles = "Admin,Payroll-Processor,Manager")]
        [HttpGet("payroll-summary/download-pdf")]
        public async Task<IActionResult> DownloadPdf([FromQuery] int month, [FromQuery] int year, [FromQuery] string? department)
        {
            var summary = await _repo.GetPayrollSummaryAsync(month, year, department);

            if (summary == null || summary.Count == 0)
                return NotFound("No payroll data found for the given filter.");

            var pdfBytes = PdfReportGenerator.GeneratePayrollSummaryPdf(summary, month, year);

            string safeDept = string.IsNullOrEmpty(department) ? "All" : department.Replace(" ", "_");
            string fileName = $"PayrollSummary_{month}_{year}_{safeDept}.pdf";

            return File(pdfBytes, "application/pdf", fileName);
        }

        [Authorize(Roles = "Admin,Payroll-Processor,Manager")]
        [HttpGet("timesheets/download")]
        public async Task<IActionResult> DownloadTimeSheetCsv(
            [FromQuery] int? employeeId,
            [FromQuery] int? managerId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var timesheets = await _repo.GetTimeSheetReportAsync(employeeId, managerId, from, to);

            if (timesheets == null || timesheets.Count == 0)
                return NotFound("No timesheet data found for the given filters.");

            var csv = new StringBuilder();
            csv.AppendLine("Employee Name,Date,Hours Worked,Task Description,Approved");

            foreach (var t in timesheets)
            {
                csv.AppendLine($"{t.EmployeeName},{t.WorkDate:yyyy-MM-dd},{t.HoursWorked},{t.TaskDescription},{(t.IsApproved ? "Yes" : "No")}");
            }

            var bytes = Encoding.UTF8.GetBytes(csv.ToString());
            string fileName = $"TimeSheetReport_{DateTime.Now:yyyyMMdd_HHmmss}.csv";

            return File(bytes, "text/csv", fileName);
        }

    }
}
