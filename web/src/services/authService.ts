import apiClient from "../api/apiClient";
import type { User } from "../types/User";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  message?: string;
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    name?: string;
    email?: string;
    avatar?: string;
  };
}

export interface RegisterPayload {
  registerToken?: string;
  name: string;
  password: string;
  phone?: string;
  gender?: string;
}

export interface RegisterResponse {
  user: User;
  message?: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface ResetPasswordPayload {
  token: string | null;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>("/auth/login", payload);
    return res.data;
  },

  async loginWithGoogle(token: string): Promise<LoginResponse> {
    const res = await apiClient.post<LoginResponse>("/auth/google", { token });
    return res.data;
  },

  async sendRegisterCode(email: string): Promise<{ message: string }> {
    const res = await apiClient.post<{ message: string }>("/auth/send-code", { email });
    return res.data;
  },

  async verifyRegisterCode(email: string, code: string): Promise<{ message: string; registerToken: string }> {
    const res = await apiClient.post<{ message: string; registerToken: string }>("/auth/verify-code", { email, code });
    return res.data;
  },

  async register(payload: RegisterPayload & { registerToken: string }): Promise<RegisterResponse> {
    const res = await apiClient.post<RegisterResponse>("/auth/register", payload);
    return res.data;
  },

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    const res = await apiClient.post<ForgotPasswordResponse>("/auth/forgotPassword", { email });
    return res.data;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<ResetPasswordResponse> {
    const res = await apiClient.post<ResetPasswordResponse>("/auth/resetPassword", payload);
    return res.data;
  },
};

