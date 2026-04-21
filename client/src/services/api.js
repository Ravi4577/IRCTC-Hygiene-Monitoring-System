import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || 'Something went wrong';
    const url     = error.config?.url || '';

    // ── Auth endpoints: NEVER auto-redirect or auto-toast ──
    // Login/register errors must be handled by the form itself.
    // If we redirect on 401 here, the login page loops forever.
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // ── 401 on protected endpoints: session expired → go to login ──
    if (status === 401) {
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // ── 400 validation errors: handled by forms, no toast ──
    if (status === 400) {
      return Promise.reject(error);
    }

    // ── All other errors: show toast ──
    toast.error(message);
    return Promise.reject(error);
  }
);

export default api;
