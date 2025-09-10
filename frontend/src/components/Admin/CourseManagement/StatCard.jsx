import React from "react";

const StatCard = ({ label, value, icon: Icon, color }) => {
  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow flex items-center gap-4">
      <div className={`p-3 rounded-full ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <h4 className="text-xl font-bold">{value}</h4>
      </div>
    </div>
  );
};

export default StatCard;
