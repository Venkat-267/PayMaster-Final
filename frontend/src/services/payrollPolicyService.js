import api from "./api";

const payrollPolicyService = {
  // Set new payroll policy
  setPayrollPolicy: async (policyData) => {
    try {
      const response = await api.post("/PayrollPolicy/set", {
        DefaultPFPercent: policyData.defaultPFPercent,
        OvertimeRatePerHour: policyData.overtimeRatePerHour,
        EffectiveFrom: policyData.effectiveFrom,
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
          "Failed to set payroll policy",
      };
    }
  },

  // Get latest payroll policy
  getLatestPayrollPolicy: async () => {
    try {
      const response = await api.get("/PayrollPolicy/latest");
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
          "Failed to fetch payroll policy",
      };
    }
  },
};

export default payrollPolicyService;
