import pool from "../config/db.js";
import { executeCode } from "../services/judgeService.js";

// ==============================
// Helper: Parse Filters
// ==============================
const parseFilters = (req) => {
  const source = req.method === "POST" ? req.body : req.query;

  const candidateId = source.candidate_id ? Number(source.candidate_id) : 1;
  const roleId = source.role_id ? Number(source.role_id) : null;
  const companyId = source.company_id ? Number(source.company_id) : null;
  const difficulty = source.difficulty ? String(source.difficulty) : null;

  const syllabusIds = source.syllabus_ids
    ? Array.isArray(source.syllabus_ids)
      ? source.syllabus_ids.map(Number)
      : String(source.syllabus_ids).split(",").map(Number)
    : null;

  // Always provide 3 questions
  const limit = 3;

  return {
    candidateId,
    roleId,
    companyId,
    difficulty,
    syllabusIds,
    limit,
  };
};

// ==============================
// Get Non-Repeating Questions
// ==============================
export const getCodingQuestions = async (req, res) => {
  try {
    const {
      candidateId,
      roleId,
      companyId,
      difficulty,
      syllabusIds,
      limit,
    } = parseFilters(req);

    // Fetch already solved questions by the candidate
    const solvedResult = await pool.query(
      `
      SELECT DISTINCT question_id
      FROM coding_submissions
      WHERE candidate_id = $1
      AND status = 'ACCEPTED'
      `,
      [candidateId]
    );

    const solvedIds = solvedResult.rows.map((row) => row.question_id);

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
        "sampleTestCases"
      FROM "CodingQuestion"
      WHERE 1=1
    `;

    let values = [];
    let index = 1;

    // Exclude already solved questions
    if (solvedIds.length > 0) {
      query += ` AND id != ALL($${index}::int[])`;
      values.push(solvedIds);
      index++;
    }

    if (roleId) {
      query += ` AND role_id = $${index}`;
      values.push(roleId);
      index++;
    }

    if (companyId) {
      query += ` AND (company_id = $${index} OR company_id IS NULL)`;
      values.push(companyId);
      index++;
    }

    if (difficulty) {
      query += ` AND difficulty = $${index}`;
      values.push(difficulty);
      index++;
    }

    if (syllabusIds?.length) {
      query += ` AND syllabus_id = ANY($${index}::int[])`;
      values.push(syllabusIds);
      index++;
    }

    query += ` ORDER BY RANDOM() LIMIT $${index}`;
    values.push(limit);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.json({
        completed: true,
        message: "Congratulations! You have solved all available coding questions.",
        newQuestionsAdded: false,
      });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Get Coding Questions Error:", err);
    res.status(500).json({
      error: "Failed to load coding questions",
    });
  }
};

// ==============================
// Submit Coding Answer
// ==============================
export const evaluateCodingAnswers = async (req, res) => {
  try {
    const { candidateId, submissions } = req.body;

    if (!candidateId || !submissions?.length) {
      return res.status(400).json({
        error: "candidateId and submissions required",
      });
    }

    let finalResults = [];

    for (const sub of submissions) {
      // Fetch test cases from database (Hidden cases never leave backend)
      const questionResult = await pool.query(
        `
        SELECT
          "sampleTestCases",
          "hiddenTestCases"
        FROM "CodingQuestion"
        WHERE id = $1
        `,
        [sub.questionId]
      );

      const question = questionResult.rows[0];
      if (!question) continue;

      const testCases = [
        ...(question.sampleTestCases || []),
        ...(question.hiddenTestCases || []),
      ];

      let passedCount = 0;
      let testResults = [];

      for (const tc of testCases) {
        const execution = await executeCode(
          sub.code,
          sub.language,
          tc.input
        );

        const output = execution.stdout?.trim() || "";
        const expected = String(tc.output).trim();
        const passed = output === expected;

        if (passed) passedCount++;

        testResults.push({
          input: tc.input,
          expected: tc.output,
          output,
          error: execution.stderr || null,
          passed,
        });
      }

      const totalTests = testCases.length;
      const score = Number(((passedCount / totalTests) * 100).toFixed(2));
      const status = passedCount === totalTests ? "ACCEPTED" : "FAILED";

      // Save submission to database
      await pool.query(
        `
        INSERT INTO coding_submissions (
          candidate_id,
          question_id,
          language,
          status,
          passed_tests,
          total_tests,
          score,
          code,
          results
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        `,
        [
          candidateId,
          sub.questionId,
          sub.language,
          status,
          passedCount,
          totalTests,
          score,
          sub.code,
          JSON.stringify(testResults),
        ]
      );

      finalResults.push({
        questionId: sub.questionId,
        status,
        passedCount,
        totalTests,
        score,
        results: testResults,
      });
    }

    res.json({
      success: true,
      results: finalResults,
    });
  } catch (err) {
    console.error("Evaluation Error:", err);
    res.status(500).json({
      error: "Code evaluation failed",
    });
  }
};
