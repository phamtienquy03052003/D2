import axios from "axios";
import toast from "react-hot-toast";
import { socket } from "../socket";
import { jwtDecode } from "jwt-decode";

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}


const BASE_URL = import.meta.env.VITE_API_URL;
// Remove trailing slash if exists
const CLEAN_BASE_URL = BASE_URL.replace(/\/+$/, "");
const API_URL = `${CLEAN_BASE_URL}/api`;

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

const refreshTokenLogic = async () => {
  return await navigator.locks.request("token-refresh", async () => {

    const currentToken = localStorage.getItem("accessToken");
    if (currentToken) {
      try {
        const decoded: any = jwtDecode(currentToken);
        if (decoded.exp * 1000 > Date.now()) {
          return currentToken;
        }
      } catch (e) {

      }
    }

    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("Missing refresh token");

    const res = await axios.post<RefreshResponse>(
      `${API_URL}/auth/refresh`,
      { refreshToken },
      { headers: { "Content-Type": "application/json" } }
    );

    const { accessToken, refreshToken: newRefreshToken } = res.data;

    localStorage.setItem("accessToken", accessToken);
    if (newRefreshToken) {
      localStorage.setItem("refreshToken", newRefreshToken);
    }

    socket.auth = { token: accessToken };
    socket.disconnect().connect();

    apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
    return accessToken;
  });
};

apiClient.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem("accessToken");

    if (token) {
      try {
        const decoded: any = jwtDecode(token);

        if (decoded.exp * 1000 < Date.now() + 10000) {
          try {
            token = await refreshTokenLogic();
          } catch (error) {
            console.error("Proactive refresh failed", error);


            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            window.location.href = "/trang-chu";
            return Promise.reject(error);
          }
        }
      } catch (error) {

      }
    }

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }


    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);





apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      (error.response?.status === 401 ||
        (error.response?.status === 403 && (error.response?.data?.message === "Invalid token" || error.response?.data?.message === "jwt expired"))) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (!refreshToken) {
        localStorage.removeItem("accessToken");
        window.location.href = "/trang-chu";
        return Promise.reject(error);
      }

      try {

        return await navigator.locks.request("token-refresh", async () => {

          const currentToken = localStorage.getItem("accessToken");
          if (currentToken && currentToken !== originalRequest.headers.Authorization?.split(" ")[1]) {
            originalRequest.headers.Authorization = `Bearer ${currentToken}`;
            return apiClient(originalRequest);
          }


          const refreshToken = localStorage.getItem("refreshToken");
          if (!refreshToken) throw new Error("Missing refresh token");

          const res = await axios.post<RefreshResponse>(
            `${API_URL}/auth/refresh`,
            { refreshToken },
            { headers: { "Content-Type": "application/json" } }
          );

          const { accessToken, refreshToken: newRefreshToken } = res.data;

          localStorage.setItem("accessToken", accessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }


          socket.auth = { token: accessToken };
          socket.disconnect().connect();

          apiClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;


          if (originalRequest.headers && typeof originalRequest.headers.set === 'function') {
            originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
          } else {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          }





          return apiClient(originalRequest);
        });

      } catch (refreshError) {
        console.error("Refresh token error:", refreshError);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/trang-chu";
        return Promise.reject(refreshError);
      }
    }


    const errorMessage = error.response?.data?.message || "Something went wrong";
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export default apiClient;
