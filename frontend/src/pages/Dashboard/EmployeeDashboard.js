import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { CreditCard, Clock, Calendar, Check } from 'lucide-react';

const EmployeeDashboard = () => {
  return (
    <div>
      <h2 className="mb-4">Employee Dashboard</h2>
      
      <Row className="g-4 mb-4">
        <Col md={6} lg={3}>
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Next Payday</h6>
                  <h3 className="mb-0">April 28</h3>
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
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Hours This Week</h6>
                  <h3 className="mb-0">32 / 40</h3>
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
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Leave Balance</h6>
                  <h3 className="mb-0">14 days</h3>
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
          <Card className="h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-2">Pending Tasks</h6>
                  <h3 className="mb-0">3</h3>
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
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Payslips</h5>
              <Button variant="outline-primary" size="sm">View All</Button>
            </Card.Header>
            <Card.Body>
              <div className="list-group">
                <a href="#" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">March 2025</h6>
                    <small className="text-muted">Processed on Mar 31, 2025</small>
                  </div>
                  <span className="badge bg-success rounded-pill">$3,200</span>
                </a>
                <a href="#" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">February 2025</h6>
                    <small className="text-muted">Processed on Feb 28, 2025</small>
                  </div>
                  <span className="badge bg-success rounded-pill">$3,200</span>
                </a>
                <a href="#" className="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">January 2025</h6>
                    <small className="text-muted">Processed on Jan 31, 2025</small>
                  </div>
                  <span className="badge bg-success rounded-pill">$3,200</span>
                </a>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={5}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Leave Requests</h5>
              <Button variant="primary" size="sm">New Request</Button>
            </Card.Header>
            <Card.Body>
              <div className="list-group">
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Vacation</h6>
                    <small className="text-muted">May 10 - May 15, 2025</small>
                  </div>
                  <span className="badge bg-warning text-dark rounded-pill">Pending</span>
                </div>
                <div className="list-group-item d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Sick Leave</h6>
                    <small className="text-muted">Mar 23, 2025</small>
                  </div>
                  <span className="badge bg-success rounded-pill">Approved</span>
                </div>
              </div>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>
              <h5 className="mb-0">Clock In/Out</h5>
            </Card.Header>
            <Card.Body>
              <p className="mb-3">Current Status: <span className="badge bg-success">Clocked In</span></p>
              <p className="text-muted mb-3">Clocked in at: 9:00 AM</p>
              <Button variant="danger" className="w-100">Clock Out</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeDashboard;