import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Table, Badge, Spinner } from 'react-bootstrap';
import { Users, Clock, Calendar, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import { toast } from 'react-toastify';
import dashboardService from '../../services/dashboardService';

const ManagerDashboard = () => {
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

  // Calculate manager-specific stats
  const teamMembers = Math.min(dashboardData.totalEmployees, 12); // Simulate team size
  const pendingTimesheets = dashboardData.timesheets?.filter(t => !t.IsApproved).length || 0;
  const attendanceIssues = Math.floor(teamMembers * 0.1); // Simulate 10% with issues

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manager Dashboard</h2>
        <div className="text-muted">
          Team Overview - {new Date().toLocaleDateString()}
        </div>
      </div>
      
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Team Members</h6>
                  <h3 className="mb-0">{teamMembers}</h3>
                  <small className="text-success">
                    <TrendingUp size={12} className="me-1" />
                    +2 this month
                  </small>
                </div>
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <div className="text-primary">
                    <Users size={24} />
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
                  <h3 className="mb-0">{pendingTimesheets}</h3>
                  <small className={`text-${pendingTimesheets > 0 ? 'warning' : 'success'}`}>
                    <Clock size={12} className="me-1" />
                    {pendingTimesheets > 0 ? 'Need review' : 'All reviewed'}
                  </small>
                </div>
                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  <div className="text-warning">
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
                  <h6 className="text-muted mb-2">Leave Requests</h6>
                  <h3 className="mb-0">3</h3>
                  <small className="text-info">
                    <Calendar size={12} className="me-1" />
                    Pending approval
                  </small>
                </div>
                <div className="bg-info bg-opacity-10 rounded-circle p-3">
                  <div className="text-info">
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
                  <h6 className="text-muted mb-2">Attendance Issues</h6>
                  <h3 className="mb-0">{attendanceIssues}</h3>
                  <small className={`text-${attendanceIssues > 0 ? 'danger' : 'success'}`}>
                    <AlertTriangle size={12} className="me-1" />
                    {attendanceIssues > 0 ? 'Need attention' : 'All good'}
                  </small>
                </div>
                <div className="bg-danger bg-opacity-10 rounded-circle p-3">
                  <div className="text-danger">
                    <AlertTriangle size={24} />
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      <Row className="g-4">
        <Col lg={8}>
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Team Members</h5>
              <Button variant="outline-primary" size="sm" href="/manager/employees">View All</Button>
            </Card.Header>
            <Card.Body>
              <Table responsive hover className="mb-0">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData.employees?.slice(0, 5).map((employee) => (
                    <tr key={employee.EmployeeId}>
                      <td>
                        <div>
                          <strong>{employee.FirstName} {employee.LastName}</strong>
                          <br />
                          <small className="text-muted">ID: {employee.EmployeeId}</small>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div>{employee.Designation}</div>
                          <small className="text-muted">{employee.Department}</small>
                        </div>
                      </td>
                      <td>
                        <Badge bg="success">Active</Badge>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm">
                          View
                        </Button>
                      </td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="4" className="text-center py-4">
                        <Users size={48} className="text-muted mb-3" />
                        <p className="text-muted">No team members found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Pending Approvals</h5>
            </Card.Header>
            <Card.Body>
              <div className="list-group list-group-flush">
                <div className="list-group-item border-0 px-0">
                  <div className="d-flex w-100 justify-content-between mb-1">
                    <h6 className="mb-0">Leave Request</h6>
                    <small className="text-muted">2 days ago</small>
                  </div>
                  <p className="mb-1">Jane Smith - Vacation (3 days)</p>
                  <div className="d-flex mt-2 gap-2">
                    <Button variant="success" size="sm">Approve</Button>
                    <Button variant="danger" size="sm">Reject</Button>
                  </div>
                </div>
                
                <div className="list-group-item border-0 px-0">
                  <div className="d-flex w-100 justify-content-between mb-1">
                    <h6 className="mb-0">Timesheet</h6>
                    <small className="text-muted">1 day ago</small>
                  </div>
                  <p className="mb-1">John Doe - Week of {new Date().toLocaleDateString()}</p>
                  <div className="d-flex mt-2 gap-2">
                    <Button variant="success" size="sm">Approve</Button>
                    <Button variant="danger" size="sm">Reject</Button>
                  </div>
                </div>
                
                <div className="list-group-item border-0 px-0">
                  <div className="d-flex w-100 justify-content-between mb-1">
                    <h6 className="mb-0">Overtime Request</h6>
                    <small className="text-muted">3 hours ago</small>
                  </div>
                  <p className="mb-1">Robert Johnson - 5 hours</p>
                  <div className="d-flex mt-2 gap-2">
                    <Button variant="success" size="sm">Approve</Button>
                    <Button variant="danger" size="sm">Reject</Button>
                  </div>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Team Performance</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                <div>
                  <h6 className="mb-0">Productivity</h6>
                  <small className="text-muted">This month</small>
                </div>
                <div className="text-end">
                  <h4 className="mb-0 text-success">94%</h4>
                  <small className="text-success">+5%</small>
                </div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-light rounded">
                <div>
                  <h6 className="mb-0">Attendance</h6>
                  <small className="text-muted">This month</small>
                </div>
                <div className="text-end">
                  <h4 className="mb-0 text-info">98%</h4>
                  <small className="text-success">+2%</small>
                </div>
              </div>
              
              <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded">
                <div>
                  <h6 className="mb-0">On-time Delivery</h6>
                  <small className="text-muted">Projects</small>
                </div>
                <div className="text-end">
                  <h4 className="mb-0 text-primary">92%</h4>
                  <small className="text-success">+3%</small>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ManagerDashboard;