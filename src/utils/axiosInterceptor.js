import axios from "axios";

let interceptorSetup = false;

export const isSessionAuthenticationFailure = (error) => {
  const status = error.response?.status;
  const data = error.response?.data;
  if (status !== 401 && status !== 403) return false;
  // Optional endpoints may return authorization/section errors. Only the
  // authentication middleware's explicit session/token failures clear login.
  return data?.code === 'TOKEN_EXPIRED' || data?.code === 'SESSION_TIMEOUT' ||
    (status === 403 && data?.message === 'Invalid token');
};

export const setupAxiosInterceptor = (logoutFn) => {
  if (interceptorSetup) return; // Only setup once
  interceptorSetup = true;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (isSessionAuthenticationFailure(error)) {
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
