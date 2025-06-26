import api from './api';

const leaveRequestService = {
  // Submit new leave request
  submitLeaveRequest: async (leaveData) => {
    try {
      const response = await api.post("/LeaveRequest/submit", {
        EmployeeId: leaveData.employeeId,
        LeaveType: leaveData.leaveType,
        StartDate: leaveData.startDate,
        EndDate: leaveData.endDate,
        Reason: leaveData.reason,
        Satus: "Pending",
        AppliedDate: new Date().toISOString(),
        ApprovedDate:null
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to submit leave request'
      };
    }
  },

  // Get leave requests for specific employee
  getEmployeeLeaveRequests: async (employeeId) => {
    try {
      const response = await api.get(`/LeaveRequest/employee/${employeeId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to fetch leave requests'
      };
    }
  },

  // Search leave requests with filters
  searchLeaveRequests: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.employeeId) params.append('employeeId', filters.employeeId);
      if (filters.status) params.append('status', filters.status);
      if (filters.leaveType) params.append('leaveType', filters.leaveType);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const response = await api.get(`/LeaveRequest/search?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to search leave requests'
      };
    }
  },

  // Review leave request (approve/reject)
  reviewLeaveRequest: async (leaveId, approverId, action) => {
    try {
      const params = new URLSearchParams();
      if (approverId) params.append('approverId', approverId);
      if (action) params.append('action', action);

      const response = await api.post(`/LeaveRequest/review/${leaveId}?${params.toString()}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to review leave request'
      };
    }
  }
};

export default leaveRequestService;