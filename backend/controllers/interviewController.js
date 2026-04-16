import pool from "../config/db.js";

// ==============================
// 1. Generate Questions
// ==============================
export const generateQuestions = async (req, res) => {
  try {
    const { roleId, companyId, syllabusIds, limit = 5 } = req.body;

    let query = `SELECT * FROM questions WHERE 1=1`;
    const values = [];
    let counter = 1;

    if (roleId) {
      query += ` AND role_id = $${counter++}`;
      values.push(roleId);
    }

    if (companyId) {
      query += ` AND (company_id = $${counter++} OR company_id IS NULL)`;
      values.push(companyId);
    }

    if (syllabusIds?.length) {
      query += ` AND syllabus_id = ANY($${counter++}::int[])`;
      values.push(syllabusIds);
    }

    query += ` ORDER BY RANDOM() LIMIT $${counter}`;
    values.push(limit);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No questions found",
      });
    }

    res.json(result.rows);

  } catch (err) {
    console.error("Error generating questions:", err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};