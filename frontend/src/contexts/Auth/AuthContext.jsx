import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const API_URL = import.meta.env.VITE_API_URL;

  // Set axios defaults
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  // Function to update user data (for role changes)
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  // Check auth status on mount and when token changes
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/v1/auth/me`);
        if (response.data && response.data.user) {
          setUser(response.data.user);
          // Update user if role has changed
          if (user && user.role !== response.data.user.role) {
            console.log("User role updated:", response.data.user.role);
            toast.success(
              `Your account has been updated to ${response.data.user.role} access!`
            );
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Only clear auth if token is actually invalid
        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
          delete axios.defaults.headers.common["Authorization"];
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]); // Re-run when token changes

  // Periodic check for user updates (including role changes)
  useEffect(() => {
    if (!token || !user) return;

    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`${API_URL}/api/v1/auth/me`);
        if (response.data && response.data.user) {
          const updatedUser = response.data.user;
          // Check if role has changed
          if (user.role !== updatedUser.role) {
            console.log(
              "Role change detected:",
              user.role,
              "->",
              updatedUser.role
            );
            setUser(updatedUser);
            toast.success(
              `Your account has been updated to ${updatedUser.role} access!`
            );
          } else {
            setUser(updatedUser);
          }
        }
      } catch (error) {
        // Silently handle errors for periodic checks
        if (error.response?.status === 401) {
          logout();
        }
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [user, token]);

  const login = async (email, password, userFromOAuth, tokenFromOAuth, isOtpLogin = false) => {
    try {
      // Handle Google OAuth login (when called with user object and token)
      if (userFromOAuth && typeof userFromOAuth === "object" && tokenFromOAuth) {
        const userData = userFromOAuth;
        const token = tokenFromOAuth;

        console.log("🔐 OAuth Login - Setting user and token", {
          userId: userData._id,
          email: userData.email,
          role: userData.role
        });

        setToken(token);
        setUser(userData);
        localStorage.setItem("token", token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        return { token, user: userData };
      }

      // Handle regular email/password login
      const recaptchaToken = userFromOAuth;
      const response = await axios.post(
        `${API_URL}/api/v1/auth/login`,
        { 
          email, 
          password,
          recaptchaToken,
          isOtpLogin
        }
      );
      const { token: newToken, user: userData } = response.data;

      setToken(newToken);
      setUser(userData);
      localStorage.setItem("token", newToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      return response.data;
    } catch (error) {
      // Re-throw the error with proper structure for suspended accounts
      if (error.response?.data?.accountSuspended) {
        const suspendedError = new Error(error.response.data.error);
        suspendedError.response = error.response;
        throw suspendedError;
      }
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/auth/signup`,
        userData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      delete axios.defaults.headers.common["Authorization"];
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/auth/forgot-password`,
        { email }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/v1/auth/reset-password`,
        {
          token,
          password,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    token,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export default AuthContext;


