import axios from "axios";

// Base AI API URL (keep in .env for flexibility)
const AI_API = process.env.AI_API_URL || "http://localhost:8000";

// Reusable axios instance (better than calling axios directly)
const api = axios.create({
  baseURL: AI_API,
  timeout: 5000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==============================
// Evaluate Answer using AI
// ==============================
export const evaluateAnswer = async (userAnswer, expectedAnswer) => {
  try {
    // Basic validation
    if (!userAnswer || !expectedAnswer) {
      return {
        score: 0,
        feedback: "Invalid input provided",
      };
    }

    const response = await api.post("/evaluate", {
      student_answer: userAnswer,
      correct_answer: expectedAnswer,
    });

    const data = response.data;

    return {
      // Normalize score (0–10 scale)
      score: Math.round((data.final_score || 0) * 10),
      feedback: data.result || "No feedback provided",
    };

  } catch (error) {
    // Detailed logging for debugging
    console.error("AI Evaluation Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Graceful fallback for frontend
    return {
      score: 0,
      feedback: "AI evaluation failed. Please try again.",
    };
  }
};