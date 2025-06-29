import api from "./api";

const leaveRequestService = {
  // Submit new leave request
  submitLeaveRequest: async (leaveData) => {
    try {
      console.log("Submitting leave request with data:", leaveData);

      const response = await api.post("/LeaveRequest/submit", {
        EmployeeId: leaveData.employeeId,
        LeaveType: leaveData.leaveType,
        StartDate: leaveData.startDate,
        EndDate: leaveData.endDate,
        Reason: leaveData.reason,
        Status: "Pending", // Add default status
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Leave request submission error:", error.response?.data);

      // Handle validation errors specifically
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        let errorMessage = "Validation failed: ";

        Object.keys(validationErrors).forEach((field) => {
          if (validationErrors[field] && validationErrors[field].length > 0) {
            errorMessage += `${field}: ${validationErrors[field].join(", ")}. `;
          }
        });

        return {
          success: false,
          message: errorMessage,
        };
      }

      return {
        success: false,
        message:
          error.response?.data?.Message ||
          error.response?.data?.message ||
          error.message ||
          "Failed to submit leave request",
      };
    }
  },

  // Get leave requests for specific employee - Modified to handle both employee ID and user ID
  getEmployeeLeaveRequests: async (employeeIdOrUserId) => {
    try {
      // Try with employee ID first, then user ID if that fails
      let response;
      try {
        response = await api.get(
          `/LeaveRequest/employee/${employeeIdOrUserId}`
        );
      } catch (error) {
        if (error.response?.status === 404) {
          // If not found with employee ID, try with user ID
          response = await api.get(`/LeaveRequest/user/${employeeIdOrUserId}`);
        } else {
          throw error;
        }
      }

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
          "Failed to fetch leave requests",
      };
    }
  },

  // Search leave requests with filters
  searchLeaveRequests: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.employeeId) params.append("employeeId", filters.employeeId);
      if (filters.status) params.append("status", filters.status);
      if (filters.leaveType) params.append("leaveType", filters.leaveType);
      if (filters.from) params.append("from", filters.from);
      if (filters.to) params.append("to", filters.to);

      const response = await api.get(
        `/LeaveRequest/search?${params.toString()}`
      );
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
          "Failed to search leave requests",
      };
    }
  },

  // Review leave request (approve/reject)
  reviewLeaveRequest: async (leaveId, approverId, action) => {
    try {
      const params = new URLSearchParams();
      if (approverId) params.append("approverId", approverId);
      if (action) params.append("action", action);

      const response = await api.post(
        `/LeaveRequest/review/${leaveId}?${params.toString()}`
      );
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
          "Failed to review leave request",
      };
    }
  },
};

export default leaveRequestService;
