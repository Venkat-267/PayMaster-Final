import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { User, Mail, Phone, MapPin, Calendar, Save, Edit2 } from 'lucide-react';
import { Formik, Form as FormikForm, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import employeeService from '../services/employeeService';

const Profile = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const { getCurrentUser, getRoleName } = useAuth();
  
  const currentUser = getCurrentUser();

  const PersonalInfoSchema = Yup.object().shape({
    phone: Yup.string()
      .required('Phone is required')
      .matches(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number'),
    email: Yup.string()
      .email('Invalid email format')
      .required('Email is required'),
    address: Yup.string()
      .required('Address is required')
      .min(10, 'Address must be at least 10 characters')
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      // Get all employees and find current user's employee record
      const result = await employeeService.getAllEmployees();
      if (result.success) {
        const employees = result.data || [];
        const userEmployee = employees.find(emp => emp.UserId === currentUser.id);
        
        if (userEmployee) {
          setUserProfile(userEmployee);
        } else {
          // If no employee record found, create a basic profile from user data
          setUserProfile({
            FirstName: currentUser.userName,
            LastName: '',
            Email: currentUser.email || '',
            Phone: '',
            Address: '',
            Designation: getRoleName(currentUser.roleId),
            Department: 'Not Assigned',
            DateOfJoining: null
          });
        }
      } else {
        toast.error('Failed to fetch profile information');
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePersonalInfo = async (values, { setSubmitting }) => {
    try {
      const result = await employeeService.updatePersonalInfo({
        phone: values.phone,
        email: values.email,
        address: values.address
      });
      
      if (result.success) {
        toast.success('Personal information updated successfully');
        setEditMode(false);
        // Update local state
        setUserProfile(prev => ({
          ...prev,
          Phone: values.phone,
          Email: values.email,
          Address: values.address
        }));
      } else {
        toast.error(result.message || 'Failed to update personal information');
      }
    } catch (error) {
      toast.error('Failed to update personal information');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2 text-muted">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>My Profile</h2>
          <p className="text-muted mb-0">Manage your personal information and account details</p>
        </div>
        <Button 
          variant={editMode ? "outline-secondary" : "primary"}
          onClick={() => setEditMode(!editMode)}
        >
          {editMode ? (
            <>
              <User size={18} className="me-1" />
              Cancel
            </>
          ) : (
            <>
              <Edit2 size={18} className="me-1" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <Row>
        <Col lg={8}>
          {/* Personal Information Card */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <User size={20} className="me-2" />
                Personal Information
              </h5>
            </Card.Header>
            <Card.Body>
              {editMode ? (
                <Formik
                  initialValues={{
                    phone: userProfile?.Phone || '',
                    email: userProfile?.Email || '',
                    address: userProfile?.Address || ''
                  }}
                  validationSchema={PersonalInfoSchema}
                  onSubmit={handleUpdatePersonalInfo}
                  enableReinitialize
                >
                  {({ isSubmitting, errors, touched }) => (
                    <FormikForm>
                      <Alert variant="info" className="mb-4">
                        <strong>Note:</strong> You can only update your contact information (phone, email, address). 
                        Other details are managed by HR.
                      </Alert>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Phone Number</Form.Label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <Phone size={16} />
                              </span>
                              <Field
                                type="text"
                                name="phone"
                                className={`form-control ${errors.phone && touched.phone ? 'is-invalid' : ''}`}
                                placeholder="Enter your phone number"
                              />
                              <ErrorMessage name="phone" component="div" className="invalid-feedback" />
                            </div>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label>Email Address</Form.Label>
                            <div className="input-group">
                              <span className="input-group-text">
                                <Mail size={16} />
                              </span>
                              <Field
                                type="email"
                                name="email"
                                className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                                placeholder="Enter your email address"
                              />
                              <ErrorMessage name="email" component="div" className="invalid-feedback" />
                            </div>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-4">
                        <Form.Label>Address</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <MapPin size={16} />
                          </span>
                          <Field
                            as="textarea"
                            name="address"
                            rows={3}
                            className={`form-control ${errors.address && touched.address ? 'is-invalid' : ''}`}
                            placeholder="Enter your complete address"
                          />
                          <ErrorMessage name="address" component="div" className="invalid-feedback" />
                        </div>
                      </Form.Group>

                      <div className="d-flex gap-2">
                        <Button 
                          variant="success" 
                          type="submit" 
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <Save size={16} className="me-1" />
                              Save Changes
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setEditMode(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </FormikForm>
                  )}
                </Formik>
              ) : (
                <div>
                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-muted">First Name</label>
                        <div className="d-flex align-items-center">
                          <User size={16} className="text-muted me-2" />
                          <span className="fw-medium">{userProfile?.FirstName || 'Not Available'}</span>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-muted">Last Name</label>
                        <div className="d-flex align-items-center">
                          <User size={16} className="text-muted me-2" />
                          <span className="fw-medium">{userProfile?.LastName || 'Not Available'}</span>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-muted">Phone Number</label>
                        <div className="d-flex align-items-center">
                          <Phone size={16} className="text-muted me-2" />
                          <span className="fw-medium">{userProfile?.Phone || 'Not Available'}</span>
                        </div>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="mb-3">
                        <label className="form-label text-muted">Email Address</label>
                        <div className="d-flex align-items-center">
                          <Mail size={16} className="text-muted me-2" />
                          <span className="fw-medium">{userProfile?.Email || 'Not Available'}</span>
                        </div>
                      </div>
                    </Col>
                  </Row>

                  <div className="mb-3">
                    <label className="form-label text-muted">Address</label>
                    <div className="d-flex align-items-start">
                      <MapPin size={16} className="text-muted me-2 mt-1" />
                      <span className="fw-medium">{userProfile?.Address || 'Not Available'}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Employment Information Card */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <Calendar size={20} className="me-2" />
                Employment Information
              </h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="light" className="mb-4">
                <strong>Note:</strong> Employment details are managed by HR and cannot be modified here.
              </Alert>

              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Employee ID</label>
                    <div className="fw-medium">{userProfile?.EmployeeId || 'Not Assigned'}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Designation</label>
                    <div className="fw-medium">{userProfile?.Designation || 'Not Assigned'}</div>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Department</label>
                    <div className="fw-medium">{userProfile?.Department || 'Not Assigned'}</div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <label className="form-label text-muted">Date of Joining</label>
                    <div className="fw-medium">{formatDate(userProfile?.DateOfJoining)}</div>
                  </div>
                </Col>
              </Row>

              {userProfile?.ManagerId && (
                <div className="mb-3">
                  <label className="form-label text-muted">Manager</label>
                  <div className="fw-medium">Manager ID: {userProfile.ManagerId}</div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          {/* Account Information Card */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">
                <User size={20} className="me-2" />
                Account Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-4">
                <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center" 
                     style={{ width: '80px', height: '80px' }}>
                  <User size={40} className="text-primary" />
                </div>
                <h5 className="mt-3 mb-1">
                  {userProfile?.FirstName} {userProfile?.LastName}
                </h5>
                <p className="text-muted mb-0">{getRoleName(currentUser.roleId)}</p>
              </div>

              <div className="border-top pt-3">
                <div className="mb-3">
                  <label className="form-label text-muted">Username</label>
                  <div className="fw-medium">{currentUser.userName}</div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label text-muted">User ID</label>
                  <div className="fw-medium">{currentUser.id}</div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label text-muted">Role</label>
                  <div className="fw-medium">{getRoleName(currentUser.roleId)}</div>
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* Quick Actions Card */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-bottom">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button variant="outline-primary" href="/employee/timesheets">
                  <Calendar size={16} className="me-2" />
                  View My Timesheets
                </Button>
                <Button variant="outline-success" href="/employee/leave-requests">
                  <Calendar size={16} className="me-2" />
                  Manage Leave Requests
                </Button>
                <Button variant="outline-info" href="/employee/benefits">
                  <User size={16} className="me-2" />
                  View My Benefits
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Profile;