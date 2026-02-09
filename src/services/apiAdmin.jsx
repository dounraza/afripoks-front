import axios from "axios";

const apiAdmin = axios.create({
  baseURL: process.env.REACT_APP_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiAdmin.interceptors.request.use(
  async (config) => {
    const accessToken = sessionStorage.getItem("accessTokenAdmin");

    if (accessToken) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiAdmin.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
        const newAccessToken = response.data.accessToken;
        sessionStorage.setItem("accessTokenAdmin", newAccessToken);

        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return apiAdmin(originalRequest);
      } catch (refreshError) {
        sessionStorage.removeItem("accessTokenAdmin");
        window.location.href = "/login/admin";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default apiAdmin;
