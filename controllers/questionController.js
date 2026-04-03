import pool from "../config/db.js";

export const getQuestions = async (req, res) => {
  const { role_id, company_id } = req.body;

  try {
    const result = await pool.query(
      `SELECT q.id, q.question_text, q.expected_answer
       FROM questions q
       WHERE q.role_id = $1
       AND (q.company_id = $2 OR q.company_id IS NULL)
       ORDER BY RANDOM()
       LIMIT 5`,
      [role_id, company_id]
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch questions" });
  }
};