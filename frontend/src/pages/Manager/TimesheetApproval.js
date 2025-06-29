import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Modal, Badge, Alert, Tabs, Tab, Spinner } from 'react-bootstrap';
import { Clock, CheckCircle, XCircle, AlertCircle, Eye, MessageSquare, Calendar, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import timesheetService from '../../services/timesheetService';
import employeeService from '../../services/employeeService';

const TimesheetApproval = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    employeeName: '',
    startDate: '',
    endDate: '',
    status: 'Pending'
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const { getCurrentUser } = useAuth();
  
  const currentUser = getCurrentUser();

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchEmployees(),
        fetchPendingTimesheets()
      ]);
    } catch (error) {
      toast.error('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const result = await employeeService.getAllEmployees();
      if (result.success) {
        setEmployees(result.data || []);
      } else {
        toast.error('Failed to fetch employees');
        setEmployees([]);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
      toast.error('Failed to fetch employees');
      setEmployees([]);
    }
  };

  const fetchPendingTimesheets = async () => {
    try {
      setLoading(true);
      // Get pending timesheets for this manager
      const result = await timesheetService.getPendingTimesheets(currentUser.id);
      if (result.success) {
        // Add employee names to timesheets
        const timesheetsWithEmployeeNames = (result.data || []).map(timesheet => {
          const employee = employees.find(emp => emp.EmployeeId === timesheet.EmployeeId);
          return {
            ...timesheet,
            employeeName: employee ? `${employee.FirstName} ${employee.LastName}` : `Employee ${timesheet.EmployeeId}`,
            status: timesheet.IsApproved ? 'Approved' : 'Pending'
          };
        });
        setTimesheets(timesheetsWithEmployeeNames);
      } else {
        setTimesheets([]);
      }
    } catch (error) {
      console.error('Failed to fetch pending timesheets:', error);
      toast.error('Failed to fetch pending timesheets');
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTimesheets = async () => {
    try {
      setLoading(true);
      const result = await timesheetService.getAllTimesheets(employees);
      if (result.success) {
        setTimesheets(applyFilters(result.data || []));
      } else {
        setTimesheets([]);
      }
    } catch (error) {
      console.error('Failed to fetch all timesheets:', error);
      toast.error('Failed to fetch timesheets');
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (timesheetData) => {
    let filtered = timesheetData;
    
    if (searchFilters.employeeName) {
      filtered = filtered.filter(ts => 
        ts.employeeName.toLowerCase().includes(searchFilters.employeeName.toLowerCase())
      );
    }
    if (searchFilters.startDate) {
      filtered = filtered.filter(ts => new Date(ts.WorkDate) >= new Date(searchFilters.startDate));
    }
    if (searchFilters.endDate) {
      filtered = filtered.filter(ts => new Date(ts.WorkDate) <= new Date(searchFilters.endDate));
    }
    if (searchFilters.status) {
      filtered = filtered.filter(ts => ts.status === searchFilters.status);
    }
    
    return filtered.sort((a, b) => new Date(b.WorkDate) - new Date(a.WorkDate));
  };

  // Trigger timesheet fetch when filters change
  useEffect(() => {
    if (employees.length > 0) {
      if (searchFilters.status === 'Pending') {
        fetchPendingTimesheets();
      } else {
        fetchAllTimesheets();
      }
    }
  }, [searchFilters, employees]);

  const handleApprove = async (timesheetId) => {
    try {
      const result = await timesheetService.approveTimesheet(timesheetId, currentUser.id);
      
      if (result.success) {
        toast.success('Timesheet approved successfully');
        // Refresh timesheets
        if (searchFilters.status === 'Pending') {
          fetchPendingTimesheets();
        } else {
          fetchAllTimesheets();
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to approve timesheet');
    }
  };

  const handleViewDetails = (timesheet) => {
    setSelectedTimesheet(timesheet);
    setShowDetailModal(true);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'danger';
      case 'Pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle size={16} className="me-1" />;
      case 'Rejected':
        return <XCircle size={16} className="me-1" />;
      case 'Pending':
        return <AlertCircle size={16} className="me-1" />;
      default:
        return null;
    }
  };

  const getTimesheetStats = () => {
    return {
      total: timesheets.length,
      pending: timesheets.filter(ts => ts.status === 'Pending').length,
      approved: timesheets.filter(ts => ts.status === 'Approved').length,
      rejected: timesheets.filter(ts => ts.status === 'Rejected').length,
      totalHours: timesheets
        .filter(ts => ts.status === 'Approved')
        .reduce((sum, ts) => sum + (ts.HoursWorked || 0), 0)
    };
  };

  const getPendingByEmployee = () => {
    const pending = timesheets.filter(ts => ts.status === 'Pending');
    const byEmployee = {};
    
    pending.forEach(ts => {
      if (!byEmployee[ts.employeeName]) {
        byEmployee[ts.employeeName] = [];
      }
      byEmployee[ts.employeeName].push(ts);
    });
    
    return byEmployee;
  };

  const filteredTimesheets = applyFilters(timesheets);
  const stats = getTimesheetStats();
  const pendingByEmployee = getPendingByEmployee();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Timesheet Approval</h2>
        <div className="d-flex gap-2">
          <Badge bg="warning" className="px-3 py-2">
            {stats.pending} Pending Approval
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <Clock size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-1">Total Timesheets</h6>
                  <h3 className="mb-0">{stats.total}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                  <AlertCircle size={24} className="text-warning" />
                </div>
                <div>
                  <h6 className="mb-1">Pending</h6>
                  <h3 className="mb-0">{stats.pending}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                  <CheckCircle size={24} className="text-success" />
                </div>
                <div>
                  <h6 className="mb-1">Approved</h6>
                  <h3 className="mb-0">{stats.approved}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                  <Clock size={24} className="text-info" />
                </div>
                <div>
                  <h6 className="mb-1">Approved Hours</h6>
                  <h3 className="mb-0">{stats.totalHours}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Tabs defaultActiveKey="pending" className="mb-4">
        <Tab eventKey="pending" title={`Pending Approval (${stats.pending})`}>
          {/* Quick Actions for Pending */}
          {Object.keys(pendingByEmployee).length > 0 && (
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Quick Actions - Pending by Employee</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {Object.entries(pendingByEmployee).map(([employeeName, employeeTimesheets]) => (
                    <Col md={6} lg={4} key={employeeName} className="mb-3">
                      <Card className="border">
                        <Card.Body className="p-3">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <h6 className="mb-0">{employeeName}</h6>
                            <Badge bg="warning">{employeeTimesheets.length}</Badge>
                          </div>
                          <p className="text-muted small mb-2">
                            {employeeTimesheets.reduce((sum, ts) => sum + (ts.HoursWorked || 0), 0)} hours total
                          </p>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => {
                                employeeTimesheets.forEach(ts => handleApprove(ts.TimeSheetId));
                              }}
                            >
                              Approve All
                            </Button>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => {
                                // Filter to show only this employee's timesheets
                                setSearchFilters({...searchFilters, employeeName, status: 'Pending'});
                              }}
                            >
                              Review
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          )}
        </Tab>
        <Tab eventKey="all" title="All Timesheets">
          {/* All timesheets content will be shown below */}
        </Tab>
      </Tabs>

      {/* Main Timesheets Table */}
      <Card>
        <Card.Body>
          {/* Search Filters */}
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Employee Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search employee..."
                  value={searchFilters.employeeName}
                  onChange={(e) => setSearchFilters({...searchFilters, employeeName: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={searchFilters.startDate}
                  onChange={(e) => setSearchFilters({...searchFilters, startDate: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={searchFilters.endDate}
                  onChange={(e) => setSearchFilters({...searchFilters, endDate: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={searchFilters.status}
                  onChange={(e) => setSearchFilters({...searchFilters, status: e.target.value})}
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                onClick={() => setSearchFilters({ employeeName: '', startDate: '', endDate: '', status: '' })}
              >
                Clear Filters
              </Button>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Loading timesheets...</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Task Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimesheets.map((timesheet) => (
                  <tr key={timesheet.TimeSheetId} className={timesheet.status === 'Pending' ? 'table-warning' : ''}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                          <Users size={16} className="text-primary" />
                        </div>
                        {timesheet.employeeName}
                      </div>
                    </td>
                    <td>{new Date(timesheet.WorkDate).toLocaleDateString()}</td>
                    <td>
                      <Badge bg={timesheet.HoursWorked > 8 ? 'warning' : 'info'}>
                        {timesheet.HoursWorked}h
                      </Badge>
                    </td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '200px' }} title={timesheet.TaskDescription}>
                        {timesheet.TaskDescription}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeColor(timesheet.status)} className="d-flex align-items-center w-fit">
                        {getStatusIcon(timesheet.status)}
                        {timesheet.status}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-info" 
                          size="sm"
                          onClick={() => handleViewDetails(timesheet)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Button>
                        
                        {timesheet.status === 'Pending' && (
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => handleApprove(timesheet.TimeSheetId)}
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {!loading && filteredTimesheets.length === 0 && (
            <div className="text-center py-4">
              <AlertCircle size={48} className="text-muted mb-3" />
              <p className="text-muted">No timesheets found matching your criteria.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Timesheet Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Timesheet Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTimesheet && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Employee:</strong> {selectedTimesheet.employeeName}
                </Col>
                <Col md={6}>
                  <strong>Work Date:</strong> {new Date(selectedTimesheet.WorkDate).toLocaleDateString()}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Hours Worked:</strong> {selectedTimesheet.HoursWorked} hours
                </Col>
                <Col md={6}>
                  <strong>Status:</strong> 
                  <Badge bg={getStatusBadgeColor(selectedTimesheet.status)} className="ms-2">
                    {selectedTimesheet.status}
                  </Badge>
                </Col>
              </Row>
              
              <div className="mb-3">
                <strong>Task Description:</strong>
                <div className="mt-2 p-3 bg-light rounded">
                  {selectedTimesheet.TaskDescription}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedTimesheet && selectedTimesheet.status === 'Pending' && (
            <div className="d-flex gap-2">
              <Button 
                variant="success"
                onClick={() => {
                  handleApprove(selectedTimesheet.TimeSheetId);
                  setShowDetailModal(false);
                }}
              >
                <CheckCircle size={16} className="me-1" />
                Approve
              </Button>
            </div>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TimesheetApproval;