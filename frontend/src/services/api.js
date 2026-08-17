const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
import axios from "axios";

const api = axios.create({
  baseURL: BASE_URL,
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
    console.error(
      "API ERROR:",
      error.response?.data || error.message
    );

    return Promise.reject(error);
  }
);

export default api;

// Helper function for handling responses (for legacy fetch calls)
const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Something went wrong");
  }
  return res.json();
};

export const signupUser = async (userData) => {
  const res = await fetch(`${BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });
  return await handleResponse(res);
};

export const loginUser = async (credentials) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });
  return await handleResponse(res);
};

export const loginAdmin = async (credentials) => {
  const res = await fetch(`${BASE_URL}/auth/admin/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  return await handleResponse(res);
};

export const signupAdmin = async (adminData) => {
  const res = await fetch(`${BASE_URL}/auth/admin/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(adminData),
  });

  return await handleResponse(res);
};

export const fetchRoles = async (companyId) => {
  try {
    const url = (!companyId || companyId === "general") 
      ? `${BASE_URL}/roles` 
      : `${BASE_URL}/companies/${companyId}/roles`;

    const res = await fetch(url);
    return await handleResponse(res);
  } catch (err) {
    console.error("Fetch Roles Error:", err.message);
    return [];
  }
};

export const fetchCompanies = async () => {
  try {
    const res = await fetch(`${BASE_URL}/companies`);
    return await handleResponse(res);
  } catch (err) {
    console.error("Fetch Companies Error:", err.message);
    throw err;
  }
};

// ==============================
// Admin Dashboard APIs (Using Axios Instance)
// ==============================

export const fetchAdminDashboard = async () => {
  try {
    const response = await api.get("/admin/dashboard");
    return response.data;
  } catch (err) {
    console.error("Fetch Admin Dashboard Error:", err);
    throw err;
  }
};

export const fetchTopPerformers = async () => {
  try {
    const response = await api.get("/admin/top-performers");
    return response.data;
  } catch (err) {
    console.error("Fetch Top Performers Error:", err);
    throw err;
  }
};

export const fetchActivities = async () => {
  try {
    const response = await api.get("/admin/activities");
    return response.data;
  } catch (err) {
    console.error("Fetch Activities Error:", err);
    throw err;
  }
};

export const fetchBestSubject = async () => {
  try {
    const response = await api.get("/admin/best-subject");
    return response.data;
  } catch (err) {
    console.error("Fetch Best Subject Error:", err);
    throw err;
  }
};

export const fetchWeakestSubject = async () => {
  try {
    const response = await api.get("/admin/weakest-subject");
    return response.data;
  } catch (err) {
    console.error("Fetch Weakest Subject Error:", err);
    throw err;
  }
};

// ==============================
// 1. Get Questions
// ==============================
export const fetchQuestions = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/interview/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return await handleResponse(res);
  } catch (err) {
    console.error("Fetch Questions Error:", err.message);
    throw err;
  }
};

export const fetchVtuQuestions = async () => {
  try {
    const res = await fetch(`${BASE_URL}/vtu-questions`);
    return await handleResponse(res);
  } catch (err) {
    console.error("Fetch VTU Questions Error:", err.message);
    throw err;
  }
};

// ==============================
// 2. Submit Answers
// ==============================
export const submitAnswers = async (data) => {
  try {
    const res = await fetch(`${BASE_URL}/interview/evaluate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    return await handleResponse(res);
  } catch (err) {
    console.error("Submit Answers Error:", err.message);
    throw err;
  }
};

// ==============================
// 3. Get Report
// ==============================
export const getReport = async (candidateId, sessionId) => {
  try {
    const res = await fetch(
      `${BASE_URL}/interview/analyze/${candidateId}?sessionId=${sessionId}`
    );

    return await handleResponse(res);
  } catch (err) {
    console.error("Get Report Error:", err.message);
    throw err;
  }
};

// ==============================
// 4. Resume Analysis
// ==============================
export const analyzeResume = async (file, role = "") => {
  try {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("role", role);

    const res = await fetch(`${BASE_URL}/resume/analyze`, {
      method: "POST",
      body: formData,
    });

    return await handleResponse(res);
  } catch (err) {
    console.error("Resume Analysis Error:", err.message);
    throw err;
  }
};

export const codingAPI = {
  getQuestions: async (candidateId = 1) => {
    const cacheKey = `active_coding_questions_${candidateId}`;
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        localStorage.removeItem(cacheKey);
      }
    }

    const res = await fetch(`${BASE_URL}/code/next?candidateId=${candidateId}`); 
    const questions = await handleResponse(res);
    
    localStorage.setItem(cacheKey, JSON.stringify(questions));
    return questions;
  },

  clearSession: (candidateId = 1) => {
    localStorage.removeItem(`active_coding_questions_${candidateId}`);
    localStorage.removeItem(`candidate_code_drafts_${candidateId}`);
  },

  saveCodeDraft: (questionId, code, candidateId = 1) => {
    const draftKey = `candidate_code_drafts_${candidateId}`;
    let drafts = {};
    try {
      drafts = JSON.parse(localStorage.getItem(draftKey)) || {};
    } catch (e) {
      drafts = {};
    }
    drafts[questionId] = code;
    localStorage.setItem(draftKey, JSON.stringify(drafts));
  },

  getCodeDraft: (questionId, candidateId = 1) => {
    const draftKey = `candidate_code_drafts_${candidateId}`;
    try {
      const drafts = JSON.parse(localStorage.getItem(draftKey)) || {};
      return drafts[questionId] || "";
    } catch (e) {
      return "";
    }
  },
  
  runCode: async (code, language, input = "") => {
    const res = await fetch(`${BASE_URL}/code/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        code, 
        language, 
        language_id: language, 
        input 
      }),
    });
    return await handleResponse(res);
  },

  // FIXED: Properly passes candidateId, attemptId, and submissions payload directly
  submitCode: async (payload) => {
    const response = await fetch(`${BASE_URL}/code/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await handleResponse(response);
  },
};