import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Modal, Badge, Alert, Spinner } from 'react-bootstrap';
import { Clock, Plus, Edit2, Trash2, Calendar, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import timesheetService from '../../services/timesheetService';
import employeeService from '../../services/employeeService';

const Timesheet = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState(null);
  const { getCurrentUser, hasAccess, ROLES } = useAuth();
  
  const currentUser = getCurrentUser();
  const isManager = hasAccess([ROLES.ADMIN.id, ROLES.MANAGER.id, ROLES.HR_MANAGER.id, ROLES.SUPERVISOR.id]);
  const isEmployee = hasAccess([ROLES.EMPLOYEE.id]);

  const TimesheetSchema = Yup.object().shape({
    workDate: Yup.date()
      .required('Work date is required')
      .max(new Date(), 'Work date cannot be in the future'),
    hoursWorked: Yup.number()
      .required('Hours worked is required')
      .min(0.5, 'Minimum 0.5 hours required')
      .max(24, 'Maximum 24 hours allowed'),
    taskDescription: Yup.string()
      .required('Task description is required')
      .min(10, 'Please provide a detailed description (minimum 10 characters)')
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      if (isManager) {
        // Fetch employees first, then all timesheets
        await fetchEmployees();
      } else {
        // For employees, just fetch their own timesheets
        await fetchTimesheets();
      }
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
        const employeeData = result.data || [];
        setEmployees(employeeData);
        // After employees are loaded, fetch all timesheets
        await fetchAllTimesheets(employeeData);
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

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      
      if (isEmployee && !isManager) {
        // Get current user's employee ID - you might need to adjust this based on your user structure
        const result = await timesheetService.getEmployeeTimesheets(currentUser.id);
        if (result.success) {
          const timesheetsWithStatus = (result.data || []).map(timesheet => ({
            ...timesheet,
            employeeName: currentUser.userName,
            status: timesheet.IsApproved ? 'Approved' : 'Pending'
          }));
          setTimesheets(applyFilters(timesheetsWithStatus));
        } else {
          setTimesheets([]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch timesheets:', error);
      toast.error('Failed to fetch timesheets');
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllTimesheets = async (employeeData = employees) => {
    try {
      setLoading(true);
      const result = await timesheetService.getAllTimesheets(employeeData);
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
    if (isManager && employees.length > 0) {
      fetchAllTimesheets();
    } else if (isEmployee) {
      fetchTimesheets();
    }
  }, [searchFilters]);

  const handleAddTimesheet = () => {
    setEditingTimesheet(null);
    setShowModal(true);
  };

  const handleEditTimesheet = (timesheet) => {
    if (timesheet.status !== 'Pending') {
      toast.error('Only pending timesheets can be edited');
      return;
    }
    setEditingTimesheet(timesheet);
    setShowModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const timesheetData = {
        employeeId: currentUser.id, // Assuming current user is the employee
        workDate: values.workDate,
        hoursWorked: parseFloat(values.hoursWorked),
        taskDescription: values.taskDescription
      };

      const result = await timesheetService.submitTimesheet(timesheetData);
      
      if (result.success) {
        toast.success('Timesheet submitted successfully');
        setShowModal(false);
        resetForm();
        // Refresh timesheets
        if (isManager) {
          fetchAllTimesheets();
        } else {
          fetchTimesheets();
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to submit timesheet');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveTimesheet = async (timesheetId) => {
    try {
      const result = await timesheetService.approveTimesheet(timesheetId, currentUser.id);
      
      if (result.success) {
        toast.success('Timesheet approved successfully');
        // Refresh timesheets
        fetchAllTimesheets();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to approve timesheet');
    }
  };

  const handleDeleteTimesheet = (timesheetId) => {
    const timesheet = timesheets.find(ts => ts.TimeSheetId === timesheetId);
    if (timesheet.status !== 'Pending') {
      toast.error('Only pending timesheets can be deleted');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this timesheet?')) {
      // Note: You might need to implement a delete API endpoint
      setTimesheets(timesheets.filter(ts => ts.TimeSheetId !== timesheetId));
      toast.success('Timesheet deleted successfully');
    }
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

  const getPendingTimesheets = () => {
    return timesheets.filter(ts => ts.status === 'Pending');
  };

  const getTimesheetStats = () => {
    const userTimesheets = isEmployee && !isManager 
      ? timesheets.filter(ts => ts.EmployeeId === currentUser.id)
      : timesheets;
      
    return {
      total: userTimesheets.length,
      pending: userTimesheets.filter(ts => ts.status === 'Pending').length,
      approved: userTimesheets.filter(ts => ts.status === 'Approved').length,
      rejected: userTimesheets.filter(ts => ts.status === 'Rejected').length,
      totalHours: userTimesheets
        .filter(ts => ts.status === 'Approved')
        .reduce((sum, ts) => sum + (ts.HoursWorked || 0), 0)
    };
  };

  const filteredTimesheets = timesheets;
  const pendingTimesheets = getPendingTimesheets();
  const stats = getTimesheetStats();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>{isManager ? 'Timesheet Management' : 'My Timesheets'}</h2>
        <Button variant="primary" className="d-flex align-items-center gap-2" onClick={handleAddTimesheet}>
          <Plus size={18} />
          Add Timesheet
        </Button>
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

      {/* Pending Approvals Section for Managers */}
      {isManager && pendingTimesheets.length > 0 && (
        <Card className="mb-4">
          <Card.Header className="bg-warning bg-opacity-10">
            <h5 className="mb-0 text-warning">
              <AlertCircle size={20} className="me-2" />
              Pending Approvals ({pendingTimesheets.length})
            </h5>
          </Card.Header>
          <Card.Body>
            <Table responsive hover className="mb-0">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Task Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTimesheets.slice(0, 5).map((timesheet) => (
                  <tr key={timesheet.TimeSheetId}>
                    <td>{timesheet.employeeName}</td>
                    <td>{new Date(timesheet.WorkDate).toLocaleDateString()}</td>
                    <td>{timesheet.HoursWorked}h</td>
                    <td className="text-truncate" style={{ maxWidth: '200px' }}>
                      {timesheet.TaskDescription}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-success" 
                          size="sm"
                          onClick={() => handleApproveTimesheet(timesheet.TimeSheetId)}
                          title="Approve"
                        >
                          <CheckCircle size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            {pendingTimesheets.length > 5 && (
              <div className="text-center mt-3">
                <small className="text-muted">
                  Showing 5 of {pendingTimesheets.length} pending timesheets. Use filters below to see all.
                </small>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Main Timesheets Table */}
      <Card>
        <Card.Body>
          {/* Search Filters */}
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={searchFilters.startDate}
                  onChange={(e) => setSearchFilters({...searchFilters, startDate: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={searchFilters.endDate}
                  onChange={(e) => setSearchFilters({...searchFilters, endDate: e.target.value})}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
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
                onClick={() => setSearchFilters({ startDate: '', endDate: '', status: '' })}
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
                  {isManager && <th>Employee</th>}
                  <th>Date</th>
                  <th>Hours</th>
                  <th>Task Description</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTimesheets.map((timesheet) => (
                  <tr key={timesheet.TimeSheetId}>
                    {isManager && <td>{timesheet.employeeName}</td>}
                    <td>{new Date(timesheet.WorkDate).toLocaleDateString()}</td>
                    <td>{timesheet.HoursWorked}h</td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '250px' }} title={timesheet.TaskDescription}>
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
                        {/* Manager Actions */}
                        {isManager && timesheet.status === 'Pending' && (
                          <Button 
                            variant="outline-success" 
                            size="sm"
                            onClick={() => handleApproveTimesheet(timesheet.TimeSheetId)}
                            title="Approve"
                          >
                            <CheckCircle size={14} />
                          </Button>
                        )}
                        
                        {/* Employee Actions */}
                        {(timesheet.EmployeeId === currentUser.id || isManager) && timesheet.status === 'Pending' && (
                          <>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleEditTimesheet(timesheet)}
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteTimesheet(timesheet.TimeSheetId)}
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </Button>
                          </>
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
              <Clock size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No Timesheets Found</h5>
              <p className="text-muted">Submit your first timesheet to get started.</p>
              <Button variant="primary" onClick={handleAddTimesheet}>
                <Plus size={18} className="me-1" />
                Add First Timesheet
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Timesheet Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingTimesheet ? 'Edit Timesheet' : 'Add New Timesheet'}</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            workDate: editingTimesheet?.WorkDate ? editingTimesheet.WorkDate.split('T')[0] : new Date().toISOString().split('T')[0],
            hoursWorked: editingTimesheet?.HoursWorked || '',
            taskDescription: editingTimesheet?.TaskDescription || ''
          }}
          validationSchema={TimesheetSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, errors, touched, values }) => (
            <FormikForm>
              <Modal.Body>
                {editingTimesheet && editingTimesheet.status !== 'Pending' && (
                  <Alert variant="warning">
                    <AlertCircle size={16} className="me-2" />
                    This timesheet has already been {editingTimesheet.status.toLowerCase()}. You can only edit pending timesheets.
                  </Alert>
                )}

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Work Date</Form.Label>
                      <Field
                        type="date"
                        name="workDate"
                        className={`form-control ${errors.workDate && touched.workDate ? 'is-invalid' : ''}`}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      <ErrorMessage name="workDate" component="div" className="invalid-feedback" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Hours Worked</Form.Label>
                      <Field
                        type="number"
                        name="hoursWorked"
                        step="0.5"
                        min="0.5"
                        max="24"
                        className={`form-control ${errors.hoursWorked && touched.hoursWorked ? 'is-invalid' : ''}`}
                        placeholder="e.g., 8 or 7.5"
                      />
                      <ErrorMessage name="hoursWorked" component="div" className="invalid-feedback" />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Task Description</Form.Label>
                  <Field
                    as="textarea"
                    name="taskDescription"
                    rows={4}
                    className={`form-control ${errors.taskDescription && touched.taskDescription ? 'is-invalid' : ''}`}
                    placeholder="Describe the work you performed in detail..."
                  />
                  <ErrorMessage name="taskDescription" component="div" className="invalid-feedback" />
                  <Form.Text className="text-muted">
                    Please provide a detailed description of the tasks completed during this time period.
                  </Form.Text>
                </Form.Group>

                {values.hoursWorked && (
                  <Alert variant="info">
                    <Calendar size={16} className="me-2" />
                    Total time logged: {values.hoursWorked} hours on {values.workDate ? new Date(values.workDate).toLocaleDateString() : 'selected date'}
                  </Alert>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isSubmitting || (editingTimesheet && editingTimesheet.status !== 'Pending')}
                >
                  {isSubmitting ? 'Saving...' : (editingTimesheet ? 'Update Timesheet' : 'Submit Timesheet')}
                </Button>
              </Modal.Footer>
            </FormikForm>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default Timesheet;