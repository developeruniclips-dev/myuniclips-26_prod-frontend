import axios from "axios";

export const isSessionAuthenticationFailure = (error) => {
  const status = error.response?.status;
  const data = error.response?.data;
  if (status !== 401 && status !== 403) return false;
  // Optional endpoints may return authorization/section errors. Only the
  // authentication middleware's explicit session/token failures clear login.
  return data?.code === 'TOKEN_EXPIRED' || data?.code === 'SESSION_TIMEOUT' || data?.code === 'SESSION_REVOKED' ||
    (status === 403 && data?.message === 'Invalid token');
};

export const setupAxiosInterceptor = (clearSession, refreshSession, currentSession) => {
  const id = axios.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.config?.skipSessionHandling) return Promise.reject(error);
      if (isSessionAuthenticationFailure(error)) {
        // Don't auto-logout on login attempts (they return 401 for wrong password)
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        if (!isLoginRequest) {
          const config=error.config||{},method=(config.method||'get').toLowerCase();
          // Never replay uploads, payments or other writes automatically.
          if (['get','head'].includes(method) && !config.sessionRetried && refreshSession) {
            try {
              const current=currentSession?.(),previous=config.headers?.Authorization;
              const renewed=current?.token && previous && previous!==`Bearer ${current.token}` ? current :
                error.response?.data?.code==='TOKEN_EXPIRED' ? await refreshSession() : null;
              if(renewed){config.sessionRetried=true;config.headers={...config.headers,Authorization:`Bearer ${renewed.token}`};return axios(config);}
            } catch (failure) {
              if(failure.response?.status===401)clearSession();
              return Promise.reject(failure);
            }
          }
          if(error.response?.data?.code!=='TOKEN_EXPIRED'||!refreshSession)clearSession();
        }
      }
      return Promise.reject(error);
    }
  );
  return () => axios.interceptors.response.eject(id);
};
