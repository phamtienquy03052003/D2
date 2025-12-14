import React, { useState } from "react";
import Header from "./components/user/Header";
import Sidebar from "./components/user/Sidebar";
import ModSidebar from "./components/user/ModSidebar";

interface Props {
  children: React.ReactNode;
  activeMenuItem?: string;
  variant?: "user" | "mod";
  communityId?: string | null;
}

const UserLayout: React.FC<Props> = ({
  children,
  activeMenuItem = "",
  variant = "user",
  communityId
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0f1117] text-gray-900 dark:text-white transition-colors duration-200">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1">
        {variant === "user" ? (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            activeItem={activeMenuItem}
            onItemClick={() => { }}
          />
        ) : (
          <ModSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            activeItem={activeMenuItem}
            communityId={communityId}
          />
        )}

        <div className="flex-1 lg:ml-50 min-w-0">
          <div className="max-w-6xl mx-auto w-full px-4 py-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
