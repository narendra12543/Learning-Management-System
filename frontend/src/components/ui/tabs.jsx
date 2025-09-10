import React, { createContext, useContext, useState } from "react";

const TabsContext = createContext();

const Tabs = ({ value, onValueChange, children, className = "" }) => {
  const [activeTab, setActiveTab] = useState(value);

  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <TabsContext.Provider value={{ activeTab, onTabChange: handleTabChange }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

const TabsList = ({ children, className = "" }) => {
  return (
    <div className={`flex ${className}`}>
      {children}
    </div>
  );
};

const TabsTrigger = ({ value, children, className = "" }) => {
  const { activeTab, onTabChange } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => onTabChange(value)}
      className={`px-4 py-2 transition-all duration-200 ${className} ${
        isActive ? "text-purple-600 border-b-2 border-purple-600" : "text-gray-600 hover:text-gray-800"
      }`}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ value, children, className = "" }) => {
  const { activeTab } = useContext(TabsContext);
  
  if (activeTab !== value) {
    return null;
  }

  return (
    <div className={className}>
      {children}
    </div>
  );
};

// Export as named exports
export { Tabs, TabsList, TabsTrigger, TabsContent };
