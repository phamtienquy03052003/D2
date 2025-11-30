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
    <div className="min-h-screen flex flex-col bg-white">
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

        <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-5 lg:ml-[calc(64px+16rem)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
