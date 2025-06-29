import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Spinner, Table, Badge } from 'react-bootstrap';
import { CreditCard, Clock, Calendar, Check, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import dashboardService from '../../services/dashboardService';

const EmployeeDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { getCurrentUser } = useAuth();
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (currentUser?.id) {
      fetchEmployeeDashboardData();
    }
  }, [currentUser]);

  const fetchEmployeeDashboardData = async () => {
    try {
      setLoading(true);
      const result = await dashboardService.getEmployeeDashboardStats(currentUser.id);
      
      if (result.success) {
        setDashboardData(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2 text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-5">
        <AlertTriangle size={48} className="text-muted mb-3" />
        <h5 className="text-muted">Failed to Load Dashboard</h5>
        <p className="text-muted">Unable to fetch your dashboard data. Please try again later.</p>
      </div>
    );
  }

  const getNextPayday = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 28);
    return nextMonth.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Welcome back, {currentUser.userName}!</h2>
          <p className="text-muted mb-0">Here's your personal dashboard overview</p>
        </div>
      </div>
      
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Next Payday</h6>
                  <h3 className="mb-0">{getNextPayday()}</h3>
                  <small className="text-success">
                    <TrendingUp size={12} className="me-1" />
                    On schedule
                  </small>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <div className="text-primary">
                    <CreditCard size={24} />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Hours This Week</h6>
                  <h3 className="mb-0">{dashboardData.totalHoursThisWeek} / 40</h3>
                  <small className={`text-${dashboardData.totalHoursThisWeek >= 40 ? 'success' : 'warning'}`}>
                    <Clock size={12} className="me-1" />
                    {dashboardData.totalHoursThisWeek >= 40 ? 'Complete' : 'In progress'}
                  </small>
                </div>
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <div className="text-success">
                    <Clock size={24} />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Pending Timesheets</h6>
                  <h3 className="mb-0">{dashboardData.pendingTimesheets}</h3>
                  <small className={`text-${dashboardData.pendingTimesheets > 0 ? 'warning' : 'success'}`}>
                    <Check size={12} className="me-1" />
                    {dashboardData.pendingTimesheets > 0 ? 'Need approval' : 'All approved'}
                  </small>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  <div className="text-warning">
                    <Calendar size={24} />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Approved Timesheets</h6>
                  <h3 className="mb-0">{dashboardData.approvedTimesheets}</h3>
                  <small className="text-success">
                    <Check size={12} className="me-1" />
                    This month
                  </small>
                </div>
                <div className="bg-info bg-opacity-10 rounded-circle p-3">
                  <div className="text-info">
                    <Check size={24} />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="g-4">
        <Col lg={7}>
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Payslips</h5>
              <Button variant="outline-primary" size="sm" href="/employee/payslips">View All</Button>
            </Card.Header>
            <Card.Body>
              {dashboardData.recentPayslips && dashboardData.recentPayslips.length > 0 ? (
                <div className="list-group list-group-flush">
                  {dashboardData.recentPayslips.map((payslip) => (
                    <div key={payslip.PayrollId} className="list-group-item d-flex justify-content-between align-items-center border-0 px-0">
                      <div>
                        <h6 className="mb-1">
                          {new Date(payslip.Year, payslip.Month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                        </h6>
                        <small className="text-muted">
                          Processed on {new Date(payslip.ProcessedDate).toLocaleDateString()}
                        </small>
                      </div>
                      <div className="text-end">
                        <Badge bg="success" className="mb-1">
                          {formatCurrency(payslip.NetPay || 0)}
                        </Badge>
                        <br />
                        <small className="text-muted">Net Pay</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <CreditCard size={48} className="text-muted mb-3" />
                  <p className="text-muted">No payslips available yet</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={5}>
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-3">
                <Button variant="primary" href="/employee/timesheets" className="d-flex align-items-center">
                  <Clock size={18} className="me-2" />
                  Submit Timesheet
                </Button>
                <Button variant="success" href="/employee/leave-requests" className="d-flex align-items-center">
                  <Calendar size={18} className="me-2" />
                  Request Leave
                </Button>
                <Button variant="info" href="/employee/benefits" className="d-flex align-items-center">
                  <Check size={18} className="me-2" />
                  View Benefits
                </Button>
                <Button variant="outline-secondary" href="/profile" className="d-flex align-items-center">
                  <CreditCard size={18} className="me-2" />
                  Update Profile
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Timesheet Summary</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                <div>
                  <h6 className="mb-0">This Week</h6>
                  <small className="text-muted">Hours logged</small>
                </div>
                <h4 className="mb-0 text-primary">{dashboardData.totalHoursThisWeek}h</h4>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                <div>
                  <h6 className="mb-0">Pending</h6>
                  <small className="text-muted">Awaiting approval</small>
                </div>
                <h4 className="mb-0 text-warning">{dashboardData.pendingTimesheets}</h4>
              </div>
              
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                <div>
                  <h6 className="mb-0">Approved</h6>
                  <small className="text-muted">This month</small>
                </div>
                <h4 className="mb-0 text-success">{dashboardData.approvedTimesheets}</h4>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDashboard;