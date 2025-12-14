import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ChatProvider } from "./context/ChatContext";
import { LightboxProvider } from "./context/LightboxContext";
import ImageLightbox from "./components/common/ImageLightbox";
import AppRoutes from "./routes/AppRoutes";
import { Toaster, toast } from "react-hot-toast";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <NotificationProvider>
            <ChatProvider>
              <LightboxProvider>
                <AppRoutes />
                <ImageLightbox />
                <Toaster
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      duration: 3000,
                      iconTheme: {
                        primary: '#4ade80',
                        secondary: 'black',
                      },
                    },
                    error: {
                      duration: 4000,
                      iconTheme: {
                        primary: '#ef4444',
                        secondary: 'black',
                      },
                    },
                  }}
                >
                  {(t) => (
                    <div
                      style={{
                        opacity: t.visible ? 1 : 0,
                        background: 'white',
                        padding: '16px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                        color: '#1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        minWidth: '300px',
                        borderLeft: t.type === 'error' ? '4px solid #ef4444' : t.type === 'success' ? '4px solid #22c55e' : '4px solid #3b82f6',
                        transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
                        transition: 'all 0.2s ease-in-out',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        {typeof t.message === 'function' ? t.message(t) : t.message}
                      </div>
                      <button
                        onClick={() => toast.dismiss(t.id)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#9ca3af',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f3f4f6')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  )}
                </Toaster>
              </LightboxProvider>
            </ChatProvider>
          </NotificationProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
