import api from "./api";

const benefitService = {
  // Add new benefit for an employee
  addBenefit: async (benefitData) => {
    try {
      const response = await api.post("/Benefit/add", {
        EmployeeId: benefitData.employeeId,
        BenefitType: benefitData.benefitType,
        Amount: benefitData.amount,
        Description: benefitData.description,
        AssignedDate: benefitData.assignedDate,
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
          "Failed to add benefit",
      };
    }
  },

  // Get benefits for a specific employee
  getEmployeeBenefits: async (employeeId) => {
    try {
      const response = await api.get(`/Benefit/employee/${employeeId}`);
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
          "Failed to fetch employee benefits",
      };
    }
  },

  // Update existing benefit
  updateBenefit: async (benefitData) => {
    try {
      const response = await api.put("/Benefit/update", {
        BenefitId: benefitData.benefitId,
        EmployeeId: benefitData.employeeId,
        BenefitType: benefitData.benefitType,
        Amount: benefitData.amount,
        Description: benefitData.description,
        AssignedDate: benefitData.assignedDate,
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
          "Failed to update benefit",
      };
    }
  },

  // Delete benefit
  deleteBenefit: async (benefitId) => {
    try {
      const response = await api.delete(`/Benefit/delete/${benefitId}`);
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
          "Failed to delete benefit",
      };
    }
  },
};

export default benefitService;
