import api from './api';

const authService ={
    register: async (userData) => {
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
        message: error.response?.data?.Message || error.message || 'Registration failed'
      };
    }
  },
  
  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/Auth/login', {
        UserName: credentials.userName,
        Password: credentials.password
      });
      
      const { AccessToken, RefreshToken, UserId, Role, Message } = response.data;
      
      // Store tokens and user info
      localStorage.setItem('accessToken', AccessToken);
      localStorage.setItem('refreshToken', RefreshToken);
      const roleId = authService.getRoleIdFromName(Role);
      // Create user object
      const user = {
        id: UserId,
        userName: credentials.userName,
        role: Role,
        roleId: roleId
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        success: true,
        data: {
          user,
          message: Message
        }
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.Message || error.message || 'Login failed'
      };
    }
  },
  
  getRoleIdFromName: (roleName) => {
    const roleMap = {
      'Admin': 1,
      'HR-Manager': 2,
      'Payroll-Processor': 3,
      'Employee': 4,
      'Manager': 5,
      'Supervisor': 6
    };
    return roleMap[roleName] || 4; 
  },
  
  // Refresh token 
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/Auth/refresh', {
        RefreshToken: refreshToken
      });
      
      const { AccessToken, RefreshToken: newRefreshToken } = response.data;
      
      localStorage.setItem('accessToken', AccessToken);
      if (newRefreshToken) {
        localStorage.setItem('refreshToken', newRefreshToken);
      }
      
      return { success: true };
    } catch (error) {
      // If refresh fails, logout user
      authService.logout();
      return { success: false };
    }
  },
  
  // Get current authenticated user from localStorage
  getCurrentUser: () => {
    const userJson = localStorage.getItem('user');
    if (userJson) {
      try {
        return JSON.parse(userJson);
      } catch (error) {
        return null;
      }
    }
    return null;
  },
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },
  
  // Get user role
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user ? user.roleId : 0;
  },
  
  // Log out user
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

export default authService;