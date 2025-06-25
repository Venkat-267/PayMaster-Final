import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Modal, Badge, Alert, Spinner } from 'react-bootstrap';
import { Search, UserPlus, Edit2, Trash2, Users, Phone, Mail, MapPin, Calendar, User, Gift, DollarSign } from 'lucide-react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import employeeService from '../../services/employeeService';
import BenefitManagement from '../../components/BenefitManagement';
import SalaryManagement from '../../components/SalaryManagement';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchFilters, setSearchFilters] = useState({
    name: '',
    designation: '',
    department: '',
    managerId: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showBenefitModal, setShowBenefitModal] = useState(false);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [benefitEmployee, setBenefitEmployee] = useState(null);
  const [salaryEmployee, setSalaryEmployee] = useState(null);
  const { hasAccess, ROLES, getCurrentUser } = useAuth();
  
  const currentUser = getCurrentUser();
  const canManageEmployees = hasAccess([ROLES.ADMIN.id, ROLES.MANAGER.id, ROLES.HR_MANAGER.id, ROLES.PAYROLL_PROCESSOR.id]);
  const isEmployee = hasAccess([ROLES.EMPLOYEE.id]);

  const EmployeeSchema = Yup.object().shape({
    userId: Yup.number().required('User ID is required'),
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phone: Yup.string().required('Phone is required'),
    address: Yup.string().required('Address is required'),
    designation: Yup.string().required('Designation is required'),
    department: Yup.string().required('Department is required'),
    dateOfJoining: Yup.date().required('Date of joining is required'),
    managerId: Yup.number().nullable()
  });

  const PersonalInfoSchema = Yup.object().shape({
    phone: Yup.string().required('Phone is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    address: Yup.string().required('Address is required')
  });

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const result = await employeeService.getAllEmployees();
      
      if (result.success) {
        console.log('API Response:', result.data); // Debug log
        setEmployees(result.data || []);
      } else {
        toast.error(result.message);
        setEmployees([]);
      }
    } catch (error) {
      console.error('Fetch error:', error); // Debug log
      toast.error('Failed to fetch employees');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const result = await employeeService.searchEmployees(searchFilters);
      
      if (result.success) {
        setEmployees(result.data || []);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setShowModal(true);
  };

  const handleUpdatePersonalInfo = (employee) => {
    setSelectedEmployee(employee);
    setShowPersonalModal(true);
  };

  const handleManageBenefits = (employee) => {
    setBenefitEmployee(employee);
    setShowBenefitModal(true);
  };

  const handleManageSalary = (employee) => {
    setSalaryEmployee(employee);
    setShowSalaryModal(true);
  };

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      let result;
      
      if (editingEmployee) {
        result = await employeeService.updateEmployee(editingEmployee.EmployeeId, values);
      } else {
        result = await employeeService.addEmployee(values);
      }
      
      if (result.success) {
        toast.success(result.data?.Message || (editingEmployee ? 'Employee updated successfully' : 'Employee added successfully'));
        setShowModal(false);
        resetForm();
        fetchEmployees(); // Refresh the list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePersonalInfoSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const result = await employeeService.updatePersonalInfo(values);
      
      if (result.success) {
        toast.success(result.data?.Message || 'Personal information updated successfully');
        setShowPersonalModal(false);
        resetForm();
        fetchEmployees(); // Refresh the list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearchFilters({
      name: '',
      designation: '',
      department: '',
      managerId: ''
    });
    fetchEmployees(); // Fetch all employees
  };

  const getManagerName = (managerId) => {
    if (!managerId) return 'No Manager';
    
    console.log('Looking for manager with EmployeeId:', managerId); // Debug log
    console.log('Available employees:', employees.map(emp => ({ 
      EmployeeId: emp.EmployeeId, 
      Name: `${emp.FirstName} ${emp.LastName}` 
    }))); // Debug log
    
    const manager = employees.find(emp => emp.EmployeeId === managerId);
    
    if (manager) {
      console.log('Found manager:', manager); // Debug log
      return `${manager.FirstName} ${manager.LastName}`;
    } else {
      console.log('Manager not found for ManagerId:', managerId); // Debug log
      return `Manager ID: ${managerId}`;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Get unique departments and designations for statistics
  const getUniqueValues = (field) => {
    return new Set(employees.map(emp => emp[field]).filter(Boolean)).size;
  };

  return (
    <div>
      {/* Check if we're showing benefit management */}
      {showBenefitModal && benefitEmployee ? (
        <BenefitManagement
          employeeId={benefitEmployee.EmployeeId}
          employeeName={`${benefitEmployee.FirstName} ${benefitEmployee.LastName}`}
          onClose={() => {
            setShowBenefitModal(false);
            setBenefitEmployee(null);
          }}
        />
      ) : showSalaryModal && salaryEmployee ? (
        <SalaryManagement
          employeeId={salaryEmployee.EmployeeId}
          employeeName={`${salaryEmployee.FirstName} ${salaryEmployee.LastName}`}
          onClose={() => {
            setShowSalaryModal(false);
            setSalaryEmployee(null);
          }}
        />
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Employee Management</h2>
            {canManageEmployees && (
              <Button variant="primary" className="d-flex align-items-center gap-2" onClick={handleAddEmployee}>
                <UserPlus size={18} />
                Add Employee
              </Button>
            )}
          </div>

          {/* Statistics Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                      <Users size={24} className="text-primary" />
                    </div>
                    <div>
                      <h6 className="mb-1">Total Employees</h6>
                      <h3 className="mb-0">{employees.length}</h3>
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
                      <Users size={24} className="text-success" />
                    </div>
                    <div>
                      <h6 className="mb-1">Departments</h6>
                      <h3 className="mb-0">{getUniqueValues('Department')}</h3>
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
                      <Users size={24} className="text-info" />
                    </div>
                    <div>
                      <h6 className="mb-1">Designations</h6>
                      <h3 className="mb-0">{getUniqueValues('Designation')}</h3>
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
                      <Users size={24} className="text-warning" />
                    </div>
                    <div>
                      <h6 className="mb-1">Managers</h6>
                      <h3 className="mb-0">{employees.filter(emp => emp.ManagerId === null).length}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card>
            <Card.Body>
              {/* Search Filters */}
              <Row className="mb-3">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Search by name..."
                      value={searchFilters.name}
                      onChange={(e) => setSearchFilters({...searchFilters, name: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Designation</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Designation..."
                      value={searchFilters.designation}
                      onChange={(e) => setSearchFilters({...searchFilters, designation: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Department</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Department..."
                      value={searchFilters.department}
                      onChange={(e) => setSearchFilters({...searchFilters, department: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Manager ID</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Manager ID..."
                      value={searchFilters.managerId}
                      onChange={(e) => setSearchFilters({...searchFilters, managerId: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={3} className="d-flex align-items-end gap-2">
                  <Button variant="primary" onClick={handleSearch}>
                    <Search size={16} className="me-1" />
                    Search
                  </Button>
                  <Button variant="outline-secondary" onClick={clearFilters}>
                    Clear
                  </Button>
                </Col>
              </Row>

              {/* Loading State */}
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                  <p className="mt-2">Loading employees...</p>
                </div>
              ) : (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Department</th>
                      <th>Designation</th>
                      <th>Joining Date</th>
                      <th>Manager</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {employees.length > 0 ? (
                      employees.map((employee) => (
                        <tr key={employee.EmployeeId}>
                          <td>
                            <Badge bg="secondary">{employee.EmployeeId}</Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-2">
                                <User size={16} className="text-primary" />
                              </div>
                              <div>
                                <strong>{employee.FirstName} {employee.LastName}</strong>
                                <br />
                                <small className="text-muted">User ID: {employee.UserId}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Mail size={14} className="text-muted me-1" />
                              {employee.Email}
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Phone size={14} className="text-muted me-1" />
                              {employee.Phone}
                            </div>
                          </td>
                          <td>
                            <Badge bg="info">{employee.Department}</Badge>
                          </td>
                          <td>{employee.Designation}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <Calendar size={14} className="text-muted me-1" />
                              {formatDate(employee.DateOfJoining)}
                            </div>
                          </td>
                          <td>{getManagerName(employee.ManagerId)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              {canManageEmployees && (
                                <>
                                  <Button 
                                    variant="outline-warning" 
                                    size="sm"
                                    onClick={() => handleManageSalary(employee)}
                                    title="Manage Salary"
                                  >
                                    <DollarSign size={14} />
                                  </Button>
                                  <Button 
                                    variant="outline-success" 
                                    size="sm"
                                    onClick={() => handleManageBenefits(employee)}
                                    title="Manage Benefits"
                                  >
                                    <Gift size={14} />
                                  </Button>
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => handleEditEmployee(employee)}
                                    title="Edit Employee"
                                  >
                                    <Edit2 size={14} />
                                  </Button>
                                </>
                              )}
                              {isEmployee && employee.UserId === currentUser.id && (
                                <Button 
                                  variant="outline-success" 
                                  size="sm"
                                  onClick={() => handleUpdatePersonalInfo(employee)}
                                  title="Update Personal Info"
                                >
                                  <User size={14} />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="9" className="text-center py-4">
                          <div className="text-muted">
                            <Users size={48} className="mb-3" />
                            <p>No employees found</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          {/* Add/Edit Employee Modal */}
          <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
            <Modal.Header closeButton>
              <Modal.Title>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</Modal.Title>
            </Modal.Header>
            <Formik
              initialValues={{
                userId: editingEmployee?.UserId || '',
                firstName: editingEmployee?.FirstName || '',
                lastName: editingEmployee?.LastName || '',
                email: editingEmployee?.Email || '',
                phone: editingEmployee?.Phone || '',
                address: editingEmployee?.Address || '',
                designation: editingEmployee?.Designation || '',
                department: editingEmployee?.Department || '',
                dateOfJoining: editingEmployee?.DateOfJoining ? editingEmployee.DateOfJoining.split('T')[0] : '',
                managerId: editingEmployee?.ManagerId || ''
              }}
              validationSchema={EmployeeSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({ isSubmitting, errors, touched }) => (
                <FormikForm>
                  <Modal.Body>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>User ID</Form.Label>
                          <Field
                            type="number"
                            name="userId"
                            className={`form-control ${errors.userId && touched.userId ? 'is-invalid' : ''}`}
                            placeholder="Enter User ID"
                          />
                          <ErrorMessage name="userId" component="div" className="invalid-feedback" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Manager ID (Optional)</Form.Label>
                          <Field
                            type="number"
                            name="managerId"
                            className="form-control"
                            placeholder="Enter Manager ID"
                          />
                          <Form.Text className="text-muted">
                            Enter the Employee ID of the manager (leave empty if no manager)
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>First Name</Form.Label>
                          <Field
                            type="text"
                            name="firstName"
                            className={`form-control ${errors.firstName && touched.firstName ? 'is-invalid' : ''}`}
                            placeholder="Enter first name"
                          />
                          <ErrorMessage name="firstName" component="div" className="invalid-feedback" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Last Name</Form.Label>
                          <Field
                            type="text"
                            name="lastName"
                            className={`form-control ${errors.lastName && touched.lastName ? 'is-invalid' : ''}`}
                            placeholder="Enter last name"
                          />
                          <ErrorMessage name="lastName" component="div" className="invalid-feedback" />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email</Form.Label>
                          <Field
                            type="email"
                            name="email"
                            className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                            placeholder="Enter email"
                          />
                          <ErrorMessage name="email" component="div" className="invalid-feedback" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Phone</Form.Label>
                          <Field
                            type="text"
                            name="phone"
                            className={`form-control ${errors.phone && touched.phone ? 'is-invalid' : ''}`}
                            placeholder="Enter phone number"
                          />
                          <ErrorMessage name="phone" component="div" className="invalid-feedback" />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Field
                        as="textarea"
                        name="address"
                        rows={3}
                        className={`form-control ${errors.address && touched.address ? 'is-invalid' : ''}`}
                        placeholder="Enter address"
                      />
                      <ErrorMessage name="address" component="div" className="invalid-feedback" />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Designation</Form.Label>
                          <Field
                            type="text"
                            name="designation"
                            className={`form-control ${errors.designation && touched.designation ? 'is-invalid' : ''}`}
                            placeholder="Enter designation"
                          />
                          <ErrorMessage name="designation" component="div" className="invalid-feedback" />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Department</Form.Label>
                          <Field
                            type="text"
                            name="department"
                            className={`form-control ${errors.department && touched.department ? 'is-invalid' : ''}`}
                            placeholder="Enter department"
                          />
                          <ErrorMessage name="department" component="div" className="invalid-feedback" />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Date of Joining</Form.Label>
                      <Field
                        type="date"
                        name="dateOfJoining"
                        className={`form-control ${errors.dateOfJoining && touched.dateOfJoining ? 'is-invalid' : ''}`}
                      />
                      <ErrorMessage name="dateOfJoining" component="div" className="invalid-feedback" />
                    </Form.Group>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Saving...' : (editingEmployee ? 'Update Employee' : 'Add Employee')}
                    </Button>
                  </Modal.Footer>
                </FormikForm>
              )}
            </Formik>
          </Modal>

          {/* Personal Information Update Modal (Employee Only) */}
          <Modal show={showPersonalModal} onHide={() => setShowPersonalModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Update Personal Information</Modal.Title>
            </Modal.Header>
            <Formik
              initialValues={{
                phone: selectedEmployee?.Phone || '',
                email: selectedEmployee?.Email || '',
                address: selectedEmployee?.Address || ''
              }}
              validationSchema={PersonalInfoSchema}
              onSubmit={handlePersonalInfoSubmit}
              enableReinitialize
            >
              {({ isSubmitting, errors, touched }) => (
                <FormikForm>
                  <Modal.Body>
                    <Alert variant="info">
                      <strong>Note:</strong> You can only update your personal contact information (phone, email, address).
                    </Alert>

                    <Form.Group className="mb-3">
                      <Form.Label>Phone</Form.Label>
                      <Field
                        type="text"
                        name="phone"
                        className={`form-control ${errors.phone && touched.phone ? 'is-invalid' : ''}`}
                        placeholder="Enter phone number"
                      />
                      <ErrorMessage name="phone" component="div" className="invalid-feedback" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Field
                        type="email"
                        name="email"
                        className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                        placeholder="Enter email"
                      />
                      <ErrorMessage name="email" component="div" className="invalid-feedback" />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Address</Form.Label>
                      <Field
                        as="textarea"
                        name="address"
                        rows={3}
                        className={`form-control ${errors.address && touched.address ? 'is-invalid' : ''}`}
                        placeholder="Enter address"
                      />
                      <ErrorMessage name="address" component="div" className="invalid-feedback" />
                    </Form.Group>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPersonalModal(false)}>
                      Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Updating...' : 'Update Information'}
                    </Button>
                  </Modal.Footer>
                </FormikForm>
              )}
            </Formik>
          </Modal>
        </>
      )}
    </div>
  );
};

export default Employees;