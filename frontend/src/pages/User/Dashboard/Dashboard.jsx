import React, { useState } from "react";
import Header from "../../../components/User/UserDashboard/Header";
import Sidebar from "../../../components/User/UserDashboard/Sidebar";
import MainContent from "../../../components/User/UserDashboard/MainContent";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/30 via-white to-emerald-100/30 dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-300">
      {/* Header */}
      <Header onMenuClick={handleMenuClick} />
      
      <div className="flex pt-16 h-screen">
        {/* Enhanced Sidebar */}
        <div className={`
          fixed inset-y-0 left-0 z-40 w-64 transform transition-all duration-300 ease-in-out  
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:inset-0 lg:w-64 lg:flex lg:flex-col
        `}>
          <Sidebar onClose={handleSidebarClose} />
        </div>

        {/* Enhanced Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity duration-300"
            onClick={handleSidebarClose}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0 overflow-y-auto h-[calc(100vh-4rem)] scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
          <MainContent />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
