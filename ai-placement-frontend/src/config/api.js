import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API Error]", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

export const fetchQuestions = async (params) => {
  const res = await api.post("/interview/questions", params);
  return res.data;
};

export const submitAnswers = async (payload) => {
  const res = await api.post("/interview/evaluate", payload);
  return res.data;
};

export const getReport = async (candidateId, sessionId) => {
  const res = await api.get(`/interview/analyze/${candidateId}`, {
    params: { sessionId },
  });
  return res.data;
};

export const codingAPI = {
  getQuestions: () => api.get("/questions/coding"),
  runCode: (code, language) => api.post("/code/run", { code, language }),
  submitCode: (code, language, testCases) =>
    api.post("/code/submit", { code, language, testCases }),
};

export const analyzeResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/resume/analyze-resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
