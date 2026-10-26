import React, { useState } from "react";
import { LuKeyRound } from "react-icons/lu";
import { BsFillAwardFill, BsBarChartLine } from "react-icons/bs";
import ChangePassword from "./settingstabs/ChangePassword";
import ManageBarristers from "./settingstabs/ManageBarristers";
import { useUser } from "../../hooks/useUser";

interface TabsCategory {
  label: string;
  icon: React.ElementType;
}

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Password");
  const { role } = useUser();

  const isAdmin = role?.toLowerCase() === "admin";

  const tabs: TabsCategory[] = [
    { label: "Password", icon: LuKeyRound },
    ...(isAdmin
      ? [
          { label: "Barristers", icon: BsFillAwardFill },
        ]
      : []),
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Password":
        return <ChangePassword />;
      case "Barristers":
        return <ManageBarristers />;
      default:
        return null;
    }
  };

  return (
    <div className="relative">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your account credentials and system preferences
        </p>
      </div>

      <div className="flex flex-col items-start md:flex-row min-h-[72vh] md:h-auto gap-4 md:gap-0 md:space-x-4">
        {/* Sidebar Tabs */}
        <div className="flex flex-col border border-primary/20 rounded-xl bg-secondary h-auto w-full md:w-1/4 lg:w-1/5 shrink-0 gap-1 p-3">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 mb-1">
            Categories
          </h2>
          <div className="flex flex-row overflow-x-auto pb-2 md:pb-0 md:flex-col gap-1.5 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.label;
              return (
                <button
                  type="button"
                  key={tab.label}
                  onClick={() => setActiveTab(tab.label)}
                  className={`flex text-xs font-medium items-center gap-2.5 rounded-lg border px-3 h-10 whitespace-nowrap shrink-0 md:shrink transition duration-200 cursor-pointer ${
                    isActive
                      ? "bg-white border-primary/20 text-primary shadow-xs font-semibold"
                      : "border-transparent text-gray-700 hover:bg-white/60 hover:text-primary"
                  }`}
                >
                  <Icon
                    size={14}
                    className={isActive ? "text-primary" : "text-gray-500"}
                  />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content */}
        <div className="border-t md:border-t-0 md:border-s border-primary/10 pt-4 md:pt-0 md:ps-6 ps-0 flex-1 w-full md:w-[75%] min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
