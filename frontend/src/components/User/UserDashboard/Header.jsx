import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  User,
  Sun,
  Moon,
  Settings,
  LogOut,
  Menu,
  ChevronDown,
  GraduationCap,
  Shield,
  Home,
} from "lucide-react";
import { useAuth } from "../../../contexts/Auth/AuthContext";
import { useTheme } from "../../../contexts/Theme/ThemeContext";

function Header({ onMenuClick }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications] = useState(3);

  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/landing");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/landing");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-green-200/50 dark:border-green-700/50 px-4 sm:px-6 lg:px-8 shadow-lg h-16 flex items-center">
      <div className="flex items-center justify-between w-full max-w-full mx-auto h-16">
        {/* Left Side: Menu, Logo */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-green-50 dark:hover:bg-gray-800 focus:outline-none transition-all hover:scale-110"
          >
            <Menu size={24} />
          </button>

          <Link
            to="/dashboard"
            className="flex items-center gap-2 sm:gap-3 text-lg lg:text-xl font-bold group"
          >
            <div className="relative">
              <img
                src="/assets/logo.png"
                alt="RemoteJobs Logo"
                className="h-[100px] object-contain"
                style={{
                  filter: theme === "dark" ? "brightness(0.9)" : "none",
                }}
              />
            </div>
            <span className="hidden ml-[-40px] sm:block font-extrabold tracking-tight bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              RemoteJobs
            </span>
          </Link>
        </div>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="flex items-center bg-green-50/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl px-4 py-2 gap-3 border border-green-200/50 dark:border-gray-700 w-full">
            <Search size={18} className="text-green-500 dark:text-green-400" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full border-none p-0 bg-transparent text-gray-700 dark:text-gray-300 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Home Button (desktop) */}
          <button
            onClick={() => navigate("/dashboard")}
            className="hidden md:flex items-center gap-2 px-4 py-2 text-green-600 font-medium transition-all hover:scale-105"
          >
            <Home size={18} />
            <span>Home</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-green-50 dark:hover:bg-gray-800 transition-all hover:scale-110"
          >
            {theme === "dark" ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} className="text-green-600" />
            )}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button className="p-2 rounded-xl hover:bg-green-50 dark:hover:bg-green-800 transition-all hover:scale-110 relative">
              <Bell size={20} className="text-gray-600 dark:text-gray-300" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {notifications}
                </span>
              )}
            </button>
          </div>

          {/* User Avatar with Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-2 rounded-xl hover:bg-green-50 dark:hover:bg-gray-800 transition-all hover:scale-105"
            >
              <div className="w-8 h-8 overflow-hidden rounded-full border-2 border-green-200 dark:border-green-400 shadow-lg">
                {user?.avatar ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${user.avatar}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                    {user?.firstName?.charAt(0) || "S"}
                  </div>
                )}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {user?.firstName || "Student"}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 capitalize">
                  {user?.role === "admin" ? "Admin" : "User"}
                </div>
              </div>
              <ChevronDown
                size={16}
                className="text-gray-500 dark:text-gray-400"
              />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-xl border border-green-200/50 dark:border-gray-700 py-2 z-50">
                {/* User Info */}
                <div className="px-4 py-3 border-b border-green-100 dark:border-gray-700 flex items-center gap-3">
                  {user?.avatar ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL}${user.avatar}`}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border border-green-200 dark:border-gray-600"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white font-bold">
                      {user?.firstName?.charAt(0) || "U"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                    {user?.role === "admin" && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full">
                        Administrator
                      </span>
                    )}
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  {/* Home (mobile dropdown) */}
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300  transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Home size={16} />
                    <span>Home</span>
                  </Link>

                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </Link>

                  <Link
                    to="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings size={16} />
                    <span>Settings</span>
                  </Link>

                  {/* Admin Panel Access */}
                  {user?.role === "admin" && (
                    <>
                      <div className="border-t border-green-100 dark:border-gray-700 my-2"></div>
                      <Link
                        to="/admin/courses"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Shield size={16} />
                        <span>Admin Panel</span>
                      </Link>
                    </>
                  )}
                </div>

                {/* Logout */}
                <div className="border-t border-green-100 dark:border-gray-700 pt-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
