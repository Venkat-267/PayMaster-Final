import api from './api';

const userService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const response = await api.get('/User/all');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to fetch users'
      };
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const response = await api.post('/Auth/register', {
        UserName: userData.userName,
        Email: userData.email,
        Password: userData.password,
        RoleId: userData.roleId
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to create user'
      };
    }
  },

  // Update user
  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/User/update/${userId}`, {
        UserId: userId,
        UserName: userData.userName,
        Email: userData.email,
        RoleId: userData.roleId
      });
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to update user'
      };
    }
  },

  // Delete user
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/User/delete/${userId}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Failed to delete user'
      };
    }
  }
};

export default userService;