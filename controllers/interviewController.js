// controllers/interviewController.js
import pool from "../config/db.js";
import { smithWaterman } from "../utils/smithWaterman.js";

// Free AI simulation: generate questions
export const generateQuestionsFree = async (req, res) => {
  const { roleId, companyId, syllabusIds } = req.body;

  try {
    const query = `
      SELECT * FROM questions
      WHERE role_id = $1 AND company_id = $2
      ${syllabusIds && syllabusIds.length > 0 ? "AND syllabus_id = ANY($3)" : ""}
      LIMIT 5
    `;

    const values = syllabusIds && syllabusIds.length > 0 ? [roleId, companyId, syllabusIds] : [roleId, companyId];
    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};

// Free AI simulation: evaluate answers
export const evaluateAnswersFree = async (req, res) => {
  const { interviewId, answers } = req.body; // [{ questionId, answerText }]

  try {
    const results = [];

    for (const ans of answers) {
      const dbQuestion = await pool.query(
        "SELECT expected_answer FROM questions WHERE id = $1",
        [ans.questionId]
      );
      const expected = dbQuestion.rows[0].expected_answer;

      const score = smithWaterman(ans.answerText, expected); // similarity 0–1
      const feedback =
        score > 0.8
          ? "Excellent"
          : score > 0.5
          ? "Good"
          : "Needs improvement";

      await pool.query(
        "INSERT INTO answers (interview_id, question_id, answer_text, ai_score, ai_feedback) VALUES ($1,$2,$3,$4,$5)",
        [interviewId, ans.questionId, ans.answerText, score * 10, feedback]
      );

      results.push({ questionId: ans.questionId, ai_score: score * 10, ai_feedback: feedback });
    }

    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Evaluation failed" });
  }
};