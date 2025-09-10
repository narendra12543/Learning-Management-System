import React, { createContext, useState, useContext, useEffect } from "react";
import { adminSignIn, adminSignUp } from "../services/adminAuthService";

const AdminAuthContext = createContext();
export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("adminToken") || null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("adminToken", token);
    } else {
      localStorage.removeItem("adminToken");
    }
  }, [token]);

  const login = async (credentials) => {
    const data = await adminSignIn(credentials);
    setAdmin(data.admin);
    setToken(data.token);
    return data;
  };

  const signup = async (adminData) => {
    const data = await adminSignUp(adminData);
    setAdmin(data.admin);
    setToken(data.token);
    return data;
  };

  const logout = () => {
    setAdmin(null);
    setToken(null);
    localStorage.removeItem("adminToken");
  };

  return (
    <AdminAuthContext.Provider value={{ admin, token, login, signup, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};
   
