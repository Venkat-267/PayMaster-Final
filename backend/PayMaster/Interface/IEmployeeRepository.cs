using PayMaster.DTO;

namespace PayMaster.Interface
{
    public interface IEmployeeRepository
    {
        Task<int> AddEmployee(EmployeeDto dto);
        Task<List<EmployeeDto>> GetAllEmployees();
        Task<EmployeeDto> GetEmployeeById(int empId);
        Task<bool> UpdateEmployee(int employeeId, EmployeeDto dto);
        Task<bool> UpdatePersonalInfo(int userId, UpdatePersonalInfoDto dto);
        Task<List<EmployeeDto>> SearchEmployeesAsync(string? name = null, string? department = null, string? designation = null, int? managerId = null);
    }
}
