import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/Auth/AuthContext";
import {
  BookOpen,
  GraduationCap,
  Settings,
  LogOut,
  X,
  Flame,
} from "lucide-react";

function Sidebar({ onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/landing");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleNavClick = (item) => {
    onClose && onClose();
    navigate(item.to);
  };

  // Menu items with settings added
  const menuItems = [
    {
      icon: <BookOpen size={20} />,
      text: "Dashboard",
      to: "/dashboard",
      active: location.pathname === "/dashboard",
      color: "text-green-500",
    },
    {
      icon: <GraduationCap size={20} />,
      text: "My Courses",
      to: "/my-courses",
      active: location.pathname === "/my-courses",
      count: user?.enrolledCourses?.length || 0,
      color: "text-emerald-500",
    },
    {
      icon: <Settings size={20} />,
      text: "Settings",
      to: "/settings",
      active: location.pathname === "/settings",
      color: "text-green-500",
    },
    {
      icon: <BookOpen size={20} />,
      text: "Payments",
      to: "/payment-history",
      active: location.pathname === "/payment-history",
      color: "text-blue-500",
    },
  ];

  return (
    <aside className="w-full h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl py-2 sm:py-4 lg:py-6 px-4 sm:px-6 shadow-lg overflow-y-auto scrollbar-hide border-r border-green-200/50 dark:border-gray-700/50">
      {/* Mobile Close Button */}
      <div className="lg:hidden flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">
          Menu
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-green-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      {/* Simplified Profile Section */}
      <div className="text-center mb-6 lg:mb-8 p-4 bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl border border-green-200/50 dark:border-gray-600/50 shadow-lg">
        <div className="w-14 h-14 mx-auto mb-3 relative">
          {user?.avatar ? (
            <img
              src={`${import.meta.env.VITE_API_URL}${user.avatar}`}
              alt="Profile"
              className="w-full h-full rounded-full border-2 border-green-200 dark:border-green-400 object-cover shadow-lg"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-full border-2 border-green-200 dark:border-green-400 shadow-lg flex items-center justify-center text-white font-bold text-lg">
              {user?.firstName?.charAt(0) || "S"}
            </div>
          )}

          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full border-2 border-white shadow-lg flex items-center justify-center">
            <Flame className="w-3 h-3 text-white" />
          </div>
        </div>

        <h2 className="text-sm font-bold text-gray-800 dark:text-white mb-1">
          {user ? `${user.firstName} ${user.lastName}` : "Student"}
        </h2>

        {/* Simplified Stats */}
        <div className="flex justify-center gap-3 mb-3">
          <div className="text-center">
            <div className="text-green-600 dark:text-green-400 font-bold text-base">
              {user?.enrolledCourses?.length || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Enrolled
            </div>
          </div>
          <div className="text-center">
            <div className="text-emerald-600 dark:text-emerald-400 font-bold text-base">
              {user?.completedCourses?.length || 0}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Completed
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg px-3 py-1 text-xs font-semibold shadow-lg">
          <span className="capitalize">
            {user?.role === "admin" ? "Administrator" : "Student"}
          </span>
        </div>
      </div>

      {/* Simplified Navigation Menu */}
      <nav className="flex flex-col gap-2 mb-4">
        {menuItems.map((item, index) => (
          <button
            key={index}
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium group hover:scale-105 active:scale-95 shadow-sm ${
              item.active
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105"
                : "text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 hover:text-green-600 dark:hover:text-green-400"
            }`}
            onClick={() => handleNavClick(item)}
          >
            <div className="flex items-center gap-3">
              <span
                className={`transition-transform group-hover:scale-110 ${
                  item.active ? "text-white" : item.color
                }`}
              >
                {item.icon}
              </span>
              <span>{item.text}</span>
            </div>
            {item.count !== undefined && item.count > 0 && (
              <span
                className={`text-xs px-2 py-1 rounded-full font-bold ${
                  item.active
                    ? "bg-white/20 text-white"
                    : "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-4 border-t border-green-200/50 dark:border-gray-700/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full group"
        >
          <LogOut
            size={18}
            className="group-hover:scale-110 transition-transform"
          />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
