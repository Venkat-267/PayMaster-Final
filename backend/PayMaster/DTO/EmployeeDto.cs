namespace PayMaster.DTO
{
    public class EmployeeDto
    {
        public int? EmployeeId { get; set; }
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
    }

    public class UpdatePersonalInfoDto
    {
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
    }
}
