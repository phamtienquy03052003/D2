// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext } from "react";
import type { ReactNode } from "react";
import { io } from "socket.io-client";
import { userService } from "../services/userService";
import { pointService } from "../services/pointService";
import type { User } from "../types/User"; // <-- DÙNG USER CHUẨN

// Khởi tạo socket không tự connect
export const socket = io("http://localhost:8000", { autoConnect: false });

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
  handleSocketLogin: (token: string, userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

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
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      totalPoints: resPoint?.totalPoints ?? 0,
    };
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const data = await userService.getMe();
        const formattedUser = await formatUser(data);

        setUser(formattedUser);

        // socket
        socket.auth = { token };
        socket.connect();
        socket.on("connect", () => {
          socket.emit("joinUser", formattedUser._id);
        });
      } catch (err) {
        console.error("Không load được user:", err);
      }
    };

    loadUser();

    // Cleanup: remove event listener
    return () => {
      socket.off("connect");
      // Không return gì khác
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
  };

  const handleSocketLogin = (token: string, userId: string) => {
    socket.auth = { token };
    socket.connect();
    socket.on("connect", () => {
      socket.emit("joinUser", userId);
    });
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, logout, isAuthenticated: !!user, refreshUser, handleSocketLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
