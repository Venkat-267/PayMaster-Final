import api from './api';

const dashboardService = {
  // Get dashboard statistics
  getDashboardStats: async () => {
    try {
      // Get employees count
      const employeesResponse = await api.get('/Employee/all-users');
      const employees = employeesResponse.data || [];

      // Get payrolls data
      const payrollsResponse = await api.get('/Payroll/all-details');
      const payrolls = payrollsResponse.data || [];

      // Get timesheets data (if available)
      let timesheets = [];
      try {
        // This might need adjustment based on available timesheet endpoints
        const timesheetsResponse = await api.get('/TimeSheet/all');
        timesheets = timesheetsResponse.data || [];
      } catch (error) {
        console.log('Timesheets endpoint not available');
      }

      // Calculate statistics
      const totalEmployees = employees.length;
      const totalPayrollProcessed = payrolls
        .filter(p => p.IsPaid)
        .reduce((sum, p) => sum + (p.NetPay || 0), 0);
      const pendingApprovals = timesheets.filter(t => !t.IsApproved).length;
      const pendingPayrolls = payrolls.filter(p => !p.IsVerified).length;

      // Get unique departments
      const departments = [...new Set(employees.map(emp => emp.Department).filter(Boolean))];

      return {
        success: true,
        data: {
          totalEmployees,
          totalPayrollProcessed,
          pendingApprovals,
          pendingPayrolls,
          departments: departments.length,
          recentPayrolls: payrolls
            .sort((a, b) => new Date(b.ProcessedDate) - new Date(a.ProcessedDate))
            .slice(0, 5),
          employees,
          payrolls,
          timesheets
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to fetch dashboard data'
      };
    }
  },

  // Get employee-specific dashboard data
  getEmployeeDashboardStats: async (employeeId) => {
    try {
      // Get employee payroll history
      const payrollResponse = await api.get(`/Payroll/history/${employeeId}`);
      const payrolls = payrollResponse.data || [];

      // Get employee timesheets
      let timesheets = [];
      try {
        const timesheetsResponse = await api.get(`/TimeSheet/my/${employeeId}`);
        timesheets = timesheetsResponse.data || [];
      } catch (error) {
        console.log('Employee timesheets not available');
      }

      // Calculate employee stats
      const totalHoursThisWeek = timesheets
        .filter(t => {
          const workDate = new Date(t.WorkDate);
          const weekStart = new Date();
          weekStart.setDate(weekStart.getDate() - weekStart.getDay());
          return workDate >= weekStart;
        })
        .reduce((sum, t) => sum + (t.HoursWorked || 0), 0);

      const recentPayslips = payrolls
        .filter(p => p.IsPaid)
        .sort((a, b) => new Date(b.ProcessedDate) - new Date(a.ProcessedDate))
        .slice(0, 3);

      return {
        success: true,
        data: {
          totalHoursThisWeek,
          recentPayslips,
          pendingTimesheets: timesheets.filter(t => !t.IsApproved).length,
          approvedTimesheets: timesheets.filter(t => t.IsApproved).length,
          timesheets,
          payrolls
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to fetch employee dashboard data'
      };
    }
  }
};

export default dashboardService;