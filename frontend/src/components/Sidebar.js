import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Users, 
  FileText, 
  Clock, 
  PieChart, 
  Calendar, 
  Heart, 
  LogOut, 
  DollarSign,
  UserPlus,
  Activity,
  BarChart3,
  CheckSquare,
  CreditCard,
  Gift,
  User
} from 'lucide-react';

const Sidebar = ({ isOpen }) => {
  const { getUserRole, logout, ROLES } = useAuth();
  const userRole = getUserRole();
  
  // Define menu items based on user role
  const getMenuItems = () => {
    const commonItems = [
      { path: '/profile', label: 'My Profile', icon: <User size={18} /> },
    ];
    
    // Admin menu items - has access to everything
    if (userRole === ROLES.ADMIN.id) {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <PieChart size={18} /> },
        { path: '/admin/employees', label: 'Employees', icon: <Users size={18} /> },
        { path: '/admin/payroll-management', label: 'Payroll Management', icon: <CreditCard size={18} /> },
        { path: '/admin/leave-requests', label: 'Leave Requests', icon: <Calendar size={18} /> },
        { path: '/admin/timesheets', label: 'Timesheets', icon: <Clock size={18} /> },
        { path: '/admin/timesheet-approval', label: 'Timesheet Approval', icon: <CheckSquare size={18} /> },
        { path: '/admin/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
        ...commonItems,
      ];
    }
    
    // HR Manager menu items
    if (userRole === ROLES.HR_MANAGER.id) {
      return [
        { path: '/hr/dashboard', label: 'Dashboard', icon: <PieChart size={18} /> },
        { path: '/hr/employees', label: 'Employees', icon: <Users size={18} /> },
        { path: '/hr/leave-requests', label: 'Leave Requests', icon: <Calendar size={18} /> },
        { path: '/hr/timesheets', label: 'Timesheets', icon: <Clock size={18} /> },
        { path: '/hr/timesheet-approval', label: 'Timesheet Approval', icon: <CheckSquare size={18} /> },
        { path: '/hr/recruitment', label: 'Recruitment', icon: <UserPlus size={18} /> },
        { path: '/hr/performance', label: 'Performance', icon: <FileText size={18} /> },
        { path: '/hr/reports', label: 'Reports', icon: <BarChart3 size={18} /> },
        ...commonItems,
      ];
    }
    
    // Payroll Processor menu items
    if (userRole === ROLES.PAYROLL_PROCESSOR.id) {
      return [
        { path: '/payroll/dashboard', label: 'Dashboard', icon: <PieChart size={18} /> },
        { path: '/payroll/payroll-management', label: 'Payroll Management', icon: <CreditCard size={18} /> },
        { path: '/payroll/employees', label: 'Employee Salaries', icon: <Users size={18} /> },
        { path: '/payroll/timesheets', label: 'Timesheets', icon: <Clock size={18} /> },
        { path: '/payroll/reports', label: 'Payroll Reports', icon: <BarChart3 size={18} /> },
        ...commonItems,
      ];
    }
    
    // Manager menu items
    if (userRole === ROLES.MANAGER.id) {
      return [
        { path: '/manager/dashboard', label: 'Dashboard', icon: <PieChart size={18} /> },
        { path: '/manager/team', label: 'My Team', icon: <Users size={18} /> },
        { path: '/manager/employees', label: 'Employee Management', icon: <UserPlus size={18} /> },
        { path: '/manager/leave-requests', label: 'Leave Requests', icon: <Calendar size={18} /> },
        { path: '/manager/timesheets', label: 'Timesheets', icon: <Clock size={18} /> },
        { path: '/manager/timesheet-approval', label: 'Timesheet Approval', icon: <CheckSquare size={18} /> },
        ...commonItems,
      ];
    }
    
    // Supervisor menu items
    if (userRole === ROLES.SUPERVISOR.id) {
      return [
        { path: '/supervisor/dashboard', label: 'Dashboard', icon: <PieChart size={18} /> },
        { path: '/supervisor/team', label: 'My Team', icon: <Users size={18} /> },
        { path: '/supervisor/leave-requests', label: 'Leave Requests', icon: <Calendar size={18} /> },
        { path: '/supervisor/timesheets', label: 'Timesheets', icon: <Clock size={18} /> },
        { path: '/supervisor/timesheet-approval', label: 'Timesheet Approval', icon: <CheckSquare size={18} /> },
        { path: '/supervisor/reports', label: 'Reports', icon: <FileText size={18} /> },
        ...commonItems,
      ];
    }
    
    // Employee menu items
    return [
      { path: '/employee/dashboard', label: 'Dashboard', icon: <PieChart size={18} /> },
      { path: '/employee/timesheets', label: 'My Timesheets', icon: <Clock size={18} /> },
      { path: '/employee/leave-requests', label: 'Leave Requests', icon: <Calendar size={18} /> },
      { path: '/employee/benefits', label: 'My Benefits', icon: <Gift size={18} /> },
      ...commonItems,
    ];
  };
  
  const menuItems = getMenuItems();
  
  return (
    <div className={`sidebar ${isOpen ? 'show' : ''}`}>
      <div className="sidebar-header">
        <div className="app-logo">
          <DollarSign size={24} />
          <span>PayMaster</span>
        </div>
      </div>
      
      <div className="sidebar-menu">
        {menuItems.map((item, index) => (
          <NavLink 
            key={index}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
        
        <button 
          className="sidebar-link" 
          onClick={logout} 
          style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;