import React from 'react';
import { Card, Row, Col, Button, Table } from 'react-bootstrap';
import { Users, Clock, Calendar, AlertTriangle } from 'lucide-react';

const ManagerDashboard = () => {
  return (
    <div>
      <h2 className="mb-4">Manager Dashboard</h2>
      
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Team Members</h6>
                  <h3 className="mb-0">12</h3>
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
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Pending Timesheets</h6>
                  <h3 className="mb-0">5</h3>
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
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Leave Requests</h6>
                  <h3 className="mb-0">3</h3>
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
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Attendance Issues</h6>
                  <h3 className="mb-0">2</h3>
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
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Team Members</h5>
              <Button variant="outline-primary" size="sm">View All</Button>
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
                  <tr>
                    <td>John Doe</td>
                    <td>Software Developer</td>
                    <td><span className="badge bg-success">Active</span></td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2">View</Button>
                    </td>
                  </tr>
                  <tr>
                    <td>Jane Smith</td>
                    <td>UX Designer</td>
                    <td><span className="badge bg-success">Active</span></td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2">View</Button>
                    </td>
                  </tr>
                  <tr>
                    <td>Robert Johnson</td>
                    <td>QA Engineer</td>
                    <td><span className="badge bg-warning text-dark">On Leave</span></td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2">View</Button>
                    </td>
                  </tr>
                  <tr>
                    <td>Emily Davis</td>
                    <td>Project Manager</td>
                    <td><span className="badge bg-success">Active</span></td>
                    <td>
                      <Button variant="outline-primary" size="sm" className="me-2">View</Button>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Pending Approvals</h5>
            </Card.Header>
            <Card.Body>
              <div className="list-group">
                <div className="list-group-item">
                  <div className="d-flex w-100 justify-content-between mb-1">
                    <h6 className="mb-0">Leave Request</h6>
                    <small className="text-muted">2 days ago</small>
                  </div>
                  <p className="mb-1">Jane Smith - Vacation (3 days)</p>
                  <div className="d-flex mt-2">
                    <Button variant="success" size="sm" className="me-2">Approve</Button>
                    <Button variant="danger" size="sm">Reject</Button>
                  </div>
                </div>
                
                <div className="list-group-item">
                  <div className="d-flex w-100 justify-content-between mb-1">
                    <h6 className="mb-0">Timesheet</h6>
                    <small className="text-muted">1 day ago</small>
                  </div>
                  <p className="mb-1">John Doe - Week of Apr 10</p>
                  <div className="d-flex mt-2">
                    <Button variant="success" size="sm" className="me-2">Approve</Button>
                    <Button variant="danger" size="sm">Reject</Button>
                  </div>
                </div>
                
                <div className="list-group-item">
                  <div className="d-flex w-100 justify-content-between mb-1">
                    <h6 className="mb-0">Expense Claim</h6>
                    <small className="text-muted">3 hours ago</small>
                  </div>
                  <p className="mb-1">Robert Johnson - $120</p>
                  <div className="d-flex mt-2">
                    <Button variant="success" size="sm" className="me-2">Approve</Button>
                    <Button variant="danger" size="sm">Reject</Button>
                  </div>
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