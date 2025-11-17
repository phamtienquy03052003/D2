import React from "react";
import Header from "../admin/Header";
import Sidebar from "../admin/Sidebar";
import Footer from "../admin/Footer";

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">{children}</main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLayout;
