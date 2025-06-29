import api from './api';

const timesheetService = {
  // Submit new timesheet
  submitTimesheet: async (timesheetData) => {
    try {
      const response = await api.post('/TimeSheet/submit', {
        EmployeeId: timesheetData.employeeId,
        WorkDate: timesheetData.workDate,
        HoursWorked: timesheetData.hoursWorked,
        TaskDescription: timesheetData.taskDescription,
        IsApproved: false
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to submit timesheet'
      };
    }
  },

  // Get employee timesheets
  getEmployeeTimesheets: async (employeeId) => {
    try {
      const response = await api.get(`/TimeSheet/my/${employeeId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to fetch timesheets'
      };
    }
  },

  // Get pending timesheets for manager
  getPendingTimesheets: async (managerId) => {
    try {
      const response = await api.get(`/TimeSheet/pending/${managerId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to fetch pending timesheets'
      };
    }
  },

  // Approve timesheet
  approveTimesheet: async (timesheetId, approverId) => {
    try {
      const params = new URLSearchParams();
      if (timesheetId) params.append('id', timesheetId);
      if (approverId) params.append('approverId', approverId);

      const response = await api.post(`/TimeSheet/approve?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to approve timesheet'
      };
    }
  },

  // Get all timesheets for managers/admins
  getAllTimesheets: async (employees = []) => {
    try {
      const allTimesheets = [];
      
      // Fetch timesheets for each employee
      for (const employee of employees) {
        try {
          const result = await timesheetService.getEmployeeTimesheets(employee.EmployeeId);
          if (result.success && result.data) {
            // Add employee information to each timesheet record
            const timesheetsWithEmployeeInfo = result.data.map(timesheet => ({
              ...timesheet,
              employeeName: `${employee.FirstName} ${employee.LastName}`,
              employeeEmail: employee.Email,
              department: employee.Department,
              status: timesheet.IsApproved ? 'Approved' : 'Pending'
            }));
            allTimesheets.push(...timesheetsWithEmployeeInfo);
          }
        } catch (error) {
          console.error(`Failed to fetch timesheets for employee ${employee.EmployeeId}:`, error);
        }
      }

      return {
        success: true,
        data: allTimesheets.sort((a, b) => new Date(b.WorkDate) - new Date(a.WorkDate))
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch all timesheets'
      };
    }
  }
};

export default timesheetService;