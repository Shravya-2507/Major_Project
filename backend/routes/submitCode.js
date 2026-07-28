import express from "express";
import { runTestCases } from "../services/evaluationService.js";
import { pool } from "../db.js"; // Adjust path to your db connection if needed

const router = express.Router();

router.post("/", async (req, res) => {
  const { 
    code, 
    language, 
    language_id, 
    hiddenTestCases = [], 
    questionId, 
    candidateId = 1 
  } = req.body;

  // Accept either language or language_id
  const resolvedLang = language || language_id;

  if (!code || !resolvedLang || !questionId) {
    return res.status(400).json({
      error: "code, language_id and questionId are required",
    });
  }

  if (!Array.isArray(hiddenTestCases) || hiddenTestCases.length === 0) {
    return res.status(400).json({
      error: "No test cases found for this submission",
    });
  }

  try {
    // 1. Run test cases using your judge service
    const results = await runTestCases(code, language, hiddenTestCases);

    const passedTests = results.filter((r) => r.status === "AC").length;
    const totalTests = results.length;
    const allPassed = totalTests > 0 && passedTests === totalTests;
    const status = allPassed ? "ACCEPTED" : "FAILED";
    const score = totalTests > 0 ? Number(((passedTests / totalTests) * 100).toFixed(2)) : 0;

    // 2. Save submission directly into the 'coding_submissions' table
    await pool.query(
      `INSERT INTO coding_submissions
        (candidate_id, question_id, language, status, passed_tests, total_tests, score, code, results)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
      [
        Number(candidateId) || 1,
        Number(questionId),
        language,
        status,
        passedTests,
        totalTests,
        score,
        code,
        JSON.stringify(results),
      ]
    );

    // 3. Respond with full evaluation metrics
    res.json({
      success: allPassed,
      status,
      passedTests,
      totalTests,
      score,
      results,
    });

  } catch (err) {
    console.error("Failed to process or save submission:", err);
    res.status(500).json({ error: err.message || "Internal Server Error" });
  }
});

export default router;