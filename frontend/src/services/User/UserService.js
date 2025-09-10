import axios from "axios";

// Determine API URL based on environment
const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }
  return import.meta.env.VITE_API_URL_PROD || 'https://rmtjob.com';
};

const API_BASE_URL = getApiBaseUrl();

// Set up axios defaults
axios.defaults.baseURL = API_BASE_URL;

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("API Error:", error.response?.data || error.message);
    if (error.response?.status === 401) {
      // Token might be expired
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

// User Management API calls
export const getAllUsersApi = async () => {
  try {
    console.log("🔍 Fetching all users from:", `${API_BASE_URL}/api/v1/admin/users`);
    const response = await axios.get("/api/v1/admin/users");
    console.log("✅ Users fetched successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error fetching users:", error.response?.data || error.message);
    throw error;
  }
};

export const getUserDetailsApi = async (userId) => {
  try {
    console.log("🔍 Fetching user details for:", userId);
    const response = await axios.get(`/api/v1/admin/users/${userId}`);
    console.log("✅ User details fetched successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error fetching user details:", error.response?.data || error.message);
    throw error;
  }
};

export const updateUserStatusApi = async (userId, status) => {
  try {
    console.log("🔄 Updating user status:", userId, "to", status);
    const response = await axios.patch(`/api/v1/admin/users/${userId}/status`, { status });
    console.log("✅ User status updated successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error updating user status:", error.response?.data || error.message);
    throw error;
  }
};

export const deleteUserApi = async (userId) => {
  try {
    console.log("🗑️ Deleting user:", userId);
    const response = await axios.delete(`/api/v1/admin/users/${userId}`);
    console.log("✅ User deleted successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error deleting user:", error.response?.data || error.message);
    throw error;
  }
};

export const getUserApplicationsApi = async (userId) => {
  try {
    console.log("🔍 Fetching user applications for:", userId);
    const response = await axios.get(`/api/v1/admin/users/${userId}/applications`);
    console.log("✅ User applications fetched successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error fetching user applications:", error.response?.data || error.message);
    throw error;
  }
};

export const updateApplicationStatusApi = async (applicationId, status) => {
  try {
    console.log("🔄 Updating application status:", applicationId, "to", status);
    const response = await axios.patch(`/api/v1/admin/applications/${applicationId}/status`, { status });
    console.log("✅ Application status updated successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error updating application status:", error.response?.data || error.message);
    throw error;
  }
};

export const getUserStatsApi = async () => {
  try {
    console.log("📊 Fetching user statistics");
    const response = await axios.get("/api/v1/admin/stats/users");
    console.log("✅ User stats fetched successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error fetching user stats:", error.response?.data || error.message);
    throw error;
  }
};

// General user profile APIs
export const getUserProfileApi = async () => {
  try {
    const response = await axios.get("/api/v1/auth/me");
    return response;
  } catch (error) {
    console.error("❌ Error fetching user profile:", error.response?.data || error.message);
    throw error;
  }
};

export const updateUserProfileApi = async (userData) => {
  try {
    const response = await axios.patch("/api/v1/auth/profile", userData);
    return response;
  } catch (error) {
    console.error("❌ Error updating user profile:", error.response?.data || error.message);
    throw error;
  }
};

export const changePasswordApi = async (passwordData) => {
  try {
    const response = await axios.patch("/api/v1/auth/change-password", passwordData);
    return response;
  } catch (error) {
    console.error("❌ Error changing password:", error.response?.data || error.message);
    throw error;
  }
};

export default {
  getAllUsersApi,
  getUserDetailsApi,
  updateUserStatusApi,
  deleteUserApi,
  getUserApplicationsApi,
  updateApplicationStatusApi,
  getUserStatsApi,
  getUserProfileApi,
  updateUserProfileApi,
  changePasswordApi,
};
