import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Form,
  Row,
  Col,
  Modal,
  Badge,
  Alert,
  Spinner,
} from "react-bootstrap";
import {
  Plus,
  Edit2,
  DollarSign,
  Calendar,
  TrendingUp,
  History,
  Eye,
} from "lucide-react";
import { Formik, Form as FormikForm, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import salaryService from "../services/salaryService";
import { useAuth } from "../context/AuthContext";

const SalaryManagement = ({ employeeId, employeeName, onClose }) => {
  const [currentSalary, setCurrentSalary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const { hasAccess, ROLES, getCurrentUser } = useAuth();

  const currentUser = getCurrentUser();
  const canManageSalary = hasAccess([
    ROLES.ADMIN.id,
    ROLES.HR_MANAGER.id,
    ROLES.PAYROLL_PROCESSOR.id,
  ]);

  const SalarySchema = Yup.object().shape({
    basicPay: Yup.number()
      .required("Basic pay is required")
      .min(0, "Basic pay must be positive"),
    hra: Yup.number()
      .required("HRA is required")
      .min(0, "HRA must be positive"),
    allowances: Yup.number()
      .required("Allowances is required")
      .min(0, "Allowances must be positive"),
    pfPercentage: Yup.number()
      .required("PF percentage is required")
      .min(0, "PF percentage must be positive")
      .max(100, "PF percentage cannot exceed 100"),
    effectiveFrom: Yup.date().required("Effective date is required"),
  });

  useEffect(() => {
    if (employeeId) {
      fetchCurrentSalary();
    }
  }, [employeeId]);

  const fetchCurrentSalary = async () => {
    try {
      setLoading(true);
      const result = await salaryService.getCurrentSalaryStructure(employeeId);

      if (result.success) {
        setCurrentSalary(result.data);
      } else {
        // If no salary structure found, that's okay - just set to null
        setCurrentSalary(null);
      }
    } catch (error) {
      toast.error("Failed to fetch salary structure");
      setCurrentSalary(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSalary = () => {
    setShowModal(true);
  };

  const handleViewDetails = () => {
    setShowDetailModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const result = await salaryService.assignSalaryStructure({
        employeeId: employeeId,
        basicPay: values.basicPay,
        hra: values.hra,
        allowances: values.allowances,
        pfPercentage: values.pfPercentage,
        effectiveFrom: values.effectiveFrom,
      });

      if (result.success) {
        toast.success("Salary structure assigned successfully");
        setShowModal(false);
        resetForm();
        fetchCurrentSalary(); // Refresh the data
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const calculateGrossSalary = () => {
    if (!currentSalary) return 0;
    return (
      (currentSalary.BasicPay || 0) +
      (currentSalary.HRA || 0) +
      (currentSalary.Allowances || 0)
    );
  };

  const calculatePFDeduction = () => {
    if (!currentSalary) return 0;
    return (
      ((currentSalary.BasicPay || 0) * (currentSalary.PFPercentage || 0)) / 100
    );
  };

  const calculateNetSalary = () => {
    const gross = calculateGrossSalary();
    const pfDeduction = calculatePFDeduction();
    // Simple tax calculation - 10% of gross
    const taxDeduction = gross * 0.1;
    return gross - pfDeduction - taxDeduction;
  };

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="mb-1">Salary Management</h4>
          <p className="text-muted mb-0">
            Managing salary structure for {employeeName}
          </p>
        </div>
        <div className="d-flex gap-2">
          {canManageSalary && (
            <Button variant="primary" onClick={handleAssignSalary}>
              <Plus size={18} className="me-1" />
              {currentSalary ? "Update Salary" : "Assign Salary"}
            </Button>
          )}
          <Button variant="outline-secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {loading ? (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2 text-muted">Loading salary information...</p>
          </Card.Body>
        </Card>
      ) : currentSalary ? (
        <>
          {/* Salary Overview Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <DollarSign size={24} className="text-primary" />
                    </div>
                    <div>
                      <h6 className="mb-1 text-muted">Basic Pay</h6>
                      <h4 className="mb-0">
                        {formatCurrency(currentSalary.BasicPay)}
                      </h4>
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
                      <TrendingUp size={24} className="text-success" />
                    </div>
                    <div>
                      <h6 className="mb-1 text-muted">Gross Salary</h6>
                      <h4 className="mb-0">
                        {formatCurrency(calculateGrossSalary())}
                      </h4>
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
                      <DollarSign size={24} className="text-info" />
                    </div>
                    <div>
                      <h6 className="mb-1 text-muted">Net Salary</h6>
                      <h4 className="mb-0">
                        {formatCurrency(calculateNetSalary())}
                      </h4>
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
                      <Calendar size={24} className="text-warning" />
                    </div>
                    <div>
                      <h6 className="mb-1 text-muted">Effective From</h6>
                      <h6 className="mb-0">
                        {formatDate(currentSalary.EffectiveFrom)}
                      </h6>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Salary Breakdown */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Current Salary Structure</h5>
                <div className="d-flex gap-2">
                  <Button
                    variant="outline-info"
                    size="sm"
                    onClick={handleViewDetails}
                  >
                    <Eye size={16} className="me-1" />
                    View Details
                  </Button>
                  {canManageSalary && (
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={handleAssignSalary}
                    >
                      <Edit2 size={16} className="me-1" />
                      Update
                    </Button>
                  )}
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Table borderless className="mb-0">
                    <tbody>
                      <tr>
                        <td className="fw-bold">Basic Pay:</td>
                        <td className="text-end">
                          {formatCurrency(currentSalary.BasicPay)}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">HRA:</td>
                        <td className="text-end">
                          {formatCurrency(currentSalary.HRA)}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Allowances:</td>
                        <td className="text-end">
                          {formatCurrency(currentSalary.Allowances)}
                        </td>
                      </tr>
                      <tr className="border-top">
                        <td className="fw-bold text-success">Gross Salary:</td>
                        <td className="text-end fw-bold text-success">
                          {formatCurrency(calculateGrossSalary())}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
                <Col md={6}>
                  <Table borderless className="mb-0">
                    <tbody>
                      <tr>
                        <td className="fw-bold">
                          PF Deduction ({currentSalary.PFPercentage}%):
                        </td>
                        <td className="text-end text-danger">
                          -{formatCurrency(calculatePFDeduction())}
                        </td>
                      </tr>
                      <tr>
                        <td className="fw-bold">Tax Deduction (10%):</td>
                        <td className="text-end text-danger">
                          -{formatCurrency(calculateGrossSalary() * 0.1)}
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td></td>
                      </tr>
                      <tr className="border-top">
                        <td className="fw-bold text-primary">Net Salary:</td>
                        <td className="text-end fw-bold text-primary">
                          {formatCurrency(calculateNetSalary())}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Annual Breakdown */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">
                <TrendingUp size={20} className="me-2" />
                Annual Compensation Summary
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4} className="text-center">
                  <h6 className="text-muted">Annual Gross</h6>
                  <h3 className="text-success">
                    {formatCurrency(calculateGrossSalary() * 12)}
                  </h3>
                </Col>
                <Col md={4} className="text-center">
                  <h6 className="text-muted">Annual Deductions</h6>
                  <h3 className="text-danger">
                    {formatCurrency(
                      (calculatePFDeduction() + calculateGrossSalary() * 0.1) *
                        12
                    )}
                  </h3>
                </Col>
                <Col md={4} className="text-center">
                  <h6 className="text-muted">Annual Net</h6>
                  <h3 className="text-primary">
                    {formatCurrency(calculateNetSalary() * 12)}
                  </h3>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </>
      ) : (
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <DollarSign size={64} className="text-muted mb-3" />
            <h4 className="text-muted">No Salary Structure Assigned</h4>
            <p className="text-muted mb-4">
              This employee doesn't have a salary structure assigned yet.
            </p>
            {canManageSalary && (
              <Button variant="primary" onClick={handleAssignSalary}>
                <Plus size={18} className="me-1" />
                Assign Salary Structure
              </Button>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Assign/Update Salary Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentSalary
              ? "Update Salary Structure"
              : "Assign Salary Structure"}
          </Modal.Title>
        </Modal.Header>
        <Formik
          initialValues={{
            basicPay: currentSalary?.BasicPay || "",
            hra: currentSalary?.HRA || "",
            allowances: currentSalary?.Allowances || "",
            pfPercentage: currentSalary?.PFPercentage || 12,
            effectiveFrom: new Date().toISOString().split("T")[0],
          }}
          validationSchema={SalarySchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ isSubmitting, errors, touched, values }) => (
            <FormikForm>
              <Modal.Body>
                <Alert variant="info">
                  <strong>Note:</strong> Assigning a new salary structure will
                  create a new record with the effective date specified.
                </Alert>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Basic Pay ($)</Form.Label>
                      <Field
                        type="number"
                        name="basicPay"
                        step="0.01"
                        min="0"
                        className={`form-control ${
                          errors.basicPay && touched.basicPay
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter basic pay"
                      />
                      <ErrorMessage
                        name="basicPay"
                        component="div"
                        className="invalid-feedback"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>HRA ($)</Form.Label>
                      <Field
                        type="number"
                        name="hra"
                        step="0.01"
                        min="0"
                        className={`form-control ${
                          errors.hra && touched.hra ? "is-invalid" : ""
                        }`}
                        placeholder="Enter HRA amount"
                      />
                      <ErrorMessage
                        name="hra"
                        component="div"
                        className="invalid-feedback"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Allowances ($)</Form.Label>
                      <Field
                        type="number"
                        name="allowances"
                        step="0.01"
                        min="0"
                        className={`form-control ${
                          errors.allowances && touched.allowances
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter allowances"
                      />
                      <ErrorMessage
                        name="allowances"
                        component="div"
                        className="invalid-feedback"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>PF Percentage (%)</Form.Label>
                      <Field
                        type="number"
                        name="pfPercentage"
                        step="0.1"
                        min="0"
                        max="100"
                        className={`form-control ${
                          errors.pfPercentage && touched.pfPercentage
                            ? "is-invalid"
                            : ""
                        }`}
                        placeholder="Enter PF percentage"
                      />
                      <ErrorMessage
                        name="pfPercentage"
                        component="div"
                        className="invalid-feedback"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Effective From</Form.Label>
                  <Field
                    type="date"
                    name="effectiveFrom"
                    className={`form-control ${
                      errors.effectiveFrom && touched.effectiveFrom
                        ? "is-invalid"
                        : ""
                    }`}
                  />
                  <ErrorMessage
                    name="effectiveFrom"
                    component="div"
                    className="invalid-feedback"
                  />
                </Form.Group>

                {values.basicPay && values.hra && values.allowances && (
                  <Alert variant="success">
                    <h6>Salary Preview:</h6>
                    <Row>
                      <Col md={6}>
                        <p>
                          <strong>Gross Salary:</strong>{" "}
                          {formatCurrency(
                            (parseFloat(values.basicPay) || 0) +
                              (parseFloat(values.hra) || 0) +
                              (parseFloat(values.allowances) || 0)
                          )}
                        </p>
                      </Col>
                      <Col md={6}>
                        <p>
                          <strong>PF Deduction:</strong>{" "}
                          {formatCurrency(
                            ((parseFloat(values.basicPay) || 0) *
                              (parseFloat(values.pfPercentage) || 0)) /
                              100
                          )}
                        </p>
                      </Col>
                    </Row>
                  </Alert>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Saving..."
                    : currentSalary
                    ? "Update Salary"
                    : "Assign Salary"}
                </Button>
              </Modal.Footer>
            </FormikForm>
          )}
        </Formik>
      </Modal>

      {/* Salary Detail Modal */}
      <Modal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        size="lg"
      >
        <Modal.Header closeButton>
          <Modal.Title>Salary Structure Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {currentSalary && (
            <div>
              <Row className="mb-4">
                <Col md={6}>
                  <Card className="border-primary">
                    <Card.Header className="bg-primary text-white">
                      <h6 className="mb-0">Earnings</h6>
                    </Card.Header>
                    <Card.Body>
                      <Table borderless className="mb-0">
                        <tbody>
                          <tr>
                            <td>Basic Pay:</td>
                            <td className="text-end fw-bold">
                              {formatCurrency(currentSalary.BasicPay)}
                            </td>
                          </tr>
                          <tr>
                            <td>HRA:</td>
                            <td className="text-end fw-bold">
                              {formatCurrency(currentSalary.HRA)}
                            </td>
                          </tr>
                          <tr>
                            <td>Allowances:</td>
                            <td className="text-end fw-bold">
                              {formatCurrency(currentSalary.Allowances)}
                            </td>
                          </tr>
                          <tr className="border-top">
                            <td className="fw-bold">Total Earnings:</td>
                            <td className="text-end fw-bold text-success">
                              {formatCurrency(calculateGrossSalary())}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="border-danger">
                    <Card.Header className="bg-danger text-white">
                      <h6 className="mb-0">Deductions</h6>
                    </Card.Header>
                    <Card.Body>
                      <Table borderless className="mb-0">
                        <tbody>
                          <tr>
                            <td>PF ({currentSalary.PFPercentage}%):</td>
                            <td className="text-end fw-bold">
                              {formatCurrency(calculatePFDeduction())}
                            </td>
                          </tr>
                          <tr>
                            <td>Tax (10%):</td>
                            <td className="text-end fw-bold">
                              {formatCurrency(calculateGrossSalary() * 0.1)}
                            </td>
                          </tr>
                          <tr>
                            <td></td>
                            <td></td>
                          </tr>
                          <tr className="border-top">
                            <td className="fw-bold">Total Deductions:</td>
                            <td className="text-end fw-bold text-danger">
                              {formatCurrency(
                                calculatePFDeduction() +
                                  calculateGrossSalary() * 0.1
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="border-success">
                <Card.Header className="bg-success text-white">
                  <h6 className="mb-0">Net Salary</h6>
                </Card.Header>
                <Card.Body className="text-center">
                  <h3 className="text-success mb-0">
                    {formatCurrency(calculateNetSalary())}
                  </h3>
                  <p className="text-muted mb-0">Monthly Take-home</p>
                </Card.Body>
              </Card>

              <div className="mt-4">
                <h6>Additional Information:</h6>
                <p>
                  <strong>Salary ID:</strong> {currentSalary.SalaryId}
                </p>
                <p>
                  <strong>Employee ID:</strong> {currentSalary.EmployeeId}
                </p>
                <p>
                  <strong>Effective From:</strong>{" "}
                  {formatDate(currentSalary.EffectiveFrom)}
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {canManageSalary && (
            <Button
              variant="primary"
              onClick={() => {
                setShowDetailModal(false);
                handleAssignSalary();
              }}
            >
              <Edit2 size={16} className="me-1" />
              Update Salary
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SalaryManagement;
