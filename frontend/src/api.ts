import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

api.interceptors.request.use(
  async (config) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await api.post(`/auth/login/refresh/`, { refresh: refreshToken });
          const newAccessToken = response.data.access;
          localStorage.setItem('accessToken', newAccessToken);
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        } else {
          // logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // redirect to login
        //   window.location.href = '/login';
        }
      } catch (refreshError) {
        // Handle refresh token failure (e.g., logout user)
        console.error('Failed to refresh token', refreshError);
        // console.log(refreshError.response.data);
        // logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // redirect to login
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;