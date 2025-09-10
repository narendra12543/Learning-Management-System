import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../ui/tabs";
import CouponDashboard from "./CouponDashboard";
import CouponAnalytics from "./CouponAnalytics";
import { Ticket, BarChart3 } from "lucide-react";

const CouponManagement = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-100 dark:bg-gray-700 shadow-sm rounded-xl p-1">
            <TabsTrigger 
              value="dashboard" 
              className="flex items-center gap-2 rounded-lg transition-all duration-200"
            >
              <Ticket className="w-4 h-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="flex items-center gap-2 rounded-lg transition-all duration-200"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dashboard" className="mt-0">
          <CouponDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <CouponAnalytics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CouponManagement;
