import api from './api';

const reportsService = {
  // Get payroll summary report
  getPayrollSummary: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.month) params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      if (filters.department) params.append('department', filters.department);

      const response = await api.get(`/Reports/payroll-summary?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to fetch payroll summary'
      };
    }
  },

  // Get tax statements
  getTaxStatements: async (year) => {
    try {
      const params = new URLSearchParams();
      if (year) params.append('year', year);

      const response = await api.get(`/Reports/tax-statements?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to fetch tax statements'
      };
    }
  },

  // Download payroll summary (CSV)
  downloadPayrollSummary: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.month) params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      if (filters.department) params.append('department', filters.department);

      const response = await api.get(`/Reports/payroll-summary/download?${params.toString()}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payroll_summary_${filters.month || 'all'}_${filters.year || new Date().getFullYear()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to download payroll summary'
      };
    }
  },

  // Download payroll summary as PDF
  downloadPayrollSummaryPDF: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.month) params.append('month', filters.month);
      if (filters.year) params.append('year', filters.year);
      if (filters.department) params.append('department', filters.department);

      const response = await api.get(`/Reports/payroll-summary/download-pdf?${params.toString()}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `payroll_summary_${filters.month || 'all'}_${filters.year || new Date().getFullYear()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to download payroll summary PDF'
      };
    }
  },

  // Download timesheets
  downloadTimesheets: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.managerId) params.append('managerId', filters.managerId);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(`/Reports/timesheets/download?${params.toString()}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `timesheets_${filters.from || 'all'}_${filters.to || 'all'}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to download timesheets'
      };
    }
  }
};

export default reportsService;