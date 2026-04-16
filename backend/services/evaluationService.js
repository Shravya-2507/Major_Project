import axios from "axios";

const AI_API = process.env.AI_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: AI_API,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==============================
// Evaluate Answer using AI
// ==============================
export const evaluateAnswer = async (
  userAnswer,
  expectedAnswer,
  role = "General",
  company = "General"
) => {
  try {
    if (!userAnswer || !expectedAnswer) {
      return {
        // ✅ New format
        final_score: 0,
        result: "Invalid input",

        // ✅ Old format compatibility
        score: 0,
        feedback: "Invalid input",

        semantic_score: 0,
        smith_score: 0,
      };
    }

    const response = await api.post("/evaluate", {
      student_answer: userAnswer,
      correct_answer: expectedAnswer,
      role,
      company,
    });

    const data = response.data;

    const finalScore = data.final_score || 0;
    const resultText = data.result || "No feedback";

    return {
      // ✅ PRIMARY (new system)
      final_score: finalScore,
      result: resultText,
      semantic_score: data.semantic_score || 0,
      smith_score: data.smith_score || 0,

      // ✅ BACKWARD COMPATIBILITY (old system)
      score: Math.round(finalScore * 10), // if you used /10 scale before
      feedback: resultText,
    };

  } catch (error) {
    console.error("AI Evaluation Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    return {
      final_score: 0,
      result: "AI evaluation failed",

      score: 0,
      feedback: "AI evaluation failed",

      semantic_score: 0,
      smith_score: 0,
    };
  }
};