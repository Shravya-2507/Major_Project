import pool from "../config/db.js";
import { evaluateAnswer } from "../services/evaluationService.js";

// ==============================
// 1. Generate Questions
// ==============================
export const generateQuestions = async (req, res) => {
  try {
    const { roleId, companyId, syllabusIds, limit = 5 } = req.body;

    let query = `SELECT * FROM questions WHERE 1=1`;
    const values = [];
    let counter = 1;

    // Optional role filter
    if (roleId) {
      query += ` AND role_id = $${counter++}`;
      values.push(roleId);
    }

    // Company filter (include generic questions)
    if (companyId) {
      query += ` AND (company_id = $${counter++} OR company_id IS NULL)`;
      values.push(companyId);
    }

    // Syllabus filter (VTU practice mode)
    if (syllabusIds?.length) {
      query += ` AND syllabus_id = ANY($${counter++})`;
      values.push(syllabusIds);
    }

    // Randomize results
    query += ` ORDER BY RANDOM() LIMIT $${counter}`;
    values.push(limit);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No questions found for given filters",
      });
    }

    res.json(result.rows);

  } catch (err) {
    console.error("Error generating questions:", err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};

// ==============================
// 2. Evaluate Answers
// ==============================
export const evaluateAnswers = async (req, res) => {
  try {
    const { candidateId, answers } = req.body;

    if (!candidateId || !answers?.length) {
      return res.status(400).json({
        error: "candidateId and answers are required",
      });
    }

    const results = [];

    for (const ans of answers) {
      // Get question details
      const dbRes = await pool.query(
        `SELECT role_id, company_id, expected_answer 
         FROM questions WHERE id = $1`,
        [ans.questionId]
      );

      const question = dbRes.rows[0];
      if (!question) continue;

      // AI Evaluation
      const { score, feedback } = await evaluateAnswer(
        ans.answerText,
        question.expected_answer || ""
      );

      // Store result
      await pool.query(
        `INSERT INTO answers
        (candidate_id, question_id, role_id, company_id, answer_text, ai_score, ai_feedback)
        VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          candidateId,
          ans.questionId,
          question.role_id,
          question.company_id,
          ans.answerText,
          score,
          feedback,
        ]
      );

      results.push({
        questionId: ans.questionId,
        ai_score: score,
        ai_feedback: feedback,
      });
    }

    res.json(results);

  } catch (err) {
    console.error("Error evaluating answers:", err);
    res.status(500).json({ error: "Evaluation failed" });
  }
};