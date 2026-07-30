import { pool } from "../db.js";
import { evaluateAnswer } from "../services/evaluationService.js";
import { updateMonthlyRanking } from "../services/rankingService.js";
import { updateSubjectPerformance } from "../services/performanceService.js";

// ==============================
// Generate Questions
// ==============================
export const generateQuestions = async (req, res) => {
  try {
    const { roleId, companyId, syllabusIds, limit = 5 } = req.body;

    let query = `
      SELECT id,
             question_text,
             syllabus_id,
             role_id,
             company_id
      FROM questions
      WHERE 1=1
    `;

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

    return res.json(result.rows);
  } catch (err) {
    console.error("Question fetch error", err);

    return res.status(500).json({
      error: "Failed to load questions",
    });
  }
};

// ==============================
// Evaluate Interview
// ==============================
export const evaluateInterview = async (req, res) => {
  try {
    const candidateId = Number(req.body.candidateId || req.user?.id);

    const {
      answers = [],
      roleId,
      companyId,
      testType = "interview",
      startedAt,
    } = req.body;

    if (!candidateId || !answers.length) {
      return res.status(400).json({
        error: "candidateId and answers are required",
      });
    }

    const sessionId = `session-${candidateId}-${Date.now()}`;

    const questionMap = {};

    for (const ans of answers) {
      const questionResult = await pool.query(
        `SELECT id,
                expected_answer,
                syllabus_id
         FROM questions
         WHERE id = $1`,
        [ans.questionId]
      );

      if (questionResult.rows.length > 0) {
        questionMap[ans.questionId] = questionResult.rows[0];
      }
    }

    const roleName = roleId
      ? (
          await pool.query(
            "SELECT role_name FROM roles WHERE id = $1",
            [roleId]
          )
        ).rows[0]?.role_name || "General"
      : "General";

    const companyName = companyId
      ? (
          await pool.query(
            "SELECT company_name FROM companies WHERE id = $1",
            [companyId]
          )
        ).rows[0]?.company_name || "General"
      : "General";

    const results = [];
    let totalScore = 0;
    let correctAnswers = 0;

    for (const ans of answers) {
      const expected =
        questionMap[ans.questionId]?.expected_answer || "";

      const aiData = await evaluateAnswer(
        ans.answerText,
        expected,
        roleName,
        companyName
      );

      const finalScore =
        Number(aiData.final_score ?? aiData.score ?? 0) || 0;

      const feedback =
        aiData.result ??
        aiData.feedback ??
        "No feedback";

      await pool.query(
        `INSERT INTO answers
        (
          candidate_id,
          question_id,
          answer_text,
          ai_score,
          ai_feedback,
          session_id,
          role_id,
          company_id
        )
        VALUES
        (
          $1,$2,$3,$4,$5,$6,$7,$8
        )`,
        [
          candidateId,
          ans.questionId,
          ans.answerText,
          finalScore,
          feedback,
          sessionId,
          roleId || null,
          companyId || null,
        ]
      );

      results.push({
        questionId: ans.questionId,
        final_score: finalScore,
        result: feedback,
      });

      totalScore += finalScore;

      if (finalScore >= 7) {
        correctAnswers++;
      }

      await updateSubjectPerformance(
        candidateId,
        finalScore,
        ans.questionId
      );
    }

    const overallScore =
      Number((totalScore / answers.length).toFixed(2)) || 0;

    const startedDate = startedAt
      ? new Date(startedAt)
      : new Date();

    const completedAt = new Date();

    const durationMinutes = Math.max(
      0,
      Math.round((completedAt - startedDate) / 60000)
    );

    const attemptResult = await pool.query(
      `INSERT INTO test_attempts
      (
        candidate_id,
        test_type,
        company_id,
        score,
        total_questions,
        correct_answers,
        started_at,
        completed_at,
        duration_minutes
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      )
      RETURNING attempt_id`,
      [
        candidateId,
        testType,
        companyId || null,
        overallScore,
        answers.length,
        correctAnswers,
        startedDate,
        completedAt,
        durationMinutes,
      ]
    );

    await updateMonthlyRanking(
      candidateId,
      overallScore
    );

    return res.json({
      success: true,
      sessionId,
      overallScore,
      results,
      attemptId: attemptResult.rows[0]?.attempt_id,
    });
  } catch (err) {
    console.error("Interview evaluation error", err);

    return res.status(500).json({
      error: "Evaluation failed",
      details: err.message || "Unknown error",
      stack: err.stack || null,
    });
  }
};
// ==============================
// Generate Interview Report
// ==============================
export const generateReport = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { sessionId } = req.query;

    let targetSession = sessionId;

    // If no sessionId is provided, use the latest session
    if (!targetSession) {
      const latest = await pool.query(
        `SELECT session_id
         FROM answers
         WHERE candidate_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [candidateId]
      );

      targetSession = latest.rows[0]?.session_id;
    }

    if (!targetSession) {
      return res.status(404).json({
        error: "No session found",
      });
    }

    const result = await pool.query(
      `SELECT
          q.question_text,
          a.answer_text,
          a.ai_score,
          a.ai_feedback
       FROM answers a
       JOIN questions q
         ON q.id = a.question_id
       WHERE a.candidate_id = $1
         AND a.session_id = $2`,
      [candidateId, targetSession]
    );

    const answers = result.rows;

    const average =
      answers.length > 0
        ? Number(
            (
              answers.reduce(
                (sum, row) => sum + Number(row.ai_score || 0),
                0
              ) / answers.length
            ).toFixed(2)
          )
        : 0;

    return res.json({
      report: {
        total_score: average,

        topic_averages: {
          Overall: average,
        },

        classifications: {
          Overall:
            average >= 70
              ? "Expert"
              : average >= 40
              ? "Intermediate"
              : "Beginner",
        },
      },

      answers,
    });
  } catch (err) {
    console.error("Analysis error", err);

    return res.status(500).json({
      error: "Analysis failed",
    });
  }
};