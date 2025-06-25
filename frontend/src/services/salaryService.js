import api from "./api";

const salaryService = {
  // Assign salary structure to an employee
  assignSalaryStructure: async (salaryData) => {
    try {
      const response = await api.post("/SalaryStructure/assign", {
        EmployeeId: salaryData.employeeId,
        BasicPay: salaryData.basicPay,
        HRA: salaryData.hra,
        Allowances: salaryData.allowances,
        PFPercentage: salaryData.pfPercentage,
        EffectiveFrom: salaryData.effectiveFrom,
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
          "Failed to assign salary structure",
      };
    }
  },

  // Get current salary structure for an employee
  getCurrentSalaryStructure: async (employeeId) => {
    try {
      const response = await api.get(`/SalaryStructure/current/${employeeId}`);
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
          "Failed to fetch salary structure",
      };
    }
  },
};

export default salaryService;
