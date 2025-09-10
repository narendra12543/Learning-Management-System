import axios from "axios";

// Determine API URL based on environment
const getApiBaseUrl = () => {
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return import.meta.env.VITE_API_URL || "http://localhost:5000";
  }
  return import.meta.env.VITE_API_URL_PROD || "https://rmtjob.com";
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token automatically to requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("User Profile API Error:", {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      url: error.config?.url,
    });

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth"; // redirect to login
    }

    return Promise.reject(error);
  }
);

/* ===============================
   USER PROFILE APIs
   =============================== */

// Get current user profile
export const getUserProfileApi = () => {
  return axiosInstance.get("/api/v1/auth/me");
};

// Update user profile details
export const updateUserProfileApi = (userData) => {
  return axiosInstance.patch("/api/v1/auth/profile", userData);
};

// Change password
export const changePasswordApi = (passwordData) => {
  return axiosInstance.put("/api/v1/auth/change-password", passwordData);
};

// Upload profile photo (FormData with "avatar" field)
export const uploadProfilePhotoApi = (formData) => {
  return axiosInstance.post("/api/v1/auth/upload-photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

// Export all in one object
export default {
  getUserProfileApi,
  updateUserProfileApi,
  changePasswordApi,
  uploadProfilePhotoApi,
};
