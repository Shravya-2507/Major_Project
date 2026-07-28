import pool from "../config/db.js";
import { executeCode } from "../services/judgeService.js";

// ==============================
// Helper: Parse Filters (GET + POST support)
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

  // STRICT REQUIREMENT: Always limit to 3 questions at a time
  const limit = 3;

  return { candidateId, roleId, companyId, difficulty, syllabusIds, limit };
};

// ==============================
// 1. Get Non-Repeating Coding Questions (Limit 3)
// ==============================
export const getCodingQuestions = async (req, res) => {
  try {
    const { candidateId, roleId, companyId, difficulty, syllabusIds, limit } = parseFilters(req);

    // 1. Find all question IDs this candidate has already solved successfully
    const solvedRes = await pool.query(
      `SELECT DISTINCT question_id 
       FROM coding_submissions 
       WHERE candidate_id = $1 AND (status = 'ACCEPTED' OR status = 'AC' OR score = 100)`,
      [candidateId]
    );

    const solvedIds = solvedRes.rows.map((row) => row.question_id);

    // 2. Build dynamic query for CodingQuestion table
    let query = `
      SELECT id, title, description, difficulty, constraints, tags, sample_input, sample_output, sample_test_cases
      FROM "CodingQuestion"
      WHERE 1=1
    `;

    const values = [];
    let counter = 1;

    // Exclude already solved questions so they never repeat
    if (solvedIds.length > 0) {
      query += ` AND id != ANY($${counter++}::int[])`;
      values.push(solvedIds);
    }

    if (roleId) {
      query += ` AND role_id = $${counter++}`;
      values.push(roleId);
    }

    if (companyId) {
      query += ` AND (company_id = $${counter++} OR company_id IS NULL)`;
      values.push(companyId);
    }

    if (difficulty) {
      query += ` AND difficulty = $${counter++}`;
      values.push(difficulty);
    }

    if (syllabusIds?.length) {
      query += ` AND syllabus_id = ANY($${counter++}::int[])`;
      values.push(syllabusIds);
    }

    // Randomize and strictly limit results to 3
    query += ` ORDER BY RANDOM() LIMIT $${counter}`;
    values.push(limit);

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Congratulations! You have solved all available questions matching these filters.",
      });
    }

    res.json(result.rows);

  } catch (err) {
    console.error("Error fetching coding questions:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// ==============================
// 2. Evaluate / Run Coding Submissions
// ==============================
export const evaluateCodingAnswers = async (req, res) => {
  try {
    const { candidateId, submissions } = req.body;

    if (!candidateId || !submissions?.length) {
      return res.status(400).json({
        error: "candidateId and submissions are required",
      });
    }

    const results = [];

    for (const sub of submissions) {
      const dbRes = await pool.query(
        `SELECT sample_test_cases, hidden_test_cases 
         FROM "CodingQuestion" WHERE id = $1`,
        [sub.questionId]
      );

      const question = dbRes.rows[0];
      if (!question) continue;

      const testCases = [
        ...(question.sample_test_cases || []),
        ...(question.hidden_test_cases || [])
      ];

      if (testCases.length === 0) continue;

      let testResults = [];
      let passedCount = 0;

      for (let tc of testCases) {
        const response = await executeCode(sub.code, sub.language, tc.input);

        const output = response.stdout?.trim() || "";
        const expectedStr = String(tc.output).trim();
        const passed = output === expectedStr;

        if (passed) passedCount++;

        testResults.push({
          input: tc.input,
          expected: tc.output,
          output,
          error: response.stderr || null,
          passed,
        });
      }

      const totalTests = testCases.length;
      const score = Number(((passedCount / totalTests) * 100).toFixed(2));
      const status = passedCount === totalTests ? "ACCEPTED" : "FAILED";

      await pool.query(
        `INSERT INTO coding_submissions 
        (candidate_id, question_id, language, status, passed_tests, total_tests, score, code, results)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
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

      results.push({
        questionId: sub.questionId,
        status,
        passedCount,
        totalTests,
        score,
        results: testResults,
      });
    }

    res.json(results);

  } catch (err) {
    console.error("Error evaluating coding answers:", err);
    res.status(500).json({ error: "Code evaluation failed" });
  }
};