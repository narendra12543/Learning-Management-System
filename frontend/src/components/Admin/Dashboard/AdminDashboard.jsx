// src/components/Admin/Dashboard/AdminDashboard.jsx
import React, { useState } from "react";
import { useAuth } from "../../../contexts/Auth/AuthContext";
import { useTheme } from "../../../contexts/Theme/ThemeContext";
import AdminPaymentManagement from "../PaymentManagement/AdminPaymentManagement";

const AdminDashboard = () => {
  const { user: admin, logout } = useAuth();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState("overview");

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Total Revenue</h3>
        <p className="text-2xl font-bold text-green-600">₹0</p>
        <p className="text-sm text-gray-500">This month</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Active Courses</h3>
        <p className="text-2xl font-bold text-blue-600">0</p>
        <p className="text-sm text-gray-500">Currently running</p>
      </div>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-2">Pending Requests</h3>
        <p className="text-2xl font-bold text-yellow-600">0</p>
        <p className="text-sm text-gray-500">Refunds & Deferrals</p>
      </div>
    </div>
  );

  return (
    <div
      className={`min-h-screen py-8 px-4 sm:px-8 transition-colors duration-300 ${
        theme === "dark"
          ? "bg-gray-900 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Welcome, {admin?.firstName || "Admin"} 🎉
        </h1>
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </div>

      <div className="mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveSection("overview")}
            className={`px-4 py-2 rounded-lg ${
              activeSection === "overview"
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveSection("payments")}
            className={`px-4 py-2 rounded-lg ${
              activeSection === "payments"
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Payment Management
          </button>
          <button
            onClick={() => setActiveSection("courses")}
            className={`px-4 py-2 rounded-lg ${
              activeSection === "courses"
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            Course Management
          </button>
          <button
            onClick={() => setActiveSection("users")}
            className={`px-4 py-2 rounded-lg ${
              activeSection === "users"
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
          >
            User Management
          </button>
        </div>
      </div>

      {activeSection === "overview" && renderOverview()}
      {activeSection === "payments" && <AdminPaymentManagement />}
      {activeSection === "courses" && (
        <div className="text-center py-8">
          <p>Course Management component will be integrated here.</p>
        </div>
      )}
      {activeSection === "users" && (
        <div className="text-center py-8">
          <p>User Management component will be integrated here.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
