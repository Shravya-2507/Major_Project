import express from "express";
import { pool } from "../db.js";
import { executeCode, runTestCases } from "../services/evaluationService.js";

const router = express.Router();

/* ==========================================================
   GET NEXT NON-REPEATING CODING QUESTIONS (STRICTLY 3)
========================================================== */
router.get("/next", async (req, res) => {
  try {
    const candidateId = Number(req.query.candidateId || 1);

    // 1. Find all question IDs this candidate has already solved successfully
    const solvedRes = await pool.query(
      `SELECT DISTINCT question_id 
       FROM coding_submissions 
       WHERE candidate_id = $1 AND (status = 'ACCEPTED' OR status = 'AC' OR score = 100)`,
      [candidateId]
    );

    const solvedIds = solvedRes.rows.map((row) => row.question_id);

    // 2. Fetch one Easy, one Medium, and one Hard question dynamically
    const difficulties = ['Easy', 'Medium', 'Hard'];
    let selectedQuestions = [];

    for (const diff of difficulties) {
      let query = `
        SELECT id, title, description, difficulty, constraints, tags, 
               "sampleInput", "sampleOutput", "sampleTestCases", "hiddenTestCases"
        FROM "CodingQuestion"
        WHERE difficulty = $1
      `;
      const values = [diff];

      if (solvedIds.length > 0) {
        query += ` AND id != ANY($2::int[])`;
        values.push(solvedIds);
      }

      query += ` ORDER BY RANDOM() LIMIT 1`;

      const resTier = await pool.query(query, values);
      if (resTier.rows.length > 0) {
        selectedQuestions.push(resTier.rows[0]);
      }
    }

    // Fallback if any tier is completely exhausted: grab any remaining unsolved questions up to 3
    if (selectedQuestions.length < 3) {
      let fallbackQuery = `
        SELECT id, title, description, difficulty, constraints, tags, 
               "sampleInput", "sampleOutput", "sampleTestCases", "hiddenTestCases"
        FROM "CodingQuestion"
        WHERE 1=1
      `;
      const fallbackValues = [];
      let counter = 1;

      if (solvedIds.length > 0) {
        fallbackQuery += ` AND id != ANY($${counter++}::int[])`;
        fallbackValues.push(solvedIds);
      }

      if (selectedQuestions.length > 0) {
        fallbackQuery += ` AND id != ANY($${counter++}::int[])`;
        fallbackValues.push(selectedQuestions.map(q => q.id));
      }

      fallbackQuery += ` ORDER BY RANDOM() LIMIT $${counter}`;
      fallbackValues.push(3 - selectedQuestions.length);

      const fallbackRes = await pool.query(fallbackQuery, fallbackValues);
      selectedQuestions = [...selectedQuestions, ...fallbackRes.rows];
    }

    if (selectedQuestions.length === 0) {
      return res.status(404).json({
        message: "Congratulations! You have solved all available coding questions.",
      });
    }

    res.json(selectedQuestions);

  } catch (err) {
    console.error("Error fetching next coding questions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/* ================= RUN CODE (Preview) ================= */
router.post("/run", async (req, res) => {
  const { code, language_id, input = "" } = req.body;

  try {
    const result = await executeCode(code, language_id, input);
    res.json({
      output: result.stdout || "",
      error: result.stderr || result.compile_output || null,
      status: result.status?.description || "Completed",
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Execution failed" });
  }
});

/* ================= SUBMIT CODE ================= */
router.post("/submit", async (req, res) => {
  const {
    code,
    language_id,
    testCases = [],
    questionId,
    candidateId = 1,
  } = req.body;

  if (!code || !language_id || !questionId) {
    return res.status(400).json({
      error: "code, language_id and questionId are required",
    });
  }

  if (!Array.isArray(testCases) || testCases.length === 0) {
    return res.status(400).json({
      error: "No test cases found for this submission",
    });
  }

  try {
    // Run tests via Judge0 service
    const results = await runTestCases(code, language_id, testCases);

    const passedTests = results.filter((r) => r.passed).length;
    const totalTests = results.length;
    const success = totalTests > 0 && passedTests === totalTests;
    const status = success ? "ACCEPTED" : "FAILED";
    const score = totalTests > 0 ? Number(((passedTests / totalTests) * 100).toFixed(2)) : 0;

    // Save submission inside Neon DB
    await pool.query(
      `INSERT INTO coding_submissions
        (candidate_id, question_id, language, status, passed_tests, total_tests, score, code, results)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
      [
        Number(candidateId) || 1,
        Number(questionId),
        String(language_id),
        status,
        passedTests,
        totalTests,
        score,
        code,
        JSON.stringify(results),
      ]
    );

    res.json({
      success,
      status,
      passedTests,
      totalTests,
      score,
      results,
    });

  } catch (dbErr) {
    console.error("Failed to process or save coding submission:", dbErr);
    res.status(500).json({ error: "Submission evaluation failed or failed to save" });
  }
});

/* ================= GET SUBMISSIONS ================= */
router.get("/submissions", async (req, res) => {
  try {
    const candidateId = Number(req.query.candidateId || 1);
    const limit = Math.min(Number(req.query.limit || 50), 200);

    const result = await pool.query(
      `SELECT
         cs.id,
         cs.candidate_id,
         cs.question_id,
         cs.language,
         cs.status,
         cs.passed_tests,
         cs.total_tests,
         cs.score,
         cs.created_at,
         cq.title AS problem_title
       FROM coding_submissions cs
       LEFT JOIN "CodingQuestion" cq ON cq.id = cs.question_id
       WHERE cs.candidate_id = $1
       ORDER BY cs.created_at DESC
       LIMIT $2`,
      [candidateId, limit]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch coding submissions:", err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

export default router;