import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { DollarSign } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const LoginSchema = Yup.object().shape({
  userName: Yup.string().required("Username is required"),
  password: Yup.string().required("Password is required"),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      const success = await login({
        userName: values.userName,
        password: values.password,
      });

      if (success) {
        navigate("/dashboard");
      }
    } catch (error) {
      setFieldError("password", "Login failed. Please try again.");
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

        <h1 className="auth-form-title">Welcome Back</h1>
        <p className="auth-form-subtitle">Sign in to continue to PayMaster</p>

        <Formik
          initialValues={{ userName: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>
              <div className="mb-3">
                <label htmlFor="userName" className="form-label">
                  Username
                </label>
                <Field
                  type="text"
                  name="userName"
                  id="userName"
                  className={`form-control ${
                    errors.userName && touched.userName ? "is-invalid" : ""
                  }`}
                  placeholder="Enter your username"
                />
                <ErrorMessage
                  name="userName"
                  component="div"
                  className="invalid-feedback"
                />
              </div>

              <div className="mb-4">
                <label htmlFor="password" className="form-label">
                  Password
                </label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className={`form-control ${
                    errors.password && touched.password ? "is-invalid" : ""
                  }`}
                  placeholder="Enter your password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="invalid-feedback"
                />
              </div>

              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary py-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </button>
              </div>

              <div className="auth-switch">
                Don't have an account? <Link to="/register">Register here</Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;
