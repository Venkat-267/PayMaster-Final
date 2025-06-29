import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Modal, Badge, Tabs, Tab, Alert, Spinner } from 'react-bootstrap';
import { Search, DollarSign, Plus, Eye, CheckCircle, CreditCard, Calendar, User, FileText, Settings, Filter, AlertTriangle } from 'lucide-react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import payrollService from '../../services/payrollService';
import payrollPolicyService from '../../services/payrollPolicyService';
import employeeService from '../../services/employeeService';

const PayrollManagement = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [currentPolicy, setCurrentPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    employeeId: '',
    month: '',
    year: '',
    status: ''
  });
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  
  // Selected items
  const [selectedPayroll, setSelectedPayroll] = useState(null);
  const [paymentMode, setPaymentMode] = useState('');
  
  const { hasAccess, ROLES, getCurrentUser } = useAuth();
  
  const currentUser = getCurrentUser();
  const canCreatePayroll = hasAccess([ROLES.ADMIN.id, ROLES.PAYROLL_PROCESSOR.id]);
  const canVerifyPayroll = hasAccess([ROLES.ADMIN.id, ROLES.MANAGER.id, ROLES.HR_MANAGER.id, ROLES.PAYROLL_PROCESSOR.id]);
  const canMarkAsPaid = hasAccess([ROLES.ADMIN.id, ROLES.PAYROLL_PROCESSOR.id]);

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
        fetchCurrentPolicy(),
        fetchPayrolls() // Use the new endpoint
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

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      
      // Use the new all-details endpoint
      const result = await payrollService.getAllPayrolls();
      if (result.success) {
        setPayrolls(applyFilters(result.data || []));
      } else {
        toast.error('Failed to fetch payrolls');
        setPayrolls([]);
      }
    } catch (error) {
      console.error('Failed to fetch payrolls:', error);
      toast.error('Failed to fetch payrolls');
      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (payrollData) => {
    let filtered = payrollData;
    
    if (searchFilters.employeeId) {
      filtered = filtered.filter(p => p.EmployeeId === parseInt(searchFilters.employeeId));
    }
    if (searchFilters.month) {
      filtered = filtered.filter(p => p.Month === parseInt(searchFilters.month));
    }
    if (searchFilters.year) {
      filtered = filtered.filter(p => p.Year === parseInt(searchFilters.year));
    }
    if (searchFilters.status) {
      const statusMap = {
        'Generated': 'Created',
        'Verified': 'Verified', 
        'Paid': 'Paid'
      };
      const apiStatus = statusMap[searchFilters.status] || searchFilters.status;
      filtered = filtered.filter(p => p.Status === apiStatus);
    }

    return filtered.sort((a, b) => new Date(b.ProcessedDate) - new Date(a.ProcessedDate));
  };

  useEffect(() => {
    if (payrolls.length > 0) {
      const filtered = applyFilters(payrolls);
      setPayrolls(filtered);
    }
  }, [searchFilters]);

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
        fetchPayrolls(); // Refresh the list
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
        setShowDetailModal(false);
        
        // Update the payroll status locally
        setPayrolls(payrolls.map(p => 
          p.PayrollId === payrollId 
            ? { ...p, Status: 'Verified', IsVerified: true, VerifiedBy: currentUser.id, VerifiedDate: new Date().toISOString() }
            : p
        ));
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to verify payroll');
    }
  };

  const handleMarkAsPaid = async (payrollId, paymentModeValue) => {
    try {
      const result = await payrollService.markPayrollAsPaid(payrollId, paymentModeValue);
      
      if (result.success) {
        toast.success('Payroll marked as paid successfully');
        setShowPayModal(false);
        setShowDetailModal(false);
        setPaymentMode('');
        
        // Update the payroll status locally
        setPayrolls(payrolls.map(p => 
          p.PayrollId === payrollId 
            ? { ...p, Status: 'Paid', IsPaid: true, PaidDate: new Date().toISOString(), PaymentMode: paymentModeValue }
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
        fetchCurrentPolicy();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to update policy');
    } finally {
      setSubmitting(false);
    }
  };

  // Action handlers
  const handleViewDetails = (payroll) => {
    setSelectedPayroll(payroll);
    setShowDetailModal(true);
  };

  const handleVerifyClick = (payroll) => {
    setSelectedPayroll(payroll);
    setShowVerifyModal(true);
  };

  const handleMarkAsPaidClick = (payroll) => {
    setSelectedPayroll(payroll);
    setPaymentMode('');
    setShowPayModal(true);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Generated':
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

  const mapApiStatusToDisplayStatus = (apiStatus) => {
    const statusMap = {
      'Created': 'Generated',
      'Verified': 'Verified',
      'Paid': 'Paid'
    };
    return statusMap[apiStatus] || apiStatus;
  };

  const getPayrollStats = () => {
    return {
      total: payrolls.length,
      generated: payrolls.filter(p => p.Status === 'Created').length,
      verified: payrolls.filter(p => p.Status === 'Verified').length,
      paid: payrolls.filter(p => p.Status === 'Paid').length,
      totalAmount: payrolls.filter(p => p.Status === 'Paid').reduce((sum, p) => sum + (p.NetPay || 0), 0)
    };
  };

  // Button visibility logic
  const shouldShowVerifyButton = (payroll) => {
    return canVerifyPayroll && payroll.Status === 'Created' && !payroll.IsVerified;
  };

  const shouldShowMarkAsPaidButton = (payroll) => {
    return canMarkAsPaid && payroll.Status === 'Verified' && !payroll.IsPaid;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const stats = getPayrollStats();

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Payroll Management</h2>
          <p className="text-muted mb-0">Manage employee payrolls and processing</p>
        </div>
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
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <FileText size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Total Payrolls</h6>
                  <h3 className="mb-0">{stats.total}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-warning bg-opacity-10 p-3 rounded-circle me-3">
                  <AlertTriangle size={24} className="text-warning" />
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Pending Verification</h6>
                  <h3 className="mb-0">{stats.generated}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                  <CheckCircle size={24} className="text-info" />
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Verified</h6>
                  <h3 className="mb-0">{stats.verified}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                  <DollarSign size={24} className="text-success" />
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Total Paid</h6>
                  <h3 className="mb-0">{formatCurrency(stats.totalAmount)}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Current Policy Display */}
      {currentPolicy && (
        <Card className="border-0 shadow-sm mb-4">
          <Card.Header className="bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Current Payroll Policy</h5>
              <Button variant="outline-primary" size="sm" onClick={() => setShowPolicyModal(true)}>
                <Settings size={16} className="me-1" />
                Update Policy
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4}>
                <div className="text-center">
                  <h6 className="text-muted">Default PF Percentage</h6>
                  <h4 className="text-primary">{currentPolicy.DefaultPFPercent}%</h4>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center">
                  <h6 className="text-muted">Overtime Rate</h6>
                  <h4 className="text-success">{formatCurrency(currentPolicy.OvertimeRatePerHour)}/hour</h4>
                </div>
              </Col>
              <Col md={4}>
                <div className="text-center">
                  <h6 className="text-muted">Effective From</h6>
                  <h6 className="text-info">{new Date(currentPolicy.EffectiveFrom).toLocaleDateString()}</h6>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Pending Actions Alert */}
      {(stats.generated > 0 || stats.verified > 0) && (
        <Alert variant="warning" className="mb-4">
          <div className="d-flex align-items-center">
            <AlertTriangle size={20} className="me-2" />
            <div className="flex-grow-1">
              <strong>Action Required:</strong> 
              {stats.generated > 0 && ` ${stats.generated} payroll(s) need verification.`}
              {stats.verified > 0 && ` ${stats.verified} verified payroll(s) need to be marked as paid.`}
            </div>
          </div>
        </Alert>
      )}

      {/* Payroll List */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Payroll Records</h5>
            <Badge bg="primary" className="px-3 py-2">
              {payrolls.length} Records
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          {/* Filters */}
          <Row className="mb-4">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="d-flex align-items-center">
                  <User size={16} className="me-1" />
                  Employee
                </Form.Label>
                <Form.Select
                  value={searchFilters.employeeId}
                  onChange={(e) => setSearchFilters({...searchFilters, employeeId: e.target.value})}
                >
                  <option value="">All Employees</option>
                  {employees.map(emp => (
                    <option key={emp.EmployeeId} value={emp.EmployeeId}>
                      {emp.FirstName} {emp.LastName} (ID: {emp.EmployeeId})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="d-flex align-items-center">
                  <Calendar size={16} className="me-1" />
                  Month
                </Form.Label>
                <Form.Select
                  value={searchFilters.month}
                  onChange={(e) => setSearchFilters({...searchFilters, month: e.target.value})}
                >
                  <option value="">All Months</option>
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
                  <option value="">All Years</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label className="d-flex align-items-center">
                  <Filter size={16} className="me-1" />
                  Status
                </Form.Label>
                <Form.Select
                  value={searchFilters.status}
                  onChange={(e) => setSearchFilters({...searchFilters, status: e.target.value})}
                >
                  <option value="">All Status</option>
                  <option value="Generated">Generated</option>
                  <option value="Verified">Verified</option>
                  <option value="Paid">Paid</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3} className="d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                onClick={() => setSearchFilters({ employeeId: '', month: '', year: '', status: '' })}
                className="w-100"
              >
                Clear Filters
              </Button>
            </Col>
          </Row>

          {/* Payroll Table */}
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2 text-muted">Loading payroll data...</p>
            </div>
          ) : payrolls.length > 0 ? (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0">Employee</th>
                  <th className="border-0">Period</th>
                  <th className="border-0">Gross Pay</th>
                  <th className="border-0">Deductions</th>
                  <th className="border-0">Net Pay</th>
                  <th className="border-0">Status</th>
                  <th className="border-0">Processed Date</th>
                  <th className="border-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payrolls.map((payroll) => (
                  <tr key={payroll.PayrollId} className={payroll.Status === 'Created' ? 'table-warning' : payroll.Status === 'Verified' ? 'table-info' : ''}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                          <User size={16} className="text-primary" />
                        </div>
                        <div>
                          <div className="fw-medium">{payroll.EmployeeName || `Employee ${payroll.EmployeeId}`}</div>
                          <small className="text-muted">EMP{payroll.EmployeeId.toString().padStart(3, '0')}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <Calendar size={16} className="text-muted me-2" />
                        <div>
                          <div className="fw-medium">
                            {new Date(payroll.Year, payroll.Month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </div>
                          <small className="text-muted">{payroll.Month}/{payroll.Year}</small>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="fw-medium text-success">
                        {formatCurrency(payroll.GrossPay || 0)}
                      </div>
                    </td>
                    <td>
                      <div className="fw-medium text-danger">
                        {formatCurrency((payroll.EmployeePF || 0) + (payroll.IncomeTax || 0))}
                      </div>
                    </td>
                    <td>
                      <div className="fw-bold text-primary">
                        {formatCurrency(payroll.NetPay || 0)}
                      </div>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeColor(payroll.Status)} className="px-3 py-2">
                        {mapApiStatusToDisplayStatus(payroll.Status)}
                      </Badge>
                    </td>
                    <td>
                      <div className="text-muted">
                        {new Date(payroll.ProcessedDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {/* View Details Button - Always Available */}
                        <Button 
                          variant="outline-info" 
                          size="sm"
                          onClick={() => handleViewDetails(payroll)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Button>
                        
                        {/* Verify Button - Only for Created/Generated payrolls */}
                        {shouldShowVerifyButton(payroll) && (
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => handleVerifyClick(payroll)}
                            title="Verify Payroll"
                            className="text-white"
                          >
                            <CheckCircle size={14} />
                          </Button>
                        )}
                        
                        {/* Mark as Paid Button - Only for Verified payrolls */}
                        {shouldShowMarkAsPaidButton(payroll) && (
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => handleMarkAsPaidClick(payroll)}
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
          ) : (
            <div className="text-center py-5">
              <FileText size={64} className="text-muted mb-3" />
              <h5 className="text-muted">No Payroll Records Found</h5>
              <p className="text-muted">Generate payroll to get started or adjust your filters.</p>
              {canCreatePayroll && (
                <Button variant="primary" onClick={() => setShowCreateModal(true)}>
                  <Plus size={18} className="me-1" />
                  Generate First Payroll
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Payroll Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <DollarSign size={24} className="me-2" />
            Payroll Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayroll && (
            <div>
              {/* Employee Information */}
              <Card className="border-primary mb-4">
                <Card.Header className="bg-primary text-white">
                  <h6 className="mb-0">Employee Information</h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <strong>Employee:</strong> {selectedPayroll.EmployeeName || `Employee ${selectedPayroll.EmployeeId}`}
                    </Col>
                    <Col md={6}>
                      <strong>Employee Code:</strong> EMP{selectedPayroll.EmployeeId.toString().padStart(3, '0')}
                    </Col>
                  </Row>
                  <Row className="mt-2">
                    <Col md={6}>
                      <strong>Period:</strong> {new Date(selectedPayroll.Year, selectedPayroll.Month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </Col>
                    <Col md={6}>
                      <strong>Processed By:</strong> {selectedPayroll.ProcessedByName || `User ${selectedPayroll.ProcessedBy}`}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Payroll Breakdown */}
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="border-success h-100">
                    <Card.Header className="bg-success text-white">
                      <h6 className="mb-0">Earnings</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Gross Pay:</span>
                        <strong>{formatCurrency(selectedPayroll.GrossPay || 0)}</strong>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">Total Earnings:</span>
                        <strong className="text-success">{formatCurrency(selectedPayroll.GrossPay || 0)}</strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-danger h-100">
                    <Card.Header className="bg-danger text-white">
                      <h6 className="mb-0">Deductions</h6>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Employee PF:</span>
                        <strong>{formatCurrency(selectedPayroll.EmployeePF || 0)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Income Tax:</span>
                        <strong>{formatCurrency(selectedPayroll.IncomeTax || 0)}</strong>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between">
                        <span className="fw-bold">Total Deductions:</span>
                        <strong className="text-danger">{formatCurrency((selectedPayroll.EmployeePF || 0) + (selectedPayroll.IncomeTax || 0))}</strong>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {/* Net Pay */}
              <Card className="border-primary">
                <Card.Header className="bg-primary text-white">
                  <h6 className="mb-0">Net Pay</h6>
                </Card.Header>
                <Card.Body className="text-center">
                  <h2 className="text-primary mb-0">{formatCurrency(selectedPayroll.NetPay || 0)}</h2>
                  <p className="text-muted mb-0">Take-home Amount</p>
                </Card.Body>
              </Card>

              {/* Status and Processing Information */}
              <Row className="mt-4">
                <Col md={6}>
                  <strong>Status:</strong> 
                  <Badge bg={getStatusBadgeColor(selectedPayroll.Status)} className="ms-2">
                    {mapApiStatusToDisplayStatus(selectedPayroll.Status)}
                  </Badge>
                </Col>
                <Col md={6}>
                  <strong>Processed Date:</strong> {new Date(selectedPayroll.ProcessedDate).toLocaleDateString()}
                </Col>
              </Row>
              
              {selectedPayroll.IsVerified && (
                <Row className="mt-2">
                  <Col md={6}>
                    <strong>Verified By:</strong> {selectedPayroll.VerifiedByName || `User ${selectedPayroll.VerifiedBy}`}
                  </Col>
                  <Col md={6}>
                    <strong>Verified Date:</strong> {selectedPayroll.VerifiedDate ? new Date(selectedPayroll.VerifiedDate).toLocaleDateString() : 'N/A'}
                  </Col>
                </Row>
              )}
              
              {selectedPayroll.IsPaid && (
                <Row className="mt-2">
                  <Col md={6}>
                    <strong>Payment Mode:</strong> {selectedPayroll.PaymentMode || 'N/A'}
                  </Col>
                  <Col md={6}>
                    <strong>Paid Date:</strong> {selectedPayroll.PaidDate ? new Date(selectedPayroll.PaidDate).toLocaleDateString() : 'N/A'}
                  </Col>
                </Row>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedPayroll && (
            <div className="d-flex gap-2 w-100">
              {/* Verify Button */}
              {shouldShowVerifyButton(selectedPayroll) && (
                <Button 
                  variant="success"
                  onClick={() => handleVerifyPayroll(selectedPayroll.PayrollId)}
                  className="text-white"
                >
                  <CheckCircle size={16} className="me-1" />
                  Verify Payroll
                </Button>
              )}
              
              {/* Mark as Paid Button */}
              {shouldShowMarkAsPaidButton(selectedPayroll) && (
                <Button 
                  variant="primary"
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowPayModal(true);
                  }}
                >
                  <CreditCard size={16} className="me-1" />
                  Mark as Paid
                </Button>
              )}
              
              <div className="ms-auto">
                <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </Modal.Footer>
      </Modal>

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
          <Modal.Title>
            <CheckCircle size={24} className="me-2 text-success" />
            Verify Payroll
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayroll && (
            <div>
              <Alert variant="warning">
                <strong>Confirmation Required:</strong> Are you sure you want to verify this payroll? This action cannot be undone.
              </Alert>
              
              <Card className="border-info">
                <Card.Header className="bg-info text-white">
                  <h6 className="mb-0">Payroll Summary</h6>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>Employee:</strong> {selectedPayroll.EmployeeName || `Employee ${selectedPayroll.EmployeeId}`}</p>
                      <p><strong>Period:</strong> {new Date(selectedPayroll.Year, selectedPayroll.Month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>Gross Pay:</strong> {formatCurrency(selectedPayroll.GrossPay || 0)}</p>
                      <p><strong>Net Pay:</strong> {formatCurrency(selectedPayroll.NetPay || 0)}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVerifyModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={() => handleVerifyPayroll(selectedPayroll.PayrollId)}
            className="text-white"
          >
            <CheckCircle size={16} className="me-1" />
            Verify Payroll
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Mark as Paid Modal */}
      <Modal show={showPayModal} onHide={() => setShowPayModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <CreditCard size={24} className="me-2 text-primary" />
            Mark as Paid
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPayroll && (
            <div>
              <Alert variant="success">
                <strong>Payment Processing:</strong> Mark this payroll as paid after completing the payment process.
              </Alert>
              
              <Card className="border-success mb-3">
                <Card.Header className="bg-success text-white">
                  <h6 className="mb-0">Payment Details</h6>
                </Card.Header>
                <Card.Body>
                  <p><strong>Employee:</strong> {selectedPayroll.EmployeeName || `Employee ${selectedPayroll.EmployeeId}`}</p>
                  <p><strong>Amount to Pay:</strong> <span className="h5 text-success">{formatCurrency(selectedPayroll.NetPay || 0)}</span></p>
                </Card.Body>
              </Card>
              
              <Form.Group className="mb-3">
                <Form.Label>Payment Mode *</Form.Label>
                <Form.Select 
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value)}
                  required
                >
                  <option value="">Select Payment Mode</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Digital Wallet">Digital Wallet</option>
                </Form.Select>
                {!paymentMode && (
                  <Form.Text className="text-danger">
                    Please select a payment mode to proceed.
                  </Form.Text>
                )}
              </Form.Group>
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
              if (paymentMode) {
                handleMarkAsPaid(selectedPayroll.PayrollId, paymentMode);
              } else {
                toast.error('Please select a payment mode');
              }
            }}
            disabled={!paymentMode}
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
                    <strong>Current Policy:</strong> PF {currentPolicy.DefaultPFPercent}%, Overtime {formatCurrency(currentPolicy.OvertimeRatePerHour)}/hr
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
                      <Form.Label>Overtime Rate per Hour (₹)</Form.Label>
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