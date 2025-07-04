﻿namespace PayMaster.DTO
{
    public class PayrollDto
    {
        public int? PayrollId { get; set; }
        public int EmployeeId { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }

        public decimal? GrossPay { get; set; }
        public decimal? EmployeePF { get; set; }
        public decimal? EmployerPF { get; set; }
        public decimal? IncomeTax { get; set; }
        public decimal? NetPay { get; set; }

        public int? ProcessedBy { get; set; }
        public DateTime? ProcessedDate { get; set; }
    }

    public class PayrollFullDto
    {
        public int PayrollId { get; set; }
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }

        public decimal? GrossPay { get; set; }
        public decimal? EmployeePF { get; set; }
        public decimal? EmployerPF { get; set; }
        public decimal? IncomeTax { get; set; }
        public decimal? NetPay { get; set; }

        public int? ProcessedBy { get; set; }
        public string? ProcessedByName { get; set; }
        public DateTime ProcessedDate { get; set; }

        public bool IsVerified { get; set; }
        public int? VerifiedBy { get; set; }
        public string? VerifiedByName { get; set; }
        public DateTime? VerifiedDate { get; set; }

        public bool IsPaid { get; set; }
        public DateTime? PaidDate { get; set; }
        public string? PaymentMode { get; set; }
    }

    public class PayrollSummaryDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
        public decimal GrossPay { get; set; }
        public decimal EmployeePF { get; set; }
        public decimal IncomeTax { get; set; }
        public decimal NetPay { get; set; }
    }

    public class TaxStatementDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; }
        public decimal TotalEmployeePF { get; set; }
        public decimal TotalIncomeTax { get; set; }
        public decimal TotalTax => TotalEmployeePF + TotalIncomeTax;
    }
}
