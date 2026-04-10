import pool from "../config/db.js";
import { evaluateAnswer } from "../services/evaluationService.js";

// Generate Questions (optional VTU syllabus)
export const generateQuestions = async (req, res) => {
  try {
    const { roleId, companyId, syllabusIds } = req.body;

    if (!roleId) return res.status(400).json({ error: "roleId required" });

    let query = `SELECT * FROM questions WHERE role_id = $1`;
    const values = [roleId];
    let counter = 2;

    if (companyId) {
      query += ` AND company_id = $${counter++}`;
      values.push(companyId);
    }

    if (syllabusIds?.length) {
      query += ` AND syllabus_id = ANY($${counter++})`;
      values.push(syllabusIds);
    }

    query += ` LIMIT 5`;

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Error generating questions:", err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};

// Evaluate Answers
export const evaluateAnswers = async (req, res) => {
  try {
    const { candidateId, answers } = req.body;

    if (!candidateId || !answers?.length) {
      return res.status(400).json({ error: "candidateId and answers required" });
    }

    const results = [];

    for (const ans of answers) {
      const dbRes = await pool.query(
        "SELECT role_id, company_id, expected_answer FROM questions WHERE id = $1",
        [ans.questionId]
      );

      const question = dbRes.rows[0];
      if (!question) continue;

      const { score, feedback } = await evaluateAnswer(
        ans.answerText,
        question.expected_answer || ""
      );

      await pool.query(
        `INSERT INTO answers
         (candidate_id, question_id, role_id, company_id, answer_text, ai_score, ai_feedback)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [candidateId, ans.questionId, question.role_id, question.company_id, ans.answerText, score, feedback]
      );

      results.push({
        questionId: ans.questionId,
        ai_score: score,
        ai_feedback: feedback
      });
    }

    res.json(results);
  } catch (err) {
    console.error("Error evaluating answers:", err);
    res.status(500).json({ error: "Evaluation failed" });
  }
};