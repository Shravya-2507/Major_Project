import express from "express";
import { pool } from "../db.js";
import {
  executeCode,
  runTestCases,
} from "../services/evaluationService.js";

const router = express.Router();

/* ==========================================================
   START CODING TEST
   Creates one test_attempts row and returns attemptId
========================================================== */
router.post("/start", async (req, res) => {
  try {
    const candidateId = Number(req.body.candidateId || 1);
    const companyId = req.body.companyId
      ? Number(req.body.companyId)
      : null;

    if (!candidateId) {
      return res.status(400).json({
        error: "candidateId is required",
      });
    }

    const result = await pool.query(
      `
      INSERT INTO test_attempts
      (
        candidate_id,
        company_id,
        test_type,
        score,
        total_questions,
        correct_answers,
        started_at
      )
      VALUES
      ($1, $2, $3, $4, $5, $6, NOW())
      RETURNING attempt_id, started_at
      `,
      [
        candidateId,
        companyId,
        "coding",
        0,
        3,
        0,
      ]
    );

    const attempt = result.rows[0];

    return res.json({
      success: true,
      attemptId: attempt.attempt_id,
      startedAt: attempt.started_at,
    });
  } catch (err) {
    console.error("Start coding test error:", err);

    return res.status(500).json({
      error: "Failed to start coding test",
    });
  }
});


/* ==========================================================
   GET NEXT NON-REPEATING CODING QUESTIONS
   STRICTLY 3 QUESTIONS
========================================================== */
router.get("/next", async (req, res) => {
  try {
    const candidateId = Number(req.query.candidateId || 1);

    // Find questions already solved successfully
    const solvedRes = await pool.query(
      `
      SELECT DISTINCT question_id
      FROM coding_submissions
      WHERE candidate_id = $1
      AND (
        status = 'ACCEPTED'
        OR status = 'AC'
        OR score = 100
      )
      `,
      [candidateId]
    );

    const solvedIds = solvedRes.rows.map(
      (row) => row.question_id
    );

    const difficulties = [
      "Easy",
      "Medium",
      "Hard",
    ];

    let selectedQuestions = [];

    // One Easy, one Medium, one Hard
    for (const diff of difficulties) {
      let query = `
        SELECT
          id,
          title,
          description,
          difficulty,
          constraints,
          tags,
          "sampleInput",
          "sampleOutput",
          "sampleTestCases",
          "hiddenTestCases"
        FROM "CodingQuestion"
        WHERE difficulty = $1
      `;

      const values = [diff];

      if (solvedIds.length > 0) {
        query += ` AND id != ANY($2::int[])`;
        values.push(solvedIds);
      }

      query += ` ORDER BY RANDOM() LIMIT 1`;

      const result = await pool.query(
        query,
        values
      );

      if (result.rows.length > 0) {
        selectedQuestions.push(result.rows[0]);
      }
    }

    // Fallback
    if (selectedQuestions.length < 3) {
      let fallbackQuery = `
        SELECT
          id,
          title,
          description,
          difficulty,
          constraints,
          tags,
          "sampleInput",
          "sampleOutput",
          "sampleTestCases",
          "hiddenTestCases"
        FROM "CodingQuestion"
        WHERE 1=1
      `;

      const fallbackValues = [];
      let counter = 1;

      if (solvedIds.length > 0) {
        fallbackQuery += `
          AND id != ANY($${counter}::int[])
        `;

        fallbackValues.push(solvedIds);
        counter++;
      }

      if (selectedQuestions.length > 0) {
        fallbackQuery += `
          AND id != ANY($${counter}::int[])
        `;

        fallbackValues.push(
          selectedQuestions.map((q) => q.id)
        );

        counter++;
      }

      fallbackQuery += `
        ORDER BY RANDOM()
        LIMIT $${counter}
      `;

      fallbackValues.push(
        3 - selectedQuestions.length
      );

      const fallbackRes = await pool.query(
        fallbackQuery,
        fallbackValues
      );

      selectedQuestions = [
        ...selectedQuestions,
        ...fallbackRes.rows,
      ];
    }

    if (selectedQuestions.length === 0) {
      return res.status(404).json({
        message:
          "Congratulations! You have solved all available coding questions.",
      });
    }

    return res.json(selectedQuestions);
  } catch (err) {
    console.error(
      "Error fetching next coding questions:",
      err
    );

    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});


/* ==========================================================
   RUN CODE - PREVIEW
========================================================== */
router.post("/run", async (req, res) => {
  const {
    code,
    language_id,
    input = "",
  } = req.body;

  if (!code || !language_id) {
    return res.status(400).json({
      error: "code and language_id are required",
    });
  }

  try {
    const result = await executeCode(
      code,
      language_id,
      input
    );

    return res.json({
      output: result.stdout || "",
      error:
        result.stderr ||
        result.compile_output ||
        null,
      status:
        result.status?.description ||
        "Completed",
    });
  } catch (err) {
    console.error("Run code error:", err);

    return res.status(500).json({
      error:
        err.message ||
        "Execution failed",
    });
  }
});


/* ==========================================================
   SUBMIT CODE
   Saves attempt_id with coding submission
========================================================== */
router.post("/submit", async (req, res) => {
  const {
    code,
    language_id,
    testCases = [],
    questionId,
    candidateId = 1,
    attemptId,
  } = req.body;

  if (!code || !language_id || !questionId) {
    return res.status(400).json({
      error:
        "code, language_id and questionId are required",
    });
  }

  if (!attemptId) {
    return res.status(400).json({
      error:
        "attemptId is required. Start the coding test first.",
    });
  }

  if (
    !Array.isArray(testCases) ||
    testCases.length === 0
  ) {
    return res.status(400).json({
      error:
        "No test cases found for this submission",
    });
  }

  try {
    // Make sure attempt belongs to candidate
    const attemptCheck = await pool.query(
      `
      SELECT attempt_id
      FROM test_attempts
      WHERE attempt_id = $1
      AND candidate_id = $2
      AND test_type = 'coding'
      `,
      [
        Number(attemptId),
        Number(candidateId),
      ]
    );

    if (attemptCheck.rows.length === 0) {
      return res.status(400).json({
        error:
          "Invalid coding test attempt",
      });
    }

    // Execute all test cases
    const results = await runTestCases(
      code,
      language_id,
      testCases
    );

    const passedTests = results.filter(
      (r) => r.passed
    ).length;

    const totalTests = results.length;

    const success =
      totalTests > 0 &&
      passedTests === totalTests;

    const status = success
      ? "ACCEPTED"
      : "FAILED";

    const score =
      totalTests > 0
        ? Number(
            (
              (passedTests / totalTests) *
              100
            ).toFixed(2)
          )
        : 0;

    /*
    ========================================================
    Save coding submission
    ========================================================
    */

    const submissionResult = await pool.query(
      `
      INSERT INTO coding_submissions
      (
        candidate_id,
        question_id,
        attempt_id,
        language,
        status,
        passed_tests,
        total_tests,
        score,
        code,
        results
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb
      )
      RETURNING id
      `,
      [
        Number(candidateId),
        Number(questionId),
        Number(attemptId),
        String(language_id),
        status,
        passedTests,
        totalTests,
        score,
        code,
        JSON.stringify(results),
      ]
    );

    return res.json({
      success,
      status,
      passedTests,
      totalTests,
      score,
      submissionId:
        submissionResult.rows[0]?.id,
      attemptId: Number(attemptId),
      results,
    });
  } catch (err) {
    console.error(
      "Failed to process or save coding submission:",
      err
    );

    return res.status(500).json({
      error:
        "Submission evaluation failed or failed to save",
      details: err.message,
    });
  }
});


/* ==========================================================
   END CODING TEST
   Calculates final score and updates test_attempts
========================================================== */
router.post("/end", async (req, res) => {
  const {
    candidateId = 1,
    attemptId,
  } = req.body;

  if (!attemptId) {
    return res.status(400).json({
      error: "attemptId is required",
    });
  }

  try {
    /*
    ========================================================
    Get this attempt
    ========================================================
    */

    const attemptResult = await pool.query(
      `
      SELECT
        attempt_id,
        candidate_id,
        total_questions,
        started_at,
        completed_at
      FROM test_attempts
      WHERE attempt_id = $1
      AND candidate_id = $2
      AND test_type = 'coding'
      `,
      [
        Number(attemptId),
        Number(candidateId),
      ]
    );

    if (attemptResult.rows.length === 0) {
      return res.status(404).json({
        error: "Coding test attempt not found",
      });
    }

    const attempt = attemptResult.rows[0];

    /*
    ========================================================
    Get submissions for THIS attempt only
    ========================================================
    */

    const submissionsResult = await pool.query(
      `
      SELECT
        question_id,
        passed_tests,
        total_tests,
        score,
        status
      FROM coding_submissions
      WHERE attempt_id = $1
      ORDER BY question_id
      `,
      [Number(attemptId)]
    );

    const submissions =
      submissionsResult.rows;

    const totalQuestions =
      Number(attempt.total_questions) || 3;

    /*
    ========================================================
    Calculate final score
    ========================================================

    Example:

    Q1 = 100
    Q2 = 100
    Q3 = 33.33

    Final = 77.78
    */

    const totalScore =
      submissions.reduce(
        (sum, submission) =>
          sum + Number(submission.score || 0),
        0
      );

    const finalScore =
      totalQuestions > 0
        ? Number(
            (
              totalScore /
              totalQuestions
            ).toFixed(2)
          )
        : 0;

    /*
    ========================================================
    Correct answers
    A question is considered correct only if
    all test cases passed.
    ========================================================
    */

    const correctAnswers =
      submissions.filter(
        (submission) =>
          Number(submission.passed_tests) ===
          Number(submission.total_tests) &&
          Number(submission.total_tests) > 0
      ).length;

    /*
    ========================================================
    Calculate duration
    ========================================================
    */

    const completedAt = new Date();

    const startedAt = attempt.started_at
      ? new Date(attempt.started_at)
      : completedAt;

    const durationMinutes =
      Math.max(
        0,
        Math.round(
          (completedAt - startedAt) /
            60000
        )
      );

    /*
    ========================================================
    UPDATE test_attempts
    ========================================================
    */

    const updateResult = await pool.query(
      `
      UPDATE test_attempts
      SET
        score = $1,
        total_questions = $2,
        correct_answers = $3,
        completed_at = $4,
        duration_minutes = $5
      WHERE attempt_id = $6
      RETURNING
        attempt_id,
        candidate_id,
        test_type,
        score,
        total_questions,
        correct_answers,
        started_at,
        completed_at,
        duration_minutes
      `,
      [
        finalScore,
        totalQuestions,
        correctAnswers,
        completedAt,
        durationMinutes,
        Number(attemptId),
      ]
    );

    return res.json({
      success: true,

      attempt: updateResult.rows[0],

      score: finalScore,

      totalQuestions,

      correctAnswers,

      attemptedQuestions:
        submissions.length,

      submissions,
    });
  } catch (err) {
    console.error(
      "End coding test error:",
      err
    );

    return res.status(500).json({
      error:
        "Failed to finalize coding test",
      details: err.message,
    });
  }
});


/* ==========================================================
   GET SUBMISSIONS
========================================================== */
router.get("/submissions", async (req, res) => {
  try {
    const candidateId =
      Number(req.query.candidateId || 1);

    const attemptId = req.query.attemptId
      ? Number(req.query.attemptId)
      : null;

    const limit = Math.min(
      Number(req.query.limit || 50),
      200
    );

    let query = `
      SELECT
        cs.id,
        cs.candidate_id,
        cs.question_id,
        cs.attempt_id,
        cs.language,
        cs.status,
        cs.passed_tests,
        cs.total_tests,
        cs.score,
        cs.created_at,
        cq.title AS problem_title
      FROM coding_submissions cs
      LEFT JOIN "CodingQuestion" cq
        ON cq.id = cs.question_id
      WHERE cs.candidate_id = $1
    `;

    const values = [
      candidateId,
    ];

    let counter = 2;

    if (attemptId) {
      query += `
        AND cs.attempt_id = $${counter}
      `;

      values.push(attemptId);
      counter++;
    }

    query += `
      ORDER BY cs.created_at DESC
      LIMIT $${counter}
    `;

    values.push(limit);

    const result = await pool.query(
      query,
      values
    );

    return res.json(result.rows);
  } catch (err) {
    console.error(
      "Failed to fetch coding submissions:",
      err
    );

    return res.status(500).json({
      error:
        "Failed to fetch submissions",
    });
  }
});

export default router;