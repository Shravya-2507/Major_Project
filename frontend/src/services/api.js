const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function for handling responses
const handleResponse = async (res) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Something went wrong");
  }
  return res.json();
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