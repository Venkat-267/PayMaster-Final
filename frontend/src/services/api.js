import axios from "axios";

const api = axios.create({
  baseURL: "http://paymastervenkattrial.centralindia.azurecontainer.io/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear tokens and redirect to login
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Return error to be handled by the caller
    return Promise.reject(error);
  }
);

export default api;
