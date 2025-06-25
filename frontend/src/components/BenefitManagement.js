import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Modal, Badge, Alert, Spinner } from 'react-bootstrap';
import { Plus, Edit2, Trash2, Gift, DollarSign, Calendar, FileText, Eye } from 'lucide-react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import benefitService from '../services/benefitService';
import { useAuth } from '../context/AuthContext';

const BenefitManagement = ({ employeeId, employeeName, onClose }) => {
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState(null);
  const [selectedBenefit, setSelectedBenefit] = useState(null);
  const { hasAccess, ROLES, getCurrentUser } = useAuth();

  const currentUser = getCurrentUser();
  const canManageBenefits = hasAccess([ROLES.ADMIN.id, ROLES.HR_MANAGER.id, ROLES.PAYROLL_PROCESSOR.id]);

  const BenefitSchema = Yup.object().shape({
    benefitType: Yup.string().required('Benefit type is required'),
    amount: Yup.number()
      .required('Amount is required')
      .min(0, 'Amount must be positive'),
    description: Yup.string().required('Description is required'),
    assignedDate: Yup.date().required('Assigned date is required')
  });

  // Predefined benefit types
  const benefitTypes = [
    'Health Insurance',
    'Dental Insurance',
    'Vision Insurance',
    'Life Insurance',
    'Retirement Plan',
    'Transportation Allowance',
    'Meal Allowance',
    'Phone Allowance',
    'Internet Allowance',
    'Gym Membership',
    'Professional Development',
    'Flexible Spending Account',
    'Childcare Assistance',
    'Education Assistance',
    'Other'
  ];

  useEffect(() => {
    if (employeeId) {
      fetchBenefits();
    }
  }, [employeeId]);

  const fetchBenefits = async () => {
    try {
      setLoading(true);
      const result = await benefitService.getEmployeeBenefits(employeeId);
      
      if (result.success) {
        setBenefits(result.data || []);
      } else {
        toast.error(result.message);
        setBenefits([]);
      }
    } catch (error) {
      toast.error('Failed to fetch benefits');
      setBenefits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBenefit = () => {
    setEditingBenefit(null);
    setShowModal(true);
  };

  const handleEditBenefit = (benefit) => {
    setEditingBenefit(benefit);
    setShowModal(true);
  };

  const handleViewBenefit = (benefit) => {
    setSelectedBenefit(benefit);
    setShowDetailModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      let result;
      
      if (editingBenefit) {
        result = await benefitService.updateBenefit({
          benefitId: editingBenefit.BenefitId,
          employeeId: employeeId,
          benefitType: values.benefitType,
          amount: values.amount,
          description: values.description,
          assignedDate: values.assignedDate
        });
      } else {
        result = await benefitService.addBenefit({
          employeeId: employeeId,
          benefitType: values.benefitType,
          amount: values.amount,
          description: values.description,
          assignedDate: values.assignedDate
        });
      }
      
      if (result.success) {
        toast.success(editingBenefit ? 'Benefit updated successfully' : 'Benefit added successfully');
        setShowModal(false);
        resetForm();
        fetchBenefits(); // Refresh the list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBenefit = async (benefitId) => {
    if (window.confirm('Are you sure you want to delete this benefit?')) {
      try {
        const result = await benefitService.deleteBenefit(benefitId);
        
        if (result.success) {
          toast.success('Benefit deleted successfully');
          fetchBenefits(); // Refresh the list
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Failed to delete benefit');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getBenefitTypeColor = (type) => {
    const colorMap = {
      'Health Insurance': 'success',
      'Dental Insurance': 'info',
      'Vision Insurance': 'primary',
      'Life Insurance': 'warning',
      'Retirement Plan': 'dark',
      'Transportation Allowance': 'secondary',
      'Meal Allowance': 'success',
      'Phone Allowance': 'info',
      'Internet Allowance': 'primary',
      'Gym Membership': 'warning',
      'Professional Development': 'dark',
      'Flexible Spending Account': 'secondary',
      'Childcare Assistance': 'success',
      'Education Assistance': 'info',
      'Other': 'light'
    };
    return colorMap[type] || 'secondary';
  };

  const getTotalBenefitValue = () => {
    return benefits.reduce((total, benefit) => total + (benefit.Amount || 0), 0);
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Benefits Management</h4>
          <p className="text-muted mb-0">Managing benefits for {employeeName}</p>
        </div>
        <div className="d-flex gap-2">
          {canManageBenefits && (
            <Button variant="primary" onClick={handleAddBenefit}>
              <Plus size={18} className="me-1" />
              Add Benefit
            </Button>
          )}
          <Button variant="outline-secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                  <Gift size={24} className="text-primary" />
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Total Benefits</h6>
                  <h3 className="mb-0">{benefits.length}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-success bg-opacity-10 p-3 rounded-circle me-3">
                  <DollarSign size={24} className="text-success" />
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Total Value</h6>
                  <h3 className="mb-0">{formatCurrency(getTotalBenefitValue())}</h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-info bg-opacity-10 p-3 rounded-circle me-3">
                  <Calendar size={24} className="text-info" />
                </div>
                <div>
                  <h6 className="mb-1 text-muted">Active Since</h6>
                  <h3 className="mb-0">
                    {benefits.length > 0 
                      ? new Date(Math.min(...benefits.map(b => new Date(b.AssignedDate)))).getFullYear()
                      : 'N/A'
                    }
                  </h3>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Benefits Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0">Employee Benefits</h5>
        </Card.Header>
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2 text-muted">Loading benefits...</p>
            </div>
          ) : benefits.length > 0 ? (
            <Table responsive hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th className="border-0">Benefit Type</th>
                  <th className="border-0">Amount</th>
                  <th className="border-0">Description</th>
                  <th className="border-0">Assigned Date</th>
                  <th className="border-0">Actions</th>
                </tr>
              </thead>
              <tbody>
                {benefits.map((benefit) => (
                  <tr key={benefit.BenefitId}>
                    <td>
                      <div className="d-flex align-items-center">
                        <Badge 
                          bg={getBenefitTypeColor(benefit.BenefitType)} 
                          className="me-2"
                        >
                          <Gift size={12} className="me-1" />
                          {benefit.BenefitType}
                        </Badge>
                      </div>
                    </td>
                    <td>
                      <strong className="text-success">
                        {formatCurrency(benefit.Amount)}
                      </strong>
                    </td>
                    <td>
                      <div 
                        className="text-truncate" 
                        style={{ maxWidth: '200px' }}
                        title={benefit.Description}
                      >
                        {benefit.Description}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center text-muted">
                        <Calendar size={14} className="me-1" />
                        {formatDate(benefit.AssignedDate)}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-info" 
                          size="sm"
                          onClick={() => handleViewBenefit(benefit)}
                          title="View Details"
                        >
                          <Eye size={14} />
                        </Button>
                        {canManageBenefits && (
                          <>
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={() => handleEditBenefit(benefit)}
                              title="Edit Benefit"
                            >
                              <Edit2 size={14} />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleDeleteBenefit(benefit.BenefitId)}
                              title="Delete Benefit"
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
          ) : (
            <div className="text-center py-5">
              <Gift size={48} className="text-muted mb-3" />
              <h5 className="text-muted">No Benefits Found</h5>
              <p className="text-muted">This employee doesn't have any benefits assigned yet.</p>
              {canManageBenefits && (
                <Button variant="primary" onClick={handleAddBenefit}>
                  <Plus size={18} className="me-1" />
                  Add First Benefit
                </Button>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Benefit Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingBenefit ? 'Edit Benefit' : 'Add New Benefit'}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            benefitType: editingBenefit?.BenefitType || '',
            amount: editingBenefit?.Amount || '',
            description: editingBenefit?.Description || '',
            assignedDate: editingBenefit?.AssignedDate 
              ? editingBenefit.AssignedDate.split('T')[0] 
              : new Date().toISOString().split('T')[0]
          }}
          validationSchema={BenefitSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, errors, touched, values }) => (
            <FormikForm>
              <Modal.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Benefit Type</Form.Label>
                      <Field
                        as="select"
                        name="benefitType"
                        className={`form-select ${errors.benefitType && touched.benefitType ? 'is-invalid' : ''}`}
                      >
                        <option value="">Select Benefit Type</option>
                        {benefitTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Field>
                      <ErrorMessage name="benefitType" component="div" className="invalid-feedback" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Amount ($)</Form.Label>
                      <Field
                        type="number"
                        name="amount"
                        step="0.01"
                        min="0"
                        className={`form-control ${errors.amount && touched.amount ? 'is-invalid' : ''}`}
                        placeholder="Enter benefit amount"
                      />
                      <ErrorMessage name="amount" component="div" className="invalid-feedback" />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Assigned Date</Form.Label>
                  <Field
                    type="date"
                    name="assignedDate"
                    className={`form-control ${errors.assignedDate && touched.assignedDate ? 'is-invalid' : ''}`}
                  />
                  <ErrorMessage name="assignedDate" component="div" className="invalid-feedback" />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Field
                    as="textarea"
                    name="description"
                    rows={4}
                    className={`form-control ${errors.description && touched.description ? 'is-invalid' : ''}`}
                    placeholder="Provide a detailed description of this benefit..."
                  />
                  <ErrorMessage name="description" component="div" className="invalid-feedback" />
                </Form.Group>

                {values.amount && (
                  <Alert variant="info">
                    <DollarSign size={16} className="me-2" />
                    <strong>Benefit Value:</strong> {formatCurrency(parseFloat(values.amount) || 0)}
                  </Alert>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : (editingBenefit ? 'Update Benefit' : 'Add Benefit')}
                </Button>
              </Modal.Footer>
            </FormikForm>
          )}
        </Formik>
      </Modal>

      {/* Benefit Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Benefit Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBenefit && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Benefit Type:</strong>
                  <div className="mt-1">
                    <Badge bg={getBenefitTypeColor(selectedBenefit.BenefitType)}>
                      {selectedBenefit.BenefitType}
                    </Badge>
                  </div>
                </Col>
                <Col md={6}>
                  <strong>Amount:</strong>
                  <div className="mt-1">
                    <span className="h5 text-success">
                      {formatCurrency(selectedBenefit.Amount)}
                    </span>
                  </div>
                </Col>
              </Row>
              
              <Row className="mb-3">
                <Col md={6}>
                  <strong>Assigned Date:</strong>
                  <div className="mt-1 text-muted">
                    <Calendar size={16} className="me-1" />
                    {formatDate(selectedBenefit.AssignedDate)}
                  </div>
                </Col>
                <Col md={6}>
                  <strong>Benefit ID:</strong>
                  <div className="mt-1 text-muted">
                    #{selectedBenefit.BenefitId}
                  </div>
                </Col>
              </Row>
              
              <div className="mb-3">
                <strong>Description:</strong>
                <div className="mt-2 p-3 bg-light rounded">
                  <FileText size={16} className="me-2 text-muted" />
                  {selectedBenefit.Description}
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {canManageBenefits && selectedBenefit && (
            <div className="d-flex gap-2">
              <Button 
                variant="primary"
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditBenefit(selectedBenefit);
                }}
              >
                <Edit2 size={16} className="me-1" />
                Edit Benefit
              </Button>
              <Button 
                variant="outline-danger"
                onClick={() => {
                  setShowDetailModal(false);
                  handleDeleteBenefit(selectedBenefit.BenefitId);
                }}
              >
                <Trash2 size={16} className="me-1" />
                Delete
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

export default BenefitManagement;