import pool from "../config/db.js";
import { evaluateAnswer } from "../services/evaluationService.js";

// ==============================
// Helper: Parse Filters (GET + POST support)
// ==============================
const parseFilters = (req) => {
  const source = req.method === "POST" ? req.body : req.query;

  const roleId = source.role_id ? Number(source.role_id) : null;
  const companyId = source.company_id ? Number(source.company_id) : null;

  const syllabusIds = source.syllabus_ids
    ? Array.isArray(source.syllabus_ids)
      ? source.syllabus_ids.map(Number)
      : String(source.syllabus_ids).split(",").map(Number)
    : null;

  const limit = source.limit ? Number(source.limit) : 5;

  return { roleId, companyId, syllabusIds, limit };
};

// ==============================
// 1. Get Questions
// ==============================
export const getQuestions = async (req, res) => {
  try {
    const { roleId, companyId, syllabusIds, limit } = parseFilters(req);

    // Require at least one meaningful filter
    if (!roleId && (!syllabusIds || syllabusIds.length === 0)) {
      return res.status(400).json({
        error: "Search criteria missing",
        detail: "Provide at least role_id or syllabus_ids",
      });
    }

    let query = `
      SELECT id, question_text, syllabus_id
      FROM questions
      WHERE 1=1
    `;

    const values = [];
    let counter = 1;

    // Role filter
    if (roleId) {
      query += ` AND role_id = $${counter++}`;
      values.push(roleId);
    }

    // Company filter (specific + generic)
    if (companyId) {
      query += ` AND (company_id = $${counter++} OR company_id IS NULL)`;
      values.push(companyId);
    }

    // Syllabus filter
    if (syllabusIds?.length) {
      query += ` AND syllabus_id = ANY($${counter++}::int[])`;
      values.push(syllabusIds);
    }

    // Random questions + limit
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
    console.error("Error fetching questions:", err);
    res.status(500).json({ error: "Internal Server Error" });
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
      // Fetch question details
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

      // Store answer
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