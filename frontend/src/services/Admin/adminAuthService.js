import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/api/v1/admin/auth`;

export const adminSignUp = async (data) => {
  const res = await axios.post(`${API_URL}/register`, data);
  return res.data;
};

export const adminSignIn = async (data) => {
  const res = await axios.post(`${API_URL}/login`, data);
  return res.data;
};

export const getAdminDashboard = async (token) => {
  const res = await axios.get(`${API_URL}/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};
