import pool from "../config/db.js";
import { evaluateAnswer } from "../services/evaluationService.js";

export const submitAnswers = async (req, res) => {
  const { interview_id, answers } = req.body;

  try {
    for (let ans of answers) {

      // get expected answer from DB
      const q = await pool.query(
        "SELECT expected_answer FROM questions WHERE id=$1",
        [ans.question_id]
      );

      const expected = q.rows[0]?.expected_answer || "";

      const score = evaluateAnswer(ans.answer_text, expected);

      await pool.query(
        `INSERT INTO answers (interview_id, question_id, answer_text, ai_score)
         VALUES ($1,$2,$3,$4)`,
        [interview_id, ans.question_id, ans.answer_text, score]
      );
    }

    res.json({ message: "Answers evaluated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Evaluation failed" });
  }
};