import React, { useState } from "react";
import Header from "./components/user/Header";
import Sidebar from "./components/user/Sidebar";

interface Props {
  children: React.ReactNode;
  activeMenuItem?: string;
}

const UserLayout: React.FC<Props> = ({ children, activeMenuItem = "" }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeItem={activeMenuItem}
          onItemClick={() => {}}
        />

        <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-5 lg:ml-[calc(128px+16rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
