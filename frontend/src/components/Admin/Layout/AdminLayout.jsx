import React, { useState } from "react";
import {
  Crown,
  Menu,
  X,
  LogOut,
  Moon,
  Sun,
  BookOpen,
  Users,
  BarChart3,
  Settings,
  Ticket,
  CreditCard,
} from "lucide-react";
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import { useTheme } from "../../../contexts/Theme/ThemeContext";
import { useAuth } from "../../../contexts/Auth/AuthContext";

const AdminLayout = ({ title = "Admin Dashboard" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/landing", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const isDarkMode = theme === "dark";

  const navigation = [
    { name: "Courses", href: "/admin/courses", icon: BookOpen },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Payment", href: "/admin/payment-management", icon: CreditCard },
    // { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div
      className={`min-h-screen flex ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64
        ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }
        border-r transition-transform duration-300 ease-in-out flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="relative mr-[-40px]">
              <img
                src="/assets/logo.png"
                alt="RemoteJobs Logo"
                className="h-[100px] object-contain"
                style={{
                  filter: theme === "dark" ? "brightness(0.9)" : "none",
                }}
              />
            </div>
            <h1 className="font-bold text-gray-900 dark:text-white">
              RemoteJobs
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              {user?.firstName?.charAt(0) || "A"}
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                Administrator
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
                  isActive
                    ? "bg-indigo-100 dark:bg-indigo-600 text-indigo-600 dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`
              }
            >
              <item.icon size={18} />
              {item.name} Management
            </NavLink>
          ))}
        </nav>

        {/* Dark Mode + Back to Dashboard + Logout */}
        <div className="p-4 border-t dark:border-gray-700 space-y-2">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-gray-700 dark:text-gray-300"
          >
            <Crown className="w-5 h-5" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </NavLink>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-gray-700 dark:text-gray-300"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-red-600 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 dark:text-red-400 w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header (Sticky) */}
        <header
          className={`px-6 py-4 border-b sticky top-0 z-40 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold dark:text-white">{title}</h2>
              <p className="text-sm text-gray-500 font-medium dark:text-gray-400">
                Manage your RemoteJobs platform
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Page Content (Scrollable) */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
