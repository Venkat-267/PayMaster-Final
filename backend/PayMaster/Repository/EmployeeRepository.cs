using Microsoft.EntityFrameworkCore;
using PayMaster.DTO;
using PayMaster.Interface;
using PayMaster.Models;
using System.Runtime.InteropServices;

namespace PayMaster.Repository
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly PayMasterDbContext _context;
        public EmployeeRepository(PayMasterDbContext context)
        {
            _context = context;
        }

        public async Task<int> AddEmployee(EmployeeDto dto)
        {
            var employee = new Employee
            {
                UserId = dto.UserId,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email,
                Phone = dto.Phone,
                Address = dto.Address,
                Designation = dto.Designation,
                Department = dto.Department,
                DateOfJoining = dto.DateOfJoining ?? DateTime.Now,
                ManagerId = dto.ManagerId
            };

            // Create the employee
            _context.Employees.Add(employee);
            await _context.SaveChangesAsync();
            return employee.EmployeeId;
        }

        public async Task<List<EmployeeDto>> GetAllEmployees()
        {
            return await _context.Employees
                .Select(emp => new EmployeeDto
                {
                    EmployeeId = emp.EmployeeId,
                    UserId = emp.UserId,
                    FirstName = emp.FirstName,
                    LastName = emp.LastName,
                    Email = emp.Email,
                    Phone = emp.Phone,
                    Address = emp.Address,
                    Designation = emp.Designation,
                    Department = emp.Department,
                    DateOfJoining = emp.DateOfJoining,
                    ManagerId = emp.ManagerId
                }).ToListAsync();
        }

        public async Task<EmployeeDto> GetEmployeeById(int empId)
        {
            var emp = await _context.Employees.FindAsync(empId);
            if (emp == null) return null;

            return new EmployeeDto
            {
                EmployeeId = emp.EmployeeId,
                UserId = emp.UserId,
                FirstName = emp.FirstName,
                LastName = emp.LastName,
                Email = emp.Email,
                Phone = emp.Phone,
                Address = emp.Address,
                Designation = emp.Designation,
                Department = emp.Department,
                DateOfJoining = emp.DateOfJoining,
                ManagerId = emp.ManagerId
            };
        }

        public async Task<bool> UpdateEmployee(int empId, EmployeeDto dto)
        {
            var emp = await _context.Employees.FindAsync(empId);
            if(emp == null) return false;

            emp.FirstName = dto.FirstName;
            emp.LastName = dto.LastName;
            emp.Email = dto.Email;
            emp.Phone = dto.Phone;
            emp.Address = dto.Address;
            emp.Designation = dto.Designation;
            emp.Department = dto.Department;
            emp.DateOfJoining = dto.DateOfJoining ?? emp.DateOfJoining;
            emp.ManagerId = dto.ManagerId;

            _context.Employees.Update(emp);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> UpdatePersonalInfo(int userId, UpdatePersonalInfoDto dto)
        {
            var emp = await _context.Employees.FirstOrDefaultAsync(e => e.UserId == userId);
            if (emp == null)
            {
                return false;
            }

            emp.Email = dto.Email ?? emp.Email;
            emp.Phone = dto.Phone ?? emp.Phone;
            emp.Address = dto.Address ?? emp.Address;

            _context.Employees.Update(emp);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<List<EmployeeDto>> SearchEmployeesAsync(string? name = null, string? department = null, string? designation = null, int? managerId = null)
        {
            var query = _context.Employees.AsQueryable();

            if (!string.IsNullOrEmpty(name))
                query = query.Where(e => (e.FirstName + " " + e.LastName).Contains(name));

            if (!string.IsNullOrEmpty(department))
                query = query.Where(e => e.Department == department);

            if (!string.IsNullOrEmpty(designation))
                query = query.Where(e => e.Designation == designation);

            if (managerId.HasValue)
                query = query.Where(e => e.ManagerId == managerId);

            return await query
                .Select(e => new EmployeeDto
                {
                    EmployeeId = e.EmployeeId,
                    UserId = e.UserId,
                    FirstName = e.FirstName,
                    LastName = e.LastName,
                    Email = e.Email,
                    Phone = e.Phone,
                    Address = e.Address,
                    Designation = e.Designation,
                    Department = e.Department,
                    DateOfJoining = e.DateOfJoining,
                    ManagerId = e.ManagerId
                }).ToListAsync();
        }
    }
}
