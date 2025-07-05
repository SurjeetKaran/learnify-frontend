// lib/api.ts
import axios from 'axios';

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true, // send cookies if needed
});

// Attach Bearer token from localStorage
instance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Generic API wrapper
const api = {
  get: <T = any>(url: string, config?: any) =>
    instance.get<T>(url, config).then((res) => res.data),

  post: <T = any>(url: string, body: any, config?: any) =>
    instance.post<T>(url, body, config).then((res) => res.data),

  put: <T = any>(url: string, body: any, config?: any) =>
    instance.put<T>(url, body, config).then((res) => res.data),

  delete: <T = any>(url: string, config?: any) =>
    instance.delete<T>(url, config).then((res) => res.data),

  patch: <T = any>(url: string, body: any, config?: any) =>
    instance.patch<T>(url, body, config).then((res) => res.data),
};

export default api;

