import axios from "axios";
import toast from "react-hot-toast";

// Determine API URL based on environment
const getApiBaseUrl = () => {
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }
  return import.meta.env.VITE_API_URL_PROD || 'https://rmtjob.com';
};

const API_URL = getApiBaseUrl();

// Create a dedicated axios instance for uploads
const uploadAxios = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds timeout for uploads
});

// Add request interceptor to include auth token
uploadAxios.interceptors.request.use(
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

class UploadService {
  // Get current token from localStorage
  getToken() {
    return localStorage.getItem("token");
  }

  // Generic upload function with progress tracking
  async uploadFile(endpoint, file, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await uploadAxios.post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error("Upload error:", error);
      
      if (error.response?.status === 401) {
        toast.error("Authentication failed. Please login again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
      } else {
        toast.error(error.response?.data?.message || "Failed to upload file");
      }
      throw error;
    }
  }

  // Profile photo upload
  async uploadProfilePhoto(file, onProgress = null) {
    return await this.uploadFile(
      "/api/v1/upload/profile/photo",
      file,
      onProgress
    );
  }

  // Course content upload
  async uploadCourseContent(file, metadata, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      if (metadata.courseId) formData.append("courseId", metadata.courseId);
      if (metadata.lessonId) formData.append("lessonId", metadata.lessonId);
      if (metadata.contentType) formData.append("contentType", metadata.contentType);

      const response = await uploadAxios.post("/api/v1/upload/course/content", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error("Course content upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload course content");
      throw error;
    }
  }

  // Assignment upload
  async uploadAssignment(file, metadata, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      if (metadata.assignmentId) formData.append("assignmentId", metadata.assignmentId);
      if (metadata.courseId) formData.append("courseId", metadata.courseId);

      const response = await uploadAxios.post("/api/v1/upload/assignment/submission", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error("Assignment upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload assignment");
      throw error;
    }
  }

  // Certificate upload
  async uploadCertificate(file, metadata, onProgress = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      if (metadata.courseId) formData.append("courseId", metadata.courseId);
      if (metadata.certificateType) formData.append("certificateType", metadata.certificateType);

      const response = await uploadAxios.post("/api/v1/upload/certificate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(progress);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error("Certificate upload error:", error);
      toast.error(error.response?.data?.message || "Failed to upload certificate");
      throw error;
    }
  }

  // Delete file
  async deleteFile(filePath) {
    try {
      const response = await uploadAxios.delete("/api/v1/upload/file", {
        data: { filePath },
      });

      return response.data;
    } catch (error) {
      console.error("Delete file error:", error);
      toast.error("Failed to delete file");
      throw error;
    }
  }

  // Get storage stats
  async getStorageStats() {
    try {
      const response = await uploadAxios.get("/api/v1/upload/storage/stats");
      return response.data;
    } catch (error) {
      console.error("Get storage stats error:", error);
      throw error;
    }
  }

  // Get file URL for preview
  getFileUrl(filePath) {
    return `${API_URL}/uploads/${filePath}`;
  }

  // Create preview URL for images/videos
  createPreviewUrl(file) {
    return URL.createObjectURL(file);
  }

  // Revoke preview URL to free memory
  revokePreviewUrl(url) {
    if (url && url.startsWith("blob:")) {
      try {
        URL.revokeObjectURL(url);
      } catch (error) {
        console.warn("Error revoking blob URL:", error);
      }
    }
  }
}

export default new UploadService();
