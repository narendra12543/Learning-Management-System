import axios from "axios";

// Determine API URL based on environment
const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }
  return import.meta.env.VITE_API_URL_PROD || 'https://rmtjob.com';
};

const API_URL = getApiBaseUrl();

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
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
    console.error("Coupon API Error:", {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      url: error.config?.url,
    });
    return Promise.reject(error);
  }
);

// Admin Coupon Management
export const createCouponApi = (couponData) => 
  axiosInstance.post("/api/v1/coupons/admin", couponData);

export const getCouponsApi = () => 
  axiosInstance.get("/api/v1/coupons/admin");

export const getCouponByIdApi = (id) => 
  axiosInstance.get(`/api/v1/coupons/admin/${id}`);

export const updateCouponApi = (id, couponData) => 
  axiosInstance.put(`/api/v1/coupons/admin/${id}`, couponData);

export const deleteCouponApi = (id) => 
  axiosInstance.delete(`/api/v1/coupons/admin/${id}`);

export const getCouponAnalyticsApi = (period = "3months") => 
  axiosInstance.get(`/api/v1/coupons/admin/analytics?period=${period}`);

// User Coupon Usage
export const getApplicableCouponsApi = (courseId) => {
  console.log("🎫 Fetching coupons for course:", courseId);
  return axiosInstance.get(`/api/v1/coupons/course/${courseId}`);
};

export const applyCouponApi = (couponData) => 
  axiosInstance.post("/api/v1/coupons/apply", couponData);

// Get available coupons for user (for settings page)
export const getAvailableCouponsApi = () => {
  console.log("🎫 Service: Fetching all available coupons for user");
  console.log("🎫 Service: API URL:", `${API_URL}/api/v1/coupons/available`);
  return axiosInstance.get("/api/v1/coupons/available");
};

// Helper function to format coupon applicability text
export const formatCouponApplicability = (coupon) => {
  // Check if it's a universal coupon
  if (coupon.isUniversal || !coupon.courseNames || coupon.courseNames.length === 0) {
    return "Valid for all courses";
  }
  
  // Handle single course
  if (coupon.courseNames.length === 1) {
    return `Valid for: ${coupon.courseNames[0]}`;
  }
  
  // Handle multiple courses (show first 2 and count)
  if (coupon.courseNames.length <= 2) {
    return `Valid for: ${coupon.courseNames.join(', ')}`;
  }
  
  return `Valid for: ${coupon.courseNames[0]}, ${coupon.courseNames[1]} and ${coupon.courseNames.length - 2} more`;
};

// Helper function to format discount display
export const formatDiscountValue = (coupon) => {
  if (coupon.discountType === "percentage") {
    return `${coupon.discountValue}% OFF`;
  } else {
    return `₹${coupon.discountValue} OFF`;
  }
};

// Helper function to format expiry date
export const formatExpiryDate = (expiryDate) => {
  const date = new Date(expiryDate);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return "Expired";
  } else if (diffDays === 0) {
    return "Expires today";
  } else if (diffDays === 1) {
    return "Expires tomorrow";
  } else if (diffDays <= 7) {
    return `Expires in ${diffDays} days`;
  } else {
    return `Expires on ${date.toLocaleDateString()}`;
  }
};
