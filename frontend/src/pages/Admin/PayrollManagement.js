import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Modal, Badge, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import { Search, DollarSign, Plus, Eye, CheckCircle, CreditCard, Calendar, User, FileText, Settings } from 'lucide-react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import payrollService from '../../services/payrollService';
import payrollPolicyService from '../../services/payrollPolicyService';
import employeeService from '../../services/employeeService';

const PayrollManagement = () => {
  const [searchFilters, setSearchFilters] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: ''
  });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [currentPolicy, setCurrentPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const { hasAccess, ROLES, getCurrentUser } = useAuth();
  
  const currentUser = getCurrentUser();
  const canCreatePayroll = hasAccess([ROLES.ADMIN.id, ROLES.PAYROLL_PROCESSOR.id]);
  const canVerifyPayroll = hasAccess([ROLES.ADMIN.id, ROLES.MANAGER.id]);

  // Dummy payroll data - replace with API calls
  const [payrolls, setPayrolls] = useState([
    {
      id: 1,
      employeeId: 1,
      employeeName: 'John Doe',
      employeeCode: 'EMP001',
      month: 6,
      year: 2025,
      basicPay: 5000,
      hra: 1000,
      allowances: 500,
      overtimeHours: 5,
      overtimeAmount: 250,
      grossPay: 6750,
      pfDeduction: 600,
      taxDeduction: 800,
      otherDeductions: 50,
      totalDeductions: 1450,
      netPay: 5300,
      status: 'Created',
      createdBy: 'Admin',
      createdDate: '2025-06-15',
      verifiedBy: null,
      verifiedDate: null,
      paidBy: null,
      paidDate: null,
      paymentMode: null
    }
  ]);

  const PayrollSchema = Yup.object().shape({
    employeeId: Yup.number().required('Employee is required'),
    month: Yup.number().required('Month is required').min(1).max(12),
    year: Yup.number().required('Year is required').min(2020).max(2030)
  });

  const PolicySchema = Yup.object().shape({
    defaultPFPercent: Yup.number()
      .required('PF percentage is required')
      .min(0, 'PF percentage cannot be negative')
      .max(100, 'PF percentage cannot exceed 100'),
    overtimeRatePerHour: Yup.number()
      .required('Overtime rate is required')
      .min(0, 'Overtime rate cannot be negative'),
    effectiveFrom: Yup.date().required('Effective date is required')
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchEmployees(),
        fetchCurrentPolicy()
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

  const fetchCurrentPolicy = async () => {
    try {
      const result = await payrollPolicyService.getLatestPayrollPolicy();
      if (result.success) {
        setCurrentPolicy(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch current policy:', error);
    }
  };

  const handleCreatePayroll = async (values, { setSubmitting, resetForm }) => {
    try {
      const result = await payrollService.generatePayroll(
        values.employeeId,
        values.month,
        values.year,
        currentUser.id
      );
      
      if (result.success) {
        toast.success('Payroll generated successfully');
        setShowCreateModal(false);
        resetForm();
        // Refresh payroll list here
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to generate payroll');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyPayroll = async (payrollId) => {
    try {
      const result = await payrollService.verifyPayroll(payrollId, currentUser.id);
      
      if (result.success) {
        toast.success('Payroll verified successfully');
        setShowVerifyModal(false);
        // Update local state
        setPayrolls(payrolls.map(p => 
          p.id === payrollId 
            ? { 
                ...p, 
                status: 'Verified',
                verifiedBy: currentUser.userName,
                verifiedDate: new Date().toISOString().split('T')[0]
              }
            : p
        ));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to verify payroll');
    }
  };

  const handleMarkAsPaid = async (payrollId, paymentMode) => {
    try {
      const result = await payrollService.markPayrollAsPaid(payrollId, paymentMode);
      
      if (result.success) {
        toast.success('Payroll marked as paid successfully');
        setShowPayModal(false);
        // Update local state
        setPayrolls(payrolls.map(p => 
          p.id === payrollId 
            ? { 
                ...p, 
                status: 'Paid',
                paidBy: currentUser.userName,
                paidDate: new Date().toISOString().split('T')[0],
                paymentMode
              }
            : p
        ));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to mark payroll as paid');
    }
  };

  const handleUpdatePolicy = async (values, { setSubmitting, resetForm }) => {
    try {
      const result = await payrollPolicyService.setPayrollPolicy({
        defaultPFPercent: values.defaultPFPercent,
        overtimeRatePerHour: values.overtimeRatePerHour,
        effectiveFrom: values.effectiveFrom
      });
      
      if (result.success) {
        toast.success('Payroll policy updated successfully');
        setShowPolicyModal(false);
        resetForm();
        fetchCurrentPolicy(); // Refresh current policy
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update policy');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Created':
        return 'warning';
      case 'Verified':
        return 'info';
      case 'Paid':
        return 'success';
      default:
        return 'secondary';
    }
  };

  const getFilteredPayrolls = () => {
    return payrolls.filter(p => {
      return (
        (!searchFilters.employeeId || p.employeeCode.toLowerCase().includes(searchFilters.employeeId.toLowerCase())) &&
        (!searchFilters.month || p.month === parseInt(searchFilters.month)) &&
        (!searchFilters.year || p.year === parseInt(searchFilters.year)) &&
        (!searchFilters.status || p.status === searchFilters.status)
      );
    }).sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  };

  const getPayrollStats = () => {
    return {
      total: payrolls.length,
      created: payrolls.filter(p => p.status === 'Created').length,
      verified: payrolls.filter(p => p.status === 'Verified').length,
      paid: payrolls.filter(p => p.status === 'Paid').length,
      totalAmount: payrolls.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.netPay, 0)
    };
  };

  const getEmployeePayrollHistory = (employeeId) => {
    return payrolls.filter(p => p.employeeId === employeeId)
      .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
  };

  const filteredPayrolls = getFilteredPayrolls();
  const stats = getPayrollStats();

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading payroll management...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Payroll Management</h2>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => setShowPolicyModal(true)}>
            <Settings size={18} className="me-1" />
            Policy Settings
          </Button>
          {canCreatePayroll && (
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus size={18} className="me-1" />
              Generate Payroll
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card>
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <FileText size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-1">Total Payrolls</h6>
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
                  <h6 className="mb-1">Pending Verification</h6>
                  <h3 className="mb-0">{stats.created}</h3>
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
                  <CheckCircle size={24} className="text-info" />
                </div>
                <div>
                  <h6 className="mb-1">Verified</h6>
                  <h3 className="mb-0">{stats.verified}</h3>
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
                  <DollarSign size={24} className="text-success" />
                </div>
                <div>
                  <h6 className="mb-1">Total Paid</h6>
                  <h3 className="mb-0">${stats.totalAmount.toLocaleString()}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Current Policy Display */}
      {currentPolicy && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">Current Payroll Policy</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <p><strong>Default PF Percentage:</strong> {currentPolicy.DefaultPFPercent}%</p>
              </Col>
              <Col md={4}>
                <p><strong>Overtime Rate:</strong> ${currentPolicy.OvertimeRatePerHour}/hour</p>
              </Col>
              <Col md={4}>
                <p><strong>Effective From:</strong> {new Date(currentPolicy.EffectiveFrom).toLocaleDateString()}</p>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      <Tabs defaultActiveKey="payrolls" className="mb-4">
        <Tab eventKey="payrolls" title="Payroll Records">
          <Card>
            <Card.Body>
              {/* Search Filters */}
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Employee ID</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search by Employee ID..."
                      value={searchFilters.employeeId}
                      onChange={(e) => setSearchFilters({...searchFilters, employeeId: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Month</Form.Label>
                    <Form.Select
                      value={searchFilters.month}
                      onChange={(e) => setSearchFilters({...searchFilters, month: e.target.value})}
                    >
                      {Array.from({length: 12}, (_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {new Date(2025, i, 1).toLocaleString('default', { month: 'long' })}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Year</Form.Label>
                    <Form.Select
                      value={searchFilters.year}
                      onChange={(e) => setSearchFilters({...searchFilters, year: e.target.value})}
                    >
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2023">2023</option>
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
                      <option value="Created">Created</option>
                      <option value="Verified">Verified</option>
                      <option value="Paid">Paid</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchFilters({ employeeId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), status: '' })}
                  >
                    Clear Filters
                  </Button>
                </Col>
              </Row>

              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Period</th>
                    <th>Gross Pay</th>
                    <th>Deductions</th>
                    <th>Net Pay</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayrolls.map((payroll) => (
                    <tr key={payroll.id}>
                      <td>
                        <div>
                          <strong>{payroll.employeeName}</strong>
                          <br />
                          <small className="text-muted">{payroll.employeeCode}</small>
                        </div>
                      </td>
                      <td>
                        {new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                      </td>
                      <td>${payroll.grossPay.toLocaleString()}</td>
                      <td>${payroll.totalDeductions.toLocaleString()}</td>
                      <td><strong>${payroll.netPay.toLocaleString()}</strong></td>
                      <td>
                        <Badge bg={getStatusBadgeColor(payroll.status)}>
                          {payroll.status}
                        </Badge>
                      </td>
                      <td>{new Date(payroll.createdDate).toLocaleDateString()}</td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            onClick={() => {
                              setSelectedPayroll(payroll);
                              // Show payroll details modal (implement if needed)
                            }}
                            title="View Details"
                          >
                            <Eye size={14} />
                          </Button>
                          
                          {canVerifyPayroll && payroll.status === 'Created' && (
                            <Button 
                              variant="outline-success" 
                              size="sm"
                              onClick={() => {
                                setSelectedPayroll(payroll);
                                setShowVerifyModal(true);
                              }}
                              title="Verify Payroll"
                            >
                              <CheckCircle size={14} />
                            </Button>
                          )}
                          
                          {payroll.status === 'Verified' && (
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => {
                                setSelectedPayroll(payroll);
                                setShowPayModal(true);
                              }}
                              title="Mark as Paid"
                            >
                              <CreditCard size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="history" title="Employee History">
          <Card>
            <Card.Body>
              <Row className="mb-3">
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Select Employee</Form.Label>
                    <Form.Select
                      value={selectedEmployee?.EmployeeId || ''}
                      onChange={(e) => {
                        const employee = employees.find(emp => emp.EmployeeId === parseInt(e.target.value));
                        setSelectedEmployee(employee);
                      }}
                    >
                      <option value="">Choose an employee...</option>
                      {employees.map(emp => (
                        <option key={emp.EmployeeId} value={emp.EmployeeId}>
                          {emp.FirstName} {emp.LastName} ({emp.EmployeeId})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {selectedEmployee && (
                <div>
                  <h5 className="mb-3">Payroll History - {selectedEmployee.FirstName} {selectedEmployee.LastName}</h5>
                  <Table responsive hover>
                    <thead>
                      <tr>
                        <th>Period</th>
                        <th>Gross Pay</th>
                        <th>Deductions</th>
                        <th>Net Pay</th>
                        <th>Status</th>
                        <th>Payment Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getEmployeePayrollHistory(selectedEmployee.EmployeeId).map((payroll) => (
                        <tr key={payroll.id}>
                          <td>
                            {new Date(payroll.year, payroll.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </td>
                          <td>${payroll.grossPay.toLocaleString()}</td>
                          <td>${payroll.totalDeductions.toLocaleString()}</td>
                          <td><strong>${payroll.netPay.toLocaleString()}</strong></td>
                          <td>
                            <Badge bg={getStatusBadgeColor(payroll.status)}>
                              {payroll.status}
                            </Badge>
                          </td>
                          <td>
                            {payroll.paidDate ? new Date(payroll.paidDate).toLocaleDateString() : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Generate Payroll Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Generate New Payroll</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            employeeId: '',
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
          }}
          validationSchema={PayrollSchema}
          onSubmit={handleCreatePayroll}
        >
          {({ isSubmitting, errors, touched }) => (
            <FormikForm>
              <Modal.Body>
                <Alert variant="info">
                  <strong>Note:</strong> Payroll will be generated based on the employee's current salary structure and the latest payroll policy.
                </Alert>

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
                            {emp.FirstName} {emp.LastName} ({emp.EmployeeId})
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="employeeId" component="div" className="invalid-feedback" />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Month</Form.Label>
                      <Field
                        as="select"
                        name="month"
                        className={`form-select ${errors.month && touched.month ? 'is-invalid' : ''}`}
                      >
                        {Array.from({length: 12}, (_, i) => (
                          <option key={i + 1} value={i + 1}>
                            {new Date(2025, i, 1).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="month" component="div" className="invalid-feedback" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Year</Form.Label>
                      <Field
                        as="select"
                        name="year"
                        className={`form-select ${errors.year && touched.year ? 'is-invalid' : ''}`}
                      >
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                        <option value="2023">2023</option>
                      </Field>
                      <ErrorMessage name="year" component="div" className="invalid-feedback" />
                    </Form.Group>
                  </Col>
                </Row>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Generating...' : 'Generate Payroll'}
                </Button>
              </Modal.Footer>
            </FormikForm>
          )}
        </Formik>
      </Modal>

      {/* Verify Payroll Modal */}
      <Modal show={showVerifyModal} onHide={() => setShowVerifyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Verify Payroll</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayroll && (
            <div>
              <p>Are you sure you want to verify the payroll for <strong>{selectedPayroll.employeeName}</strong>?</p>
              <Alert variant="info">
                <Row>
                  <Col md={6}>
                    <p><strong>Period:</strong> {new Date(selectedPayroll.year, selectedPayroll.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    <p><strong>Gross Pay:</strong> ${selectedPayroll.grossPay.toLocaleString()}</p>
                  </Col>
                  <Col md={6}>
                    <p><strong>Deductions:</strong> ${selectedPayroll.totalDeductions.toLocaleString()}</p>
                    <p><strong>Net Pay:</strong> ${selectedPayroll.netPay.toLocaleString()}</p>
                  </Col>
                </Row>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={() => handleVerifyPayroll(selectedPayroll.id)}
          >
            <CheckCircle size={16} className="me-1" />
            Verify Payroll
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Mark as Paid Modal */}
      <Modal show={showPayModal} onHide={() => setShowPayModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Mark as Paid</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayroll && (
            <div>
              <p>Mark payroll as paid for <strong>{selectedPayroll.employeeName}</strong></p>
              <Form.Group className="mb-3">
                <Form.Label>Payment Mode</Form.Label>
                <Form.Select id="paymentMode">
                  <option value="">Select Payment Mode</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Digital Wallet">Digital Wallet</option>
                </Form.Select>
              </Form.Group>
              <Alert variant="success">
                <p><strong>Amount to be paid:</strong> ${selectedPayroll.netPay.toLocaleString()}</p>
              </Alert>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPayModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              const paymentMode = document.getElementById('paymentMode').value;
              if (paymentMode) {
                handleMarkAsPaid(selectedPayroll.id, paymentMode);
              } else {
                alert('Please select a payment mode');
              }
            }}
          >
            <CreditCard size={16} className="me-1" />
            Mark as Paid
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Policy Settings Modal */}
      <Modal show={showPolicyModal} onHide={() => setShowPolicyModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Payroll Policy</Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            defaultPFPercent: currentPolicy?.DefaultPFPercent || 12,
            overtimeRatePerHour: currentPolicy?.OvertimeRatePerHour || 50,
            effectiveFrom: new Date().toISOString().split('T')[0]
          }}
          validationSchema={PolicySchema}
          onSubmit={handleUpdatePolicy}
        >
          {({ isSubmitting, errors, touched }) => (
            <FormikForm>
              <Modal.Body>
                {currentPolicy && (
                  <Alert variant="info">
                    <strong>Current Policy:</strong> PF {currentPolicy.DefaultPFPercent}%, Overtime ${currentPolicy.OvertimeRatePerHour}/hr
                  </Alert>
                )}
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Default PF Percentage (%)</Form.Label>
                      <Field
                        type="number"
                        name="defaultPFPercent"
                        step="0.1"
                        min="0"
                        max="100"
                        className={`form-control ${errors.defaultPFPercent && touched.defaultPFPercent ? 'is-invalid' : ''}`}
                        placeholder="Enter PF percentage"
                      />
                      <ErrorMessage name="defaultPFPercent" component="div" className="invalid-feedback" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Overtime Rate per Hour ($)</Form.Label>
                      <Field
                        type="number"
                        name="overtimeRatePerHour"
                        min="0"
                        className={`form-control ${errors.overtimeRatePerHour && touched.overtimeRatePerHour ? 'is-invalid' : ''}`}
                        placeholder="Enter overtime rate"
                      />
                      <ErrorMessage name="overtimeRatePerHour" component="div" className="invalid-feedback" />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Effective Date</Form.Label>
                  <Field
                    type="date"
                    name="effectiveFrom"
                    className={`form-control ${errors.effectiveFrom && touched.effectiveFrom ? 'is-invalid' : ''}`}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <ErrorMessage name="effectiveFrom" component="div" className="invalid-feedback" />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowPolicyModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Policy'}
                </Button>
              </Modal.Footer>
            </FormikForm>
          )}
        </Formik>
      </Modal>
    </div>
  );
};

export default PayrollManagement;