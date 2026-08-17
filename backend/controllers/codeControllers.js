import pool from "../config/db.js";
import { executeCode } from "../services/judgeService.js";

const parseFilters = (req) => {
  const source = req.method === "POST" ? req.body : req.query;
  const candidateId = source.candidateId ? Number(source.candidateId) : 1;
  return { candidateId, limit: 3 };
};

const parseTestCases = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const getCodingQuestions = async (req, res) => {
  try {
    const { candidateId, limit } = parseFilters(req);

    const solvedResult = await pool.query(
      `
      SELECT DISTINCT question_id
      FROM coding_submissions
      WHERE candidate_id = $1
        AND (status = 'ACCEPTED' OR status = 'AC' OR score = 100)
      `,
      [candidateId]
    );

    const solvedIds = solvedResult.rows.map((row) => Number(row.question_id));

    let query = `
      SELECT id, title, description, difficulty, constraints, tags,
             "sampleInput", "sampleOutput", "sampleTestCases", "hiddenTestCases"
      FROM "CodingQuestion"
      WHERE 1 = 1
    `;
    const values = [];
    let index = 1;

    if (solvedIds.length > 0) {
      query += ` AND id != ALL($${index}::int[])`;
      values.push(solvedIds);
      index++;
    }

    query += ` ORDER BY RANDOM() LIMIT $${index}`;
    values.push(limit);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.json({
        completed: true,
        message: "Congratulations! You have solved all available coding questions.",
        questions: [],
      });
    }

    return res.json(result.rows);
  } catch (err) {
    console.error("Get Coding Questions Error:", err);
    return res.status(500).json({ error: "Failed to load coding questions", details: err.message });
  }
};

// ==========================================================
// START OR GET ACTIVE ATTEMPT ID (Optional helper/route endpoint)
// ==========================================================
export const startCodingAttempt = async (req, res) => {
  try {
    const { candidateId } = req.body;
    const numericCandidateId = Number(candidateId) || 1;

    const insertRes = await pool.query(
      `
      INSERT INTO test_attempts (candidate_id, test_type, started_at)
      VALUES ($1, 'interview', NOW())
      RETURNING attempt_id, candidate_id, test_type, started_at
      `,
      [numericCandidateId]
    );

    return res.json({ success: true, attemptId: insertRes.rows[0].attempt_id });
  } catch (err) {
    console.error("Start Attempt Error:", err);
    return res.status(500).json({ error: "Failed to start attempt", details: err.message });
  }
};

// ==========================================================
// EVALUATE CODING ANSWERS & RECORD ATTEMPT SCORE
// ==========================================================
export const evaluateCodingAnswers = async (req, res) => {
  try {
    const { candidateId, submissions, attemptId, isFinalSync, finalScore, correctAnswers, totalQuestions } = req.body;

    if (!candidateId) {
      return res.status(400).json({ error: "candidateId is required" });
    }

    const numericCandidateId = Number(candidateId);
    let activeAttemptId = attemptId ? Number(attemptId) : null;

    // 🚀 CRITICAL FIX: Handle final test sync immediately before validating submissions array
    if (isFinalSync && activeAttemptId) {
      await pool.query(
        `
        UPDATE test_attempts
        SET score = $1, total_questions = $2, correct_answers = $3, completed_at = NOW()
        WHERE attempt_id = $4
        `,
        [finalScore || 0, totalQuestions || 3, correctAnswers || 0, activeAttemptId]
      );
      
      console.log(`[Final Sync Success] Attempt ID: ${activeAttemptId} | Score: ${finalScore} | Correct: ${correctAnswers}`);
      return res.json({ success: true, message: "Final score synced successfully", attemptId: activeAttemptId });
    }

    if (!Array.isArray(submissions) || submissions.length === 0) {
      return res.status(400).json({ error: "candidateId and submissions are required" });
    }

    // If attemptId wasn't passed, create one dynamically with default safe values to satisfy table constraints
    if (!activeAttemptId) {
      const attemptInsert = await pool.query(
        `
        INSERT INTO test_attempts (candidate_id, test_type, score, total_questions, correct_answers, started_at)
        VALUES ($1, 'coding', 0, 3, 0, NOW())
        RETURNING attempt_id
        `,
        [numericCandidateId]
      );
      activeAttemptId = attemptInsert.rows[0].attempt_id;
    }

    const finalResults = [];

    for (const sub of submissions) {
      const questionId = Number(sub.questionId);
      const code = String(sub.code || "");
      const language = String(sub.language || sub.language_id || "");

      if (!questionId || !code.trim() || !language) continue;

      const questionResult = await pool.query(
        `SELECT id, "sampleTestCases", "hiddenTestCases" FROM "CodingQuestion" WHERE id = $1`,
        [questionId]
      );

      if (questionResult.rows.length === 0) continue;

      const question = questionResult.rows[0];
      const testCases = [...parseTestCases(question.sampleTestCases), ...parseTestCases(question.hiddenTestCases)];

      let passedCount = 0;
      const testResults = [];

      for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        try {
          const execution = await executeCode(code, language, tc.input ?? "");
          const output = String(execution?.stdout || "").trim();
          const expected = String(tc.expected ?? tc.output ?? "").trim();
          const passed = output === expected;

          if (passed) passedCount++;

          testResults.push({
            testNumber: i + 1,
            passed,
            output: passed ? output : "",
            error: execution?.stderr || null,
          });
        } catch (executionError) {
          testResults.push({
            testNumber: i + 1,
            passed: false,
            output: "",
            error: executionError.message || "Execution failed",
          });
        }
      }

      const totalTests = testCases.length;
      const score = totalTests > 0 ? Number(((passedCount / totalTests) * 100).toFixed(2)) : 0;
      const status = totalTests > 0 && passedCount === totalTests ? "ACCEPTED" : "FAILED";

      // Save individual submission with attempt_id
      await pool.query(
        `
        INSERT INTO coding_submissions (
          candidate_id, question_id, language, status, passed_tests, total_tests, score, code, results, attempt_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
        `,
        [numericCandidateId, questionId, language, status, passedCount, totalTests, score, code, JSON.stringify(testResults), activeAttemptId]
      );

      finalResults.push({
        questionId,
        status,
        passedTests: passedCount,
        totalTests,
        score,
        results: testResults,
      });
    }

    // -------------------------------------------------------------------------
    // Fetch ALL unique submissions for this attempt to calculate cumulative score
    // -------------------------------------------------------------------------
    const allAttemptSubmissions = await pool.query(
      `
      SELECT DISTINCT ON (question_id) question_id, score, status
      FROM coding_submissions
      WHERE attempt_id = $1
      ORDER BY question_id, created_at DESC
      `,
      [activeAttemptId]
    );

    const subRows = allAttemptSubmissions.rows;
    const totalQuestionsInTest = 3; // Standard limit of questions per session

    let totalScoreSum = 0;
    let correctCount = 0;

    subRows.forEach((row) => {
      totalScoreSum += parseFloat(row.score || 0);
      if (row.status === "ACCEPTED") {
        correctCount++;
      }
    });

    // Explicitly parse floats to avoid truncation or integer conversion bugs
    const overallScore = totalQuestionsInTest > 0
      ? parseFloat((totalScoreSum / totalQuestionsInTest).toFixed(2))
      : 0.00;

    const allAccepted = subRows.length > 0 && subRows.every((r) => r.status === "ACCEPTED");

    console.log(`[Database Sync] Attempt ID: ${activeAttemptId} | Score: ${overallScore} | Correct: ${correctCount} / ${totalQuestionsInTest}`);

    // Update aggregate info in test_attempts table with full cumulative score
    await pool.query(
      `
      UPDATE test_attempts
      SET score = $1, total_questions = $2, correct_answers = $3, completed_at = NOW()
      WHERE attempt_id = $4
      `,
      [overallScore, totalQuestionsInTest, correctCount, activeAttemptId]
    );

    return res.json({
      success: allAccepted,
      status: allAccepted ? "ACCEPTED" : "FAILED",
      attemptId: activeAttemptId,
      totalQuestions: totalQuestionsInTest,
      overallScore,
      results: finalResults,
    });
  } catch (err) {
    console.error("Evaluation Error:", err);
    return res.status(500).json({ error: "Code evaluation failed", details: err.message });
  }
};