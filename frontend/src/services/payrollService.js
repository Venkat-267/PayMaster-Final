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

  // Get all payrolls using the new detailed endpoint
  getAllPayrolls: async () => {
    try {
      const response = await api.get('/Payroll/all-details');
      
      // Map the API response to include proper status and employee info
      const payrollsWithStatus = (response.data || []).map(payroll => {
        // Determine status based on API fields
        let status = 'Created'; // Default
        
        if (payroll.IsPaid) {
          status = 'Paid';
        } else if (payroll.IsVerified) {
          status = 'Verified';
        }
        
        return {
          ...payroll,
          Status: status,
          employeeName: payroll.EmployeeName,
          employeeCode: `EMP${payroll.EmployeeId.toString().padStart(3, '0')}`,
          department: 'Unknown' // API doesn't provide department in this endpoint
        };
      });

      return {
        success: true,
        data: payrollsWithStatus.sort((a, b) => new Date(b.ProcessedDate) - new Date(a.ProcessedDate))
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to fetch all payrolls'
      };
    }
  },

  // Get payroll for specific employee, month, year
  getPayrollForEmployee: async (employeeId, month, year) => {
    try {
      const response = await api.get(`/Payroll/${employeeId}/${month}/${year}`);
      
      // Add status to the response
      const payrollWithStatus = {
        ...response.data,
        Status: 'Created' // Default status for individual payroll
      };
      
      return {
        success: true,
        data: payrollWithStatus
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
      
      // Add status to each payroll record
      const payrollsWithStatus = (response.data || []).map(payroll => ({
        ...payroll,
        Status: 'Created' // Default status for history
      }));
      
      return {
        success: true,
        data: payrollsWithStatus
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to fetch payroll history'
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
  }
};

export default payrollService;