import axios from "axios";

const AI_API = "http://localhost:8000";

// ✅ ADD 'role' and 'company' to the arguments here
export async function evaluateAnswer(userAnswer, expectedAnswer, role, company) {
  try {
    const response = await axios.post(
      `${AI_API}/evaluate`,
      {
        student_answer: userAnswer,
        correct_answer: expectedAnswer,
        // ✅ These now have values passed from the controller
        role: role || "General",
        company: company || "General"
      },
      { timeout: 10000 } 
    );

    return response.data; 

  } catch (error) {
    // This catches the error if the Python server is down or returns an error
    console.error("AI ERROR FULL:", error.response?.data || error.message);

    return {
      semantic_score: 0,
      smith_score: 0,
      final_score: 0,
      result: "Evaluation failed"
    };
  }
}