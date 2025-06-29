import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import EmployeeDashboard from './pages/Dashboard/EmployeeDashboard';
import ManagerDashboard from './pages/Dashboard/ManagerDashboard';
import Employees from './pages/Admin/Employees';
import PayrollManagement from './pages/Admin/PayrollManagement';
import Reports from './pages/Admin/Reports';
import LeaveRequests from './pages/Employee/LeaveRequests';
import Timesheet from './pages/Employee/Timesheet';
import Benefits from './pages/Employee/Benefits';
import TimesheetApproval from './pages/Manager/TimesheetApproval';
import NotFound from './pages/NotFound';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

const App = () => {
  const { isAuthenticated, getUserRole, ROLES } = useAuth();
  
  // Redirect to the appropriate dashboard based on user role
  const DashboardRouter = () => {
    const role = getUserRole();
    
    if (role === ROLES.ADMIN.id) {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (role === ROLES.HR_MANAGER.id) {
      return <Navigate to="/hr/dashboard" replace />;
    } else if (role === ROLES.PAYROLL_PROCESSOR.id) {
      return <Navigate to="/payroll/dashboard" replace />;
    } else if (role === ROLES.MANAGER.id) {
      return <Navigate to="/manager/dashboard" replace />;
    } else if (role === ROLES.SUPERVISOR.id) {
      return <Navigate to="/supervisor/dashboard" replace />;
    } else {
      return <Navigate to="/employee/dashboard" replace />;
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={!isAuthenticated() ? <Login /> : <Navigate to="/dashboard" replace />} />
      <Route path="/register" element={!isAuthenticated() ? <Register /> : <Navigate to="/dashboard" replace />} />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      
      {/* Common Protected Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout>
            <Profile />
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute requiredRole={ROLES.ADMIN.id}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="payroll-management" element={<PayrollManagement />} />
              <Route path="leave-requests" element={<LeaveRequests />} />
              <Route path="timesheets" element={<Timesheet />} />
              <Route path="timesheet-approval" element={<TimesheetApproval />} />
              <Route path="reports" element={<Reports />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* HR Manager Routes */}
      <Route path="/hr/*" element={
        <ProtectedRoute requiredRole={ROLES.HR_MANAGER.id}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="leave-requests" element={<LeaveRequests />} />
              <Route path="timesheets" element={<Timesheet />} />
              <Route path="timesheet-approval" element={<TimesheetApproval />} />
              <Route path="reports" element={<Reports />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Payroll Processor Routes */}
      <Route path="/payroll/*" element={
        <ProtectedRoute requiredRole={ROLES.PAYROLL_PROCESSOR.id}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="payroll-management" element={<PayrollManagement />} />
              <Route path="timesheets" element={<Timesheet />} />
              <Route path="reports" element={<Reports />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Manager Routes */}
      <Route path="/manager/*" element={
        <ProtectedRoute requiredRole={ROLES.MANAGER.id}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="leave-requests" element={<LeaveRequests />} />
              <Route path="timesheets" element={<Timesheet />} />
              <Route path="timesheet-approval" element={<TimesheetApproval />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Supervisor Routes */}
      <Route path="/supervisor/*" element={
        <ProtectedRoute requiredRole={ROLES.SUPERVISOR.id}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<ManagerDashboard />} />
              <Route path="leave-requests" element={<LeaveRequests />} />
              <Route path="timesheets" element={<Timesheet />} />
              <Route path="timesheet-approval" element={<TimesheetApproval />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Employee Routes */}
      <Route path="/employee/*" element={
        <ProtectedRoute requiredRole={ROLES.EMPLOYEE.id}>
          <Layout>
            <Routes>
              <Route path="dashboard" element={<EmployeeDashboard />} />
              <Route path="leave-requests" element={<LeaveRequests />} />
              <Route path="timesheets" element={<Timesheet />} />
              <Route path="benefits" element={<Benefits />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
      
      {/* Redirect to login by default */}
      <Route path="/" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />} />
      
      {/* 404 Page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;