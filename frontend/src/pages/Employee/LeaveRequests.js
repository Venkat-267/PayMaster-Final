import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Modal, Badge, Spinner, Alert } from 'react-bootstrap';
import { Search, Calendar, Plus, Eye, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import leaveRequestService from '../../services/leaveRequestService';
import employeeService from '../../services/employeeService';

const LeaveRequests = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    employeeId: '',
    status: '',
    leaveType: '',
    fromDate: '',
    toDate: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [editingLeave, setEditingLeave] = useState(null);
  const { hasAccess, ROLES, getCurrentUser } = useAuth();
  
  const currentUser = getCurrentUser();
  const canManageLeaves = hasAccess([ROLES.ADMIN.id, ROLES.MANAGER.id, ROLES.HR_MANAGER.id]);
  const isEmployee = hasAccess([ROLES.EMPLOYEE.id]);

  const LeaveSchema = Yup.object().shape({
    leaveType: Yup.string().required('Leave type is required'),
    startDate: Yup.date().required('Start date is required'),
    endDate: Yup.date()
      .required('End date is required')
      .min(Yup.ref('startDate'), 'End date must be after start date'),
    reason: Yup.string().required('Reason is required')
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (searchFilters.employeeId || searchFilters.status || searchFilters.leaveType || searchFilters.fromDate || searchFilters.toDate) {
      fetchLeaveRequests();
    }
  }, [searchFilters]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchEmployees(),
        fetchLeaveRequests()
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
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      
      if (isEmployee && !canManageLeaves) {
        // For employees, get their own leave requests
        const result = await leaveRequestService.getEmployeeLeaveRequests(currentUser.id);
        if (result.success) {
          const leavesWithEmployeeName = (result.data || []).map(leave => ({
            ...leave,
            employeeName: currentUser.userName
          }));
          setLeaveRequests(leavesWithEmployeeName);
        } else {
          setLeaveRequests([]);
        }
      } else {
        // For managers/admins, search all leave requests with filters
        const filters = {};
        if (searchFilters.employeeId) filters.employeeId = searchFilters.employeeId;
        if (searchFilters.status) filters.status = searchFilters.status;
        if (searchFilters.leaveType) filters.leaveType = searchFilters.leaveType;
        if (searchFilters.fromDate) filters.from = searchFilters.fromDate;
        if (searchFilters.toDate) filters.to = searchFilters.toDate;

        const result = await leaveRequestService.searchLeaveRequests(filters);
        if (result.success) {
          // Add employee names to leave requests
          const leavesWithEmployeeNames = (result.data || []).map(leave => {
            const employee = employees.find(emp => emp.EmployeeId === leave.EmployeeId);
            return {
              ...leave,
              employeeName: employee ? `${employee.FirstName} ${employee.LastName}` : `Employee ${leave.EmployeeId}`
            };
          });
          setLeaveRequests(leavesWithEmployeeNames);
        } else {
          setLeaveRequests([]);
        }
      }
    } catch (error) {
      toast.error('Failed to fetch leave requests');
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLeave = () => {
    setEditingLeave(null);
    setShowModal(true);
  };

  const handleEditLeave = (leave) => {
    setEditingLeave(leave);
    setShowModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const leaveData = {
        employeeId: isEmployee ? currentUser.id : values.employeeId,
        leaveType: values.leaveType,
        startDate: values.startDate,
        endDate: values.endDate,
        reason: values.reason
      };

      const result = await leaveRequestService.submitLeaveRequest(leaveData);
      
      if (result.success) {
        toast.success('Leave request submitted successfully');
        setShowModal(false);
        resetForm();
        fetchLeaveRequests(); // Refresh the list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to submit leave request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (leaveId, action) => {
    try {
      const result = await leaveRequestService.reviewLeaveRequest(leaveId, currentUser.id, action);
      
      if (result.success) {
        toast.success(`Leave request ${action}d successfully`);
        fetchLeaveRequests(); // Refresh the list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(`Failed to ${action} leave request`);
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

  const calculateDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const getLeaveStats = () => {
    return {
      total: leaveRequests.length,
      pending: leaveRequests.filter(l => l.Status === 'Pending').length,
      approved: leaveRequests.filter(l => l.Status === 'Approved').length,
      rejected: leaveRequests.filter(l => l.Status === 'Rejected').length
    };
  };

  const stats = getLeaveStats();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Leave Requests</h2>
        <Button variant="primary" className="d-flex align-items-center gap-2" onClick={handleAddLeave}>
          <Plus size={18} />
          New Leave Request
        </Button>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <Calendar size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-1">Total Requests</h6>
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
                  <Calendar size={24} className="text-warning" />
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
                  <Calendar size={24} className="text-success" />
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
                <div className="bg-danger bg-opacity-10 p-3 rounded-circle me-3">
                  <Calendar size={24} className="text-danger" />
                </div>
                <div>
                  <h6 className="mb-1">Rejected</h6>
                  <h3 className="mb-0">{stats.rejected}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card>
        <Card.Body>
          {/* Search Filters - Only show for managers/admins */}
          {canManageLeaves && (
            <Row className="mb-3">
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Employee</Form.Label>
                  <Form.Select
                    value={searchFilters.employeeId}
                    onChange={(e) => setSearchFilters({...searchFilters, employeeId: e.target.value})}
                  >
                    <option value="">All Employees</option>
                    {employees.map(emp => (
                      <option key={emp.EmployeeId} value={emp.EmployeeId}>
                        {emp.FirstName} {emp.LastName}
                      </option>
                    ))}
                  </Form.Select>
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
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Leave Type</Form.Label>
                  <Form.Select
                    value={searchFilters.leaveType}
                    onChange={(e) => setSearchFilters({...searchFilters, leaveType: e.target.value})}
                  >
                    <option value="">All Types</option>
                    <option value="Annual Leave">Annual Leave</option>
                    <option value="Sick Leave">Sick Leave</option>
                    <option value="Personal Leave">Personal Leave</option>
                    <option value="Maternity Leave">Maternity Leave</option>
                    <option value="Paternity Leave">Paternity Leave</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={searchFilters.fromDate}
                    onChange={(e) => setSearchFilters({...searchFilters, fromDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={searchFilters.toDate}
                    onChange={(e) => setSearchFilters({...searchFilters, toDate: e.target.value})}
                  />
                </Form.Group>
              </Col>
            </Row>
          )}

          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  {canManageLeaves && <th>Employee</th>}
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Applied Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaveRequests.map((leave) => (
                  <tr key={leave.LeaveId}>
                    {canManageLeaves && <td>{leave.employeeName}</td>}
                    <td>{leave.LeaveType}</td>
                    <td>{new Date(leave.StartDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.EndDate).toLocaleDateString()}</td>
                    <td>{calculateDays(leave.StartDate, leave.EndDate)}</td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '200px' }} title={leave.Reason}>
                        {leave.Reason}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeColor(leave.Status)}>
                        {leave.Status}
                      </Badge>
                    </td>
                    <td>{new Date(leave.AppliedDate).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-2">
                        {canManageLeaves && leave.Status === 'Pending' && (
                          <>
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => handleStatusUpdate(leave.LeaveId, 'approve')}
                              title="Approve"
                            >
                              <CheckCircle size={14} />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleStatusUpdate(leave.LeaveId, 'reject')}
                              title="Reject"
                            >
                              <XCircle size={14} />
                            </Button>
                          </>
                        )}
                        {leave.Status === 'Pending' && (
                          <Button 
                            variant="outline-primary" 
                            size="sm"
                            onClick={() => handleEditLeave(leave)}
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {!loading && leaveRequests.length === 0 && (
            <div className="text-center py-4">
              <p className="text-muted">No leave requests found.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Leave Request Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingLeave ? 'Edit Leave Request' : 'New Leave Request'}</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            employeeId: editingLeave?.EmployeeId || (isEmployee ? currentUser.id : ''),
            leaveType: editingLeave?.LeaveType || '',
            startDate: editingLeave?.StartDate ? editingLeave.StartDate.split('T')[0] : '',
            endDate: editingLeave?.EndDate ? editingLeave.EndDate.split('T')[0] : '',
            reason: editingLeave?.Reason || ''
          }}
          validationSchema={LeaveSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, errors, touched, values }) => (
            <FormikForm>
              <Modal.Body>
                {canManageLeaves && !isEmployee && (
                  <Row>
                    <Col md={12}>
                      <Form.Group className="mb-3">
                        <Form.Label>Employee</Form.Label>
                        <Field
                          as="select"
                          name="employeeId"
                          className={`form-select ${errors.employeeId && touched.employeeId ? 'is-invalid' : ''}`}
                        >
                          <option value="">Select Employee</option>
                          {employees.map(emp => (
                            <option key={emp.EmployeeId} value={emp.EmployeeId}>
                              {emp.FirstName} {emp.LastName}
                            </option>
                          ))}
                        </Field>
                        <ErrorMessage name="employeeId" component="div" className="invalid-feedback" />
                      </Form.Group>
                    </Col>
                  </Row>
                )}

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Leave Type</Form.Label>
                      <Field
                        as="select"
                        name="leaveType"
                        className={`form-select ${errors.leaveType && touched.leaveType ? 'is-invalid' : ''}`}
                      >
                        <option value="">Select Leave Type</option>
                        <option value="Annual Leave">Annual Leave</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Personal Leave">Personal Leave</option>
                        <option value="Maternity Leave">Maternity Leave</option>
                        <option value="Paternity Leave">Paternity Leave</option>
                        <option value="Emergency Leave">Emergency Leave</option>
                      </Field>
                      <ErrorMessage name="leaveType" component="div" className="invalid-feedback" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Duration</Form.Label>
                      <div className="d-flex align-items-center">
                        <span className="badge bg-info">
                          {values.startDate && values.endDate 
                            ? `${calculateDays(values.startDate, values.endDate)} day(s)`
                            : 'Select dates'
                          }
                        </span>
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Field
                        type="date"
                        name="startDate"
                        className={`form-control ${errors.startDate && touched.startDate ? 'is-invalid' : ''}`}
                        min={new Date().toISOString().split('T')[0]}
                      />
                      <ErrorMessage name="startDate" component="div" className="invalid-feedback" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Field
                        type="date"
                        name="endDate"
                        className={`form-control ${errors.endDate && touched.endDate ? 'is-invalid' : ''}`}
                        min={values.startDate || new Date().toISOString().split('T')[0]}
                      />
                      <ErrorMessage name="endDate" component="div" className="invalid-feedback" />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Reason</Form.Label>
                  <Field
                    as="textarea"
                    name="reason"
                    rows={4}
                    className={`form-control ${errors.reason && touched.reason ? 'is-invalid' : ''}`}
                    placeholder="Please provide a reason for your leave request..."
                  />
                  <ErrorMessage name="reason" component="div" className="invalid-feedback" />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingLeave ? 'Update Request' : 'Submit Request')}
                </Button>
              </Modal.Footer>
            </FormikForm>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default LeaveRequests;