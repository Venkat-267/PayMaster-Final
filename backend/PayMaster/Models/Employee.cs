namespace PayMaster.Models
{
    public class Employee
    {
        public int EmployeeId { get; set; }
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public string Address { get; set; }
        public string Designation { get; set; }
        public string Department { get; set; }
        public DateTime? DateOfJoining { get; set; }
        public int? ManagerId { get; set; }

        public User User { get; set; }
        public Employee Manager { get; set; }
        public ICollection<Employee> Subordinates { get; set; }
        public ICollection<LeaveRequest> LeaveRequests { get; set; }
        public ICollection<SalaryStructure> SalaryStructures {  get; set; }
        public ICollection<Benefit> Benefits {  get; set; }
        public ICollection<Payroll> Payrolls { get; set; }
    }
}
