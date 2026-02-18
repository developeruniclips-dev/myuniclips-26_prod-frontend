import axios from "axios";

let interceptorSetup = false;

export const setupAxiosInterceptor = (logoutFn) => {
  if (interceptorSetup) return; // Only setup once
  interceptorSetup = true;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Don't auto-logout on login attempts (they return 401 for wrong password)
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        if (!isLoginRequest) {
          console.warn("Session expired. Redirecting to home...");
          logoutFn();
          window.location.href = "/";
        }
      }
      return Promise.reject(error);
    }
  );
};
