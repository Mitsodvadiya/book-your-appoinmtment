import axios from 'axios';
import { useAuthStore } from './auth-store';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken, setAuthData, logout } = useAuthStore.getState();

        // For owners, refreshToken will be in cookie (handled by browser)
        // For patients, refreshToken will be in memory (passed here)
        const response = await axios.post('http://localhost:5000/api/v1/auth/refresh', 
          { refreshToken: refreshToken || undefined },
          { withCredentials: true }
        );
        
        const { accessToken: newAccessToken, refreshToken: newRefreshToken, user } = response.data.data;

        setAuthData(user || useAuthStore.getState().user, newAccessToken, newRefreshToken, user?.clinic);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
