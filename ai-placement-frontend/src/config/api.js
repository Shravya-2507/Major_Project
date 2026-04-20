import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("[API Error]", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

// ============================
// Interview API Functions
// ============================
export const fetchQuestions = async (params) => {
  try {
    const res = await api.post("/interview/questions", params);
    return res.data;
  } catch (err) {
    console.error("fetchQuestions error:", err);
    // Return mock data if API fails
    return [
      { id: 1, question_text: "What is polymorphism in OOP?" },
      { id: 2, question_text: "Explain the concept of closures in JavaScript." },
      { id: 3, question_text: "What is the difference between REST and GraphQL?" },
    ];
  }
};

export const submitAnswers = async (payload) => {
  try {
    const res = await api.post("/interview/evaluate", payload);
    return res.data;
  } catch (err) {
    console.error("submitAnswers error:", err);
    // Return mock session for demo
    return {
      sessionId: `mock-${Date.now()}`,
      overallScore: 75,
      results: payload.answers.map((a) => ({
        questionId: a.questionId,
        final_score: 7.5,
        result: "Good understanding of the concept.",
      })),
    };
  }
};

export const getReport = async (candidateId, sessionId) => {
  try {
    const res = await api.get(`/interview/analyze/${candidateId}`, {
      params: { sessionId },
    });
    return res.data;
  } catch (err) {
    console.error("getReport error:", err);
    // Return mock report
    return {
      report: {
        total_score: 75,
        topic_averages: { "Technical": 80, "Problem Solving": 70 },
        classifications: { "Technical": "Intermediate", "Problem Solving": "Beginner" },
      },
    };
  }
};

// ============================
// Coding API Functions
// ============================
export const codingAPI = {
  getQuestions: () => api.get("/questions/coding"),
  runCode: (code, language) => api.post("/code/run", { code, language }),
  submitCode: (code, language, testCases) =>
    api.post("/code/submit", { code, language, testCases }),
};

// ============================
// Resume API Functions
// ============================
export const analyzeResume = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await api.post("/resume/analyze-resume", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  } catch (err) {
    console.error("analyzeResume error:", err);
    return { error: "Resume analysis failed" };
  }
};
