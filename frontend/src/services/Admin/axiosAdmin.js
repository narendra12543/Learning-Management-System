import axios from "axios";

const axiosAdmin = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api/v1", //point to backend API
});

//Add token automatically
axiosAdmin.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("adminToken"); // stored on login
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosAdmin;
