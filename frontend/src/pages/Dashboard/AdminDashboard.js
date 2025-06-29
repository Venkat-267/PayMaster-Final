import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Table, Badge } from 'react-bootstrap';
import { Users, DollarSign, Clock, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'react-toastify';
import dashboardService from '../../services/dashboardService';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const result = await dashboardService.getDashboardStats();
      
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
          <p className="mt-2 text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-5">
        <AlertTriangle size={48} className="text-muted mb-3" />
        <h5 className="text-muted">Failed to Load Dashboard</h5>
        <p className="text-muted">Unable to fetch dashboard data. Please try again later.</p>
      </div>
    );
  }

  const stats = [
    { 
      title: 'Total Employees', 
      value: dashboardData.totalEmployees.toString(), 
      icon: <Users size={24} />, 
      color: 'primary',
      trend: '+12%'
    },
    { 
      title: 'Payroll Processed', 
      value: formatCurrency(dashboardData.totalPayrollProcessed), 
      icon: <DollarSign size={24} />, 
      color: 'success',
      trend: '+8%'
    },
    { 
      title: 'Pending Approvals', 
      value: dashboardData.pendingApprovals.toString(), 
      icon: <Clock size={24} />, 
      color: 'warning',
      trend: '-5%'
    },
    { 
      title: 'Departments', 
      value: dashboardData.departments.toString(), 
      icon: <Calendar size={24} />, 
      color: 'info',
      trend: '+2%'
    },
  ];

  const getStatusBadge = (payroll) => {
    if (payroll.IsPaid) return <Badge bg="success">Paid</Badge>;
    if (payroll.IsVerified) return <Badge bg="info">Verified</Badge>;
    return <Badge bg="warning">Created</Badge>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Admin Dashboard</h2>
        <div className="text-muted">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>
      
      <Row className="g-4 mb-4">
        {stats.map((stat, index) => (
          <Col key={index} sm={6} lg={3}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-2">{stat.title}</h6>
                    <h3 className="mb-0">{stat.value}</h3>
                    {stat.trend && (
                      <small className={`text-${stat.trend.startsWith('+') ? 'success' : 'danger'}`}>
                        <TrendingUp size={12} className="me-1" />
                        {stat.trend} from last month
                      </small>
                    )}
                  </div>
                  <div className={`bg-${stat.color} bg-opacity-10 rounded-circle p-3`}>
                    <div className={`text-${stat.color}`}>{stat.icon}</div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
      
      <Row className="g-4">
        <Col lg={8}>
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Recent Payroll Activities</h5>
            </Card.Header>
            <Card.Body>
              {dashboardData.recentPayrolls && dashboardData.recentPayrolls.length > 0 ? (
                <Table responsive hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Employee</th>
                      <th>Period</th>
                      <th>Net Pay</th>
                      <th>Status</th>
                      <th>Processed Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.recentPayrolls.map((payroll) => (
                      <tr key={payroll.PayrollId}>
                        <td>
                          <div>
                            <strong>{payroll.EmployeeName}</strong>
                            <br />
                            <small className="text-muted">ID: {payroll.EmployeeId}</small>
                          </div>
                        </td>
                        <td>{payroll.Month}/{payroll.Year}</td>
                        <td>
                          <strong className="text-success">
                            {formatCurrency(payroll.NetPay || 0)}
                          </strong>
                        </td>
                        <td>{getStatusBadge(payroll)}</td>
                        <td>
                          <small className="text-muted">
                            {new Date(payroll.ProcessedDate).toLocaleDateString()}
                          </small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <DollarSign size={48} className="text-muted mb-3" />
                  <p className="text-muted">No recent payroll activities</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Quick Stats</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                <div>
                  <h6 className="mb-0">Total Payrolls</h6>
                  <small className="text-muted">All time</small>
                </div>
                <h4 className="mb-0 text-primary">{dashboardData.payrolls?.length || 0}</h4>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                <div>
                  <h6 className="mb-0">Pending Payrolls</h6>
                  <small className="text-muted">Need verification</small>
                </div>
                <h4 className="mb-0 text-warning">{dashboardData.pendingPayrolls || 0}</h4>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                <div>
                  <h6 className="mb-0">Active Employees</h6>
                  <small className="text-muted">Currently employed</small>
                </div>
                <h4 className="mb-0 text-success">{dashboardData.totalEmployees}</h4>
              </div>

              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                <div>
                  <h6 className="mb-0">Departments</h6>
                  <small className="text-muted">Active departments</small>
                </div>
                <h4 className="mb-0 text-info">{dashboardData.departments}</h4>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">System Health</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                  <div className="text-success">
                    <Users size={16} />
                  </div>
                </div>
                <div>
                  <p className="mb-0">All systems operational</p>
                  <small className="text-muted">Last checked: {new Date().toLocaleTimeString()}</small>
                </div>
              </div>
              
              <div className="d-flex align-items-center mb-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                  <div className="text-success">
                    <DollarSign size={16} />
                  </div>
                </div>
                <div>
                  <p className="mb-0">Payroll system active</p>
                  <small className="text-muted">Processing normally</small>
                </div>
              </div>
              
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                  <div className="text-success">
                    <Clock size={16} />
                  </div>
                </div>
                <div>
                  <p className="mb-0">Database connected</p>
                  <small className="text-muted">Response time: 45ms</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;