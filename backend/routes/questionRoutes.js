import express from "express";
import { getQuestions } from "../controllers/questionController.js";
import pool from "../config/db.js";
const router = express.Router();

router.get("/", getQuestions);
router.post("/", getQuestions);

/**
 * GET CODING QUESTIONS (REAL NEON TABLE)
 */
router.get("/coding", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "CodingQuestion" ORDER BY id ASC'
    );

    res.json(result.rows);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET SINGLE QUESTION
 */
router.get("/coding/:id", async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "CodingQuestion" WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;