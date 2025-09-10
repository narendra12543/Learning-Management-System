import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;
const COURSE_API = `${API_URL}/api/v1/courses`;

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

// Error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", {
      status: error.response?.status,
      message: error.response?.data?.error || error.message,
      url: error.config?.url,
    });

    if (error.response?.status === 429) {
      console.warn("⚠️ Rate limit exceeded");
    }

    return Promise.reject(error);
  }
);

// ----------------------
// Admin APIs
// ----------------------
export const createCourseApi = async (formData, retryCount = 0) => {
  try {
    return await axiosInstance.post("/api/v1/courses/admin", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 2) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return createCourseApi(formData, retryCount + 1);
    }
    throw error;
  }
};

export const updateCourseApi = async (id, formData, retryCount = 0) => {
  try {
    return await axiosInstance.put(`/api/v1/courses/admin/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    });
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 2) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return updateCourseApi(id, formData, retryCount + 1);
    }
    throw error;
  }
};

export const deleteCourseApi = (id) =>
  axiosInstance.delete(`/api/v1/courses/admin/${id}`);

export const getAllCoursesAdminApi = async () => {
  return await axiosInstance.get("/api/v1/courses"); // Admin: includes drafts
};

// ----------------------
// Public APIs (Students)
// ----------------------
export const getCoursesApi = async (retryCount = 0) => {
  try {
    return await axiosInstance.get("/api/v1/courses/public"); // Students: only active
  } catch (error) {
    if (error.response?.status === 429 && retryCount < 2) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return getCoursesApi(retryCount + 1);
    }
    throw error;
  }
};

export const getCourseByIdApi = (id) =>
  axiosInstance.get(`/api/v1/courses/public/${id}`);

// ----------------------
// Resources
// ----------------------
export const addResourceApi = (id, formData) =>
  axiosInstance.post(`/api/v1/courses/admin/${id}/resources`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteResourceApi = (id, resourceId) =>
  axiosInstance.delete(`/api/v1/courses/admin/${id}/resources/${resourceId}`);

// ----------------------
// User APIs
// ----------------------
export const enrollInCourseApi = (id) =>
  axiosInstance.post(`/api/v1/courses/${id}/enroll`);

export const getEnrolledCoursesApi = () =>
  axiosInstance.get("/api/v1/courses/user/enrolled");

// My Courses (filter from public + user)
export const getMyCoursesApi = async () => {
  try {
    const allCoursesResponse = await axiosInstance.get("/api/v1/courses/public");
    const allCourses = allCoursesResponse.data || [];

    const userResponse = await axiosInstance.get("/api/v1/auth/me");
    const user = userResponse.data.user;

    const enrolledCourses = allCourses.filter((course) =>
      user.enrolledCourses?.includes(course._id)
    );

    return { data: enrolledCourses };
  } catch (error) {
    console.error("Error fetching enrolled courses:", error);
    throw error;
  }
};

// ----------------------
// Helpers
// ----------------------
export const getImageUrl = (thumbnailPath) => {
  if (!thumbnailPath) return null;

  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

  if (thumbnailPath.startsWith("http")) {
    return thumbnailPath;
  } else if (thumbnailPath.startsWith("/uploads")) {
    return `${baseUrl}${thumbnailPath}`;
  } else if (thumbnailPath.startsWith("uploads")) {
    return `${baseUrl}/${thumbnailPath}`;
  } else {
    return `${baseUrl}/uploads/${thumbnailPath}`;
  }
};

// Coupon helper (admin only)
export const getAllCoursesForCouponsApi = async () => {
  return await axiosInstance.get("/api/v1/courses"); // Admin
};
