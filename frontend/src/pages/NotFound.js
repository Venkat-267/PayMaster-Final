import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen d-flex align-items-center justify-content-center bg-light">
      <div className="text-center p-5">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="lead mb-5">
          The page you are looking for might have been removed, had its name 
          changed, or is temporarily unavailable.
        </p>
        <Link to="/" className="btn btn-primary px-4 py-2">
          <HomeIcon size={18} className="me-2" />
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;