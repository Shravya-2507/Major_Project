import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // change when backend is deployed
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// 🔐 Attach token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 🚨 Global response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error.message ||
      "Something went wrong";

    console.error("API Error:", message);

    // optional: handle logout on 401
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
    }

    return Promise.reject(error);
  }
);

export default api;