import api from './api';

const payrollService = {
  // Generate payroll for an employee
  generatePayroll: async (employeeId, month, year, processedBy) => {
    try {
      const params = new URLSearchParams();
      if (employeeId) params.append('employeeId', employeeId);
      if (month) params.append('month', month);
      if (year) params.append('year', year);
      if (processedBy) params.append('processedBy', processedBy);

      const response = await api.post(`/Payroll/generate?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to generate payroll'
      };
    }
  },

  // Verify payroll
  verifyPayroll: async (payrollId, userId) => {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId);

      const response = await api.post(`/Payroll/verify/${payrollId}?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to verify payroll'
      };
    }
  },

  // Mark payroll as paid
  markPayrollAsPaid: async (payrollId, paymentMode) => {
    try {
      const params = new URLSearchParams();
      if (paymentMode) params.append('mode', paymentMode);

      const response = await api.post(`/Payroll/mark-paid/${payrollId}?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to mark payroll as paid'
      };
    }
  },

  // Get payroll for employee for specific month/year
  getPayrollForEmployee: async (employeeId, month, year) => {
    try {
      const response = await api.get(`/Payroll/${employeeId}/${month}/${year}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to fetch payroll'
      };
    }
  },

  // Get payroll history for employee
  getPayrollHistory: async (employeeId) => {
    try {
      const response = await api.get(`/Payroll/history/${employeeId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to fetch payroll history'
      };
    }
  }
};

export default payrollService;