import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
