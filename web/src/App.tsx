import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ChatProvider } from "./context/ChatContext";
import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
