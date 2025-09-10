import React, { useState } from "react";
import { User, Lock, Ticket, Settings as SettingsIcon, ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

import Header from "../UserDashboard/Header";
import Sidebar from "../UserDashboard/Sidebar";

import ProfileSettings from "./ProfileSettings";
import PasswordSettings from "./PasswordSettings";
import AvailableCoupons from "./AvailableCoupons";

const UserSettings = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "password", label: "Password", icon: Lock },
    { id: "coupons", label: "Coupons", icon: Ticket },
  ];

  const currentTabIndex = tabs.findIndex((tab) => tab.id === activeTab);
  const isFirstTab = currentTabIndex === 0;
  const isLastTab = currentTabIndex === tabs.length - 1;

  const goToPreviousTab = () => {
    if (!isFirstTab) setActiveTab(tabs[currentTabIndex - 1].id);
  };

  const goToNextTab = () => {
    if (!isLastTab) setActiveTab(tabs[currentTabIndex + 1].id);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="hidden lg:block w-64 pt-16">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="w-64">
            <Sidebar onClose={() => setSidebarOpen(false)} />
          </div>
          <div
            className="flex-1 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden pt-16">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(true)} />

        {/* Scrollable Settings Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                      <SettingsIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        Account Settings
                      </h1>
                      <p className="text-green-100 text-lg">
                        Manage your profile, security, and preferences ⚙️
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="w-full">
              <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="grid w-full max-w-2xl grid-cols-3 bg-gray-100 dark:bg-gray-700 shadow-sm rounded-xl p-1">
                    {tabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                            activeTab === tab.id
                              ? "bg-green-600 text-white"
                              : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousTab}
                      disabled={isFirstTab}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="hidden sm:inline">Previous</span>
                    </button>
                    <button
                      onClick={goToNextTab}
                      disabled={isLastTab}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-xl">
                {activeTab === "profile" && <ProfileSettings />}
                {activeTab === "password" && <PasswordSettings />}
                {activeTab === "coupons" && <AvailableCoupons />}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserSettings;
