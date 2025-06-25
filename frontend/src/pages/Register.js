import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Validation schema
const RegisterSchema = Yup.object().shape({
  userName: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: Yup.string()
    .required('Email is required')
    .email('Invalid email format'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  roleId: Yup.number()
    .required('Role is required')
});

// Function to calculate password strength
const calculatePasswordStrength = (password) => {
  if (!password) return { score: 0, text: '' };
  
  let score = 0;
  
  // Length check
  if (password.length >= 8) score += 1;
  
  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&]/.test(password)) score += 1;
  
  // Map score to strength
  const strengthMap = {
    0: { class: '', text: '' },
    1: { class: 'strength-weak', text: 'Weak' },
    2: { class: 'strength-fair', text: 'Fair' },
    3: { class: 'strength-good', text: 'Good' },
    4: { class: 'strength-strong', text: 'Strong' },
    5: { class: 'strength-strong', text: 'Very Strong' },
  };
  
  return { score, ...strengthMap[score] };
};

const Register = () => {
  const { register, ROLES } = useAuth();
  const navigate = useNavigate();
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, class: '', text: '' });
  
  const handlePasswordChange = (e, setFieldValue) => {
    const password = e.target.value;
    setFieldValue('password', password);
    setPasswordStrength(calculatePasswordStrength(password));
  };
  
  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const success = await register({
        userName: values.userName,
        email: values.email,
        password: values.password,
        roleId: values.roleId,
      });
      
      if (success) {
        navigate('/login');
      }
    } catch (error) {
      setFieldError('userName', 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="logo-container">
          <div className="app-logo">
            <DollarSign size={36} />
            <span>PayMaster</span>
          </div>
        </div>
        
        <h1 className="auth-form-title">Create an Account</h1>
        <p className="auth-form-subtitle">Register to get started with PayMaster</p>
        
        <Formik
          initialValues={{ 
            userName: '', 
            email: '', 
            password: '', 
            confirmPassword: '', 
            roleId: ROLES.EMPLOYEE.id 
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched, setFieldValue }) => (
            <Form>
              <div className="mb-3">
                <label htmlFor="userName" className="form-label">Username</label>
                <Field
                  type="text"
                  name="userName"
                  id="userName"
                  className={`form-control ${errors.userName && touched.userName ? 'is-invalid' : ''}`}
                  placeholder="Choose a username"
                />
                <ErrorMessage name="userName" component="div" className="invalid-feedback" />
              </div>
              
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className={`form-control ${errors.email && touched.email ? 'is-invalid' : ''}`}
                  placeholder="Enter your email"
                />
                <ErrorMessage name="email" component="div" className="invalid-feedback" />
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className={`form-control ${errors.password && touched.password ? 'is-invalid' : ''}`}
                  placeholder="Create a password"
                  onChange={(e) => handlePasswordChange(e, setFieldValue)}
                />
                <ErrorMessage name="password" component="div" className="invalid-feedback" />
                
                {/* Password strength indicator */}
                {passwordStrength.score > 0 && (
                  <>
                    <div className="password-strength mt-2">
                      <div className={`password-strength-meter ${passwordStrength.class}`}></div>
                    </div>
                    <div className="strength-text">
                      {passwordStrength.text}
                    </div>
                  </>
                )}
              </div>
              
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <Field
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  className={`form-control ${errors.confirmPassword && touched.confirmPassword ? 'is-invalid' : ''}`}
                  placeholder="Confirm your password"
                />
                <ErrorMessage name="confirmPassword" component="div" className="invalid-feedback" />
              </div>
              
              <div className="mb-4">
                <label htmlFor="roleId" className="form-label">Role</label>
                <Field
                  as="select"
                  name="roleId"
                  id="roleId"
                  className={`form-select ${errors.roleId && touched.roleId ? 'is-invalid' : ''}`}
                >
                  {Object.values(ROLES).map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </Field>
                <ErrorMessage name="roleId" component="div" className="invalid-feedback" />
              </div>
              
              <div className="d-grid">
                <button 
                  type="submit" 
                  className="btn btn-primary py-2" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Registering...' : 'Register'}
                </button>
              </div>
              
              <div className="auth-switch">
                Already have an account? <Link to="/login">Sign in</Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;