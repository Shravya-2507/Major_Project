import axios from "axios";

const AI_API = "http://localhost:8000";

export async function evaluateAnswer(userAnswer, expectedAnswer) {
  try {
    const response = await axios.post(
      `${AI_API}/evaluate`,
      {
        student_answer: userAnswer,
        correct_answer: expectedAnswer
      },
      { timeout: 5000 } // 👈 ADD HERE
    );

    const data = response.data;

    return {
      score: data.final_score * 10,
      feedback: data.result
    };

  } catch (error) {
    console.error("AI ERROR FULL:", error.response?.data || error.message);

    return {
      score: 0,
      feedback: "Evaluation failed"
    };
  }
}