import React from "react";

interface TabProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Tab: React.FC<TabProps> = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex w-full mb-6">
    {tabs.map((tab) => (
      <button
        key={tab}
        className={`flex-1 py-2 text-lg font-semibold rounded-t-lg transition-colors duration-200
          ${activeTab === tab ? "bg-neutral-700 text-white" : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800"}`}
        onClick={() => onTabChange(tab)}
        type="button"
      >
        {tab}
      </button>
    ))}
  </div>
);

export default Tab;
