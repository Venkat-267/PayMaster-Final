import axios from 'axios';

// Create axios instance with your API base URL
const api = axios.create({
  baseURL: 'http://paymastervenkattrial.centralindia.azurecontainer.io/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// Token expiry tracking
let tokenExpiryTimer = null;

// Function to set up auto logout timer
const setupAutoLogout = () => {
  // Clear existing timer
  if (tokenExpiryTimer) {
    clearTimeout(tokenExpiryTimer);
  }
  
  // Set timer for 30 minutes (1800000 ms)
  tokenExpiryTimer = setTimeout(() => {
    console.log('JWT token expired - logging out automatically');
    
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Show notification
    if (window.location.pathname !== '/login') {
      alert('Your session has expired. Please log in again.');
      window.location.href = '/login';
    }
  }, 30 * 60 * 1000); // 30 minutes
};

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    // If we get a successful response and have a token, reset the auto logout timer
    const token = localStorage.getItem('accessToken');
    if (token) {
      setupAutoLogout();
    }
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log('401 Unauthorized - token expired or invalid');
      
      // Clear tokens and redirect to login
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Clear auto logout timer
      if (tokenExpiryTimer) {
        clearTimeout(tokenExpiryTimer);
        tokenExpiryTimer = null;
      }
      
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        alert('Your session has expired. Please log in again.');
        window.location.href = '/login';
      }
    }
    
    // Return error to be handled by the caller
    return Promise.reject(error);
  }
);

// Export function to start auto logout timer (called after successful login)
export const startAutoLogoutTimer = () => {
  setupAutoLogout();
};

// Export function to clear auto logout timer (called on logout)
export const clearAutoLogoutTimer = () => {
  if (tokenExpiryTimer) {
    clearTimeout(tokenExpiryTimer);
    tokenExpiryTimer = null;
  }
};

export default api;