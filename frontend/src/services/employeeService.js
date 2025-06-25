import api from "./api";

const employeeService = {
  // Get all employees
  getAllEmployees: async () => {
    try {
      const response = await api.get("/Employee/all-users");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.Message ||
          error.message ||
          "Failed to fetch employees",
      };
    }
  },

  // search employee
  searchEmployees: async (filters) => {
    try {
      const params = new URLSearchParams();
      if (filters.name) params.append("name", filters.name);
      if (filters.department) params.append("department", filters.department);
      if (filters.designation)
        params.append("designation", filters.designation);
      if (filters.managerId) params.append("managerId", filters.managerId);

      const response = await api.get(`/Employee/search?${params.toString()}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.Message ||
          error.message ||
          "Failed to search employees",
      };
    }
  },

  // Add a new employee
  addEmployee: async (employeeData) => {
    try {
      const response = await api.post("/Employee/add", {
        UserId: employeeData.userId,
        FirstName: employeeData.firstName,
        LastName: employeeData.lastName,
        Email: employeeData.email,
        Phone: employeeData.phone,
        Address: employeeData.address,
        Designation: employeeData.designation,
        Department: employeeData.department,
        DateOfJoining: employeeData.dateOfJoining,
        ManagerId: employeeData.managerId || null,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.Message ||
          error.message ||
          "Failed to add employee",
      };
    }
  },

  // Update employee
  updateEmployee: async (employeeId, employeeData) => {
    try {
      const response = await api.put(`/Employee/update/${employeeId}`, {
        EmployeeId: employeeId,
        UserId: employeeData.userId,
        FirstName: employeeData.firstName,
        LastName: employeeData.lastName,
        Email: employeeData.email,
        Phone: employeeData.phone,
        Address: employeeData.address,
        Designation: employeeData.designation,
        Department: employeeData.department,
        DateOfJoining: employeeData.dateOfJoining,
        ManagerId: employeeData.managerId || null,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.Message ||
          error.message ||
          "Failed to update employee",
      };
    }
  },

  // Update employee personal details
  updatePersonalInfo: async (personalData) => {
    try {
      const response = await api.put("/Employee/update-personal", {
        Phone: personalData.phone,
        Email: personalData.email,
        Address: personalData.address,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error.response?.data?.Message ||
          error.message ||
          "Failed to update personal information",
      };
    }
  },
};

export default employeeService;
