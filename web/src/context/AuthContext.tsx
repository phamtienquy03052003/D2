
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { userService } from "../services/userService";
import { pointService } from "../services/pointService";
import type { User } from "../types/User";
import Login from "../components/user/Login";
import Register from "../components/user/Register";

import { socket } from "../socket";

type AuthMode = "none" | "login" | "register";

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
  handleSocketLogin: (token: string, userId: string) => void;

  
  authMode: AuthMode;
  openLogin: () => void;
  openRegister: () => void;
  closeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("none");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const formatUser = async (data: any): Promise<User> => {
    const resPoint = await pointService.getTotal();
    return {
      _id: data._id,
      email: data.email,
      name: data.name,
      avatar: data.avatar,
      googleId: data.googleId,
      role: data.role,
      isActive: data.isActive,
      isPrivate: data.isPrivate,
      phone: data.phone,
      gender: data.gender,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      totalPoints: resPoint?.totalPoints ?? 0,
      inventory: data.inventory,
      selectedNameTag: data.selectedNameTag,
      
    };
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await userService.getMe();
        const formattedUser = await formatUser(data);

        setUser(formattedUser);

        
        socket.auth = { token };
        socket.connect();
        socket.on("connect", () => {
          socket.emit("joinUser", formattedUser._id);
        });
      } catch (err) {
        console.error("Không load được user:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    return () => {
      socket.off("connect");
    };
  }, []);

  const refreshUser = async () => {
    try {
      const data = await userService.getMe();
      const formattedUser = await formatUser(data);
      setUser(formattedUser);
    } catch (err) {
      console.error("Lỗi refresh user:", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    socket.disconnect();
    navigate("/trang-chu");
  };

  const handleSocketLogin = (token: string, userId: string) => {
    socket.auth = { token };
    socket.connect();
    socket.on("connect", () => {
      socket.emit("joinUser", userId);
    });
  };

  
  const openLogin = () => setAuthMode("login");
  const openRegister = () => setAuthMode("register");
  const closeAuth = () => setAuthMode("none");

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        isAuthenticated: !!user,
        isLoading,
        refreshUser,
        handleSocketLogin,
        authMode,
        openLogin,
        openRegister,
        closeAuth,
      }}
    >
      {children}

      {}
      {authMode === "login" && <Login onClose={closeAuth} onSwitchToRegister={openRegister} />}
      {authMode === "register" && <Register onClose={closeAuth} onSwitchToLogin={openLogin} />}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
