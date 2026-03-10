import React from "react";

interface TabProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Tab: React.FC<TabProps> = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex w-full rounded-lg bg-neutral-900/60 p-1">
    {tabs.map((tab) => (
      <button
        key={tab}
        className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-colors duration-200
          ${activeTab === tab ? "bg-neutral-700 text-white shadow" : "text-neutral-400 hover:text-white hover:bg-neutral-700/50"}`}
        onClick={() => onTabChange(tab)}
        type="button"
      >
        {tab}
      </button>
    ))}
  </div>
);

export default Tab;
