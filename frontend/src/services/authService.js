import api from './api';

// Authentication service methods
const authService = {
  // Helper function to map role names to IDs
  getRoleIdFromName: (roleName) => {
    const roleMap = {
      'Admin': 1,
      'HR-Manager': 2,
      'Payroll-Processor': 3,
      'Employee': 4,
      'Manager': 5,
      'Supervisor': 6
    };
    return roleMap[roleName] || 4; // Default to Employee
  },

  // Register new user
  register: async (userData) => {
    try {
      console.log('Attempting registration with data:', {
        UserName: userData.userName,
        Email: userData.email,
        RoleId: userData.roleId,
        // Don't log password for security
        PasswordLength: userData.password?.length
      });

      const response = await api.post('/Auth/register', {
        UserName: userData.userName,
        Email: userData.email,
        Password: userData.password,
        RoleId: userData.roleId
      });
      
      // Log the response to understand the structure
      console.log('Registration response:', response.data);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Registration error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });

      // Handle specific error cases
      let errorMessage = 'Registration failed';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        
        // Check for different error message formats
        if (errorData.Message) {
          errorMessage = errorData.Message;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.Error) {
          errorMessage = errorData.Error;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
        
        // Handle specific constraint violations
        if (errorMessage.toLowerCase().includes('entity changes') || 
            errorMessage.toLowerCase().includes('constraint')) {
          
          // Try to determine which constraint failed
          if (errorMessage.toLowerCase().includes('email') || 
              errorMessage.toLowerCase().includes('unique') && errorMessage.toLowerCase().includes('email')) {
            errorMessage = 'This email address is already registered. Please use a different email.';
          } else if (errorMessage.toLowerCase().includes('username') || 
                     errorMessage.toLowerCase().includes('user') && errorMessage.toLowerCase().includes('name')) {
            errorMessage = 'This username is already taken. Please choose a different username.';
          } else if (errorMessage.toLowerCase().includes('role')) {
            errorMessage = 'Invalid role selected. Please try again or contact support.';
          } else {
            errorMessage = 'Registration failed: Email or username already exists, or invalid role selected.';
          }
        }
      }
      
      return {
        success: false,
        message: errorMessage
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
      
      // Create user object - fix the function call
      const user = {
        id: UserId,
        userName: credentials.userName,
        role: Role,
        roleId: authService.getRoleIdFromName(Role) // Use authService.getRoleIdFromName instead of this.getRoleIdFromName
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
  
  // Refresh token (if needed later)
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