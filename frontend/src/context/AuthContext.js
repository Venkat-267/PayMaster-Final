import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import authService from '../services/authService';
import { startAutoLogoutTimer, clearAutoLogoutTimer } from '../services/api';

const AuthContext = createContext(null);

// Role definitions
export const ROLES = {
  ADMIN: { id: 1, name: 'Admin' },
  HR_MANAGER: { id: 2, name: 'HR-Manager' },
  PAYROLL_PROCESSOR: { id: 3, name: 'Payroll-Processor' },
  EMPLOYEE: { id: 4, name: 'Employee' },
  MANAGER: { id: 5, name: 'Manager' },
  SUPERVISOR: { id: 6, name: 'Supervisor' }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authService.getCurrentUser();
    const token = localStorage.getItem('accessToken');
    
    if (currentUser && token && authService.isAuthenticated()) {
      setUser(currentUser);
      // Start auto logout timer for existing session
      startAutoLogoutTimer();
    } else {
      // Clear any invalid tokens
      authService.logout();
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        setUser(result.data.user);
        // Start auto logout timer after successful login
        startAutoLogoutTimer();
        toast.success(result.data.message || 'Login successful!');
        return true;
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      toast.error('An unexpected error occurred during login');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        toast.success(result.data.Message || 'Registration successful! Please login.');
        return true;
      } else {
        toast.error(result.message);
        return false;
      }
    } catch (error) {
      toast.error('An unexpected error occurred during registration');
      return false;
    }
  };

  const logout = () => {
    // Clear auto logout timer
    clearAutoLogoutTimer();
    
    authService.logout();
    setUser(null);
    navigate('/login');
    toast.info('You have been logged out.');
  };

  const isAuthenticated = () => {
    return authService.isAuthenticated();
  };

  const getUserRole = () => {
    return authService.getUserRole();
  };

  const getRoleName = (roleId) => {
    const role = Object.values(ROLES).find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  };

  const getCurrentUser = () => {
    return authService.getCurrentUser();
  };

  const hasAccess = (requiredRoles) => {
    if (!user) return false;
    return requiredRoles.includes(user.roleId);
  };

  const contextValue = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    getUserRole,
    getRoleName,
    getCurrentUser,
    hasAccess,
    ROLES,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};