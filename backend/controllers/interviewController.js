import pool from "../config/db.js";

import {
  evaluateAnswer,
  generateQuestion,
} from "../services/evaluationService.js";

import { updateMonthlyRanking } from "../services/rankingService.js";
import { updateSubjectPerformance } from "../services/performanceService.js";

// ==============================
// Generate AI Interview Question
// ==============================

export const generateQuestions = async (req, res) => {
  try {
    const {
      role,
      company = "General",
      topic,
      question_type = "Technical",
      category = "Conceptual",
      history = [],
      candidateId = null,
    } = req.body;

    if (!role || !topic) {
      return res.status(400).json({
        error: "role and topic are required",
      });
    }

    // Generate personalized question using AI
    const aiResponse = await generateQuestion({
      role,
      company,
      topic,
      question_type,
      category,
      history,
    });

    const generated = aiResponse.question;

    console.log("========== AI RESPONSE ==========");
    console.dir(aiResponse, { depth: null });
    console.log("================================");

    // ==============================
    // Fetch Role ID
    // ==============================

    let roleId = null;

    const roleResult = await pool.query(
      `SELECT id
       FROM roles
       WHERE LOWER(role_name) = LOWER($1)
       LIMIT 1`,
      [role]
    );

    if (roleResult.rows.length > 0) {
      roleId = roleResult.rows[0].id;
    }

    // ==============================
    // Fetch Company ID
    // ==============================

    let companyId = null;

    if (company && company !== "General") {
      const companyResult = await pool.query(
        `SELECT id
         FROM companies
         WHERE LOWER(company_name) = LOWER($1)
         LIMIT 1`,
        [company]
      );

      if (companyResult.rows.length > 0) {
        companyId = companyResult.rows[0].id;
      }
    }

    // ==============================
    // Save AI Generated Question
    // ==============================

    const insertResult = await pool.query(
      `
      INSERT INTO questions
      (
        question_text,
        role_id,
        company_id,
        difficulty_level,
        question_type,
        expected_answer,
        generated_by,
        category,
        created_for_candidate,
        ai_difficulty
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING id
      `,
      [
        generated.question,
        roleId,
        companyId,
        generated.difficulty?.toLowerCase() || "medium",
        question_type.toLowerCase(),
        null,
        "AI",
        category,
        candidateId,
        generated.difficulty || "Medium",
      ]
    );

    const questionId = insertResult.rows[0].id;

    return res.status(200).json({
      success: true,
      question_id: questionId,
      question: generated.question,
      difficulty: generated.difficulty,
      topic: generated.topic,
      company: generated.company,
      role: generated.role,
      category,
      question_type,
    });
  } catch (error) {
    console.error("AI Question Generation Error:", error);

    return res.status(500).json({
      success: false,
      error: "Question generation failed",
      details: error.message,
      stack: error.stack,
    });
  }
};

// ==============================
// Evaluate Interview
// ==============================

export const evaluateInterview = async (req, res) => {
  try {
    const candidateId = Number(
      req.body.candidateId || req.user?.id
    );

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

    // ==============================
    // Load Question Information
    // ==============================

    for (const ans of answers) {
      const questionResult = await pool.query(
        `SELECT
            id,
            expected_answer,
            syllabus_id
         FROM questions
         WHERE id = $1`,
        [ans.questionId]
      );

      if (questionResult.rows.length > 0) {
        questionMap[ans.questionId] =
          questionResult.rows[0];
      }
    }

    // ==============================
    // Get Role Name
    // ==============================

    const roleName = roleId
      ? (
          await pool.query(
            "SELECT role_name FROM roles WHERE id = $1",
            [roleId]
          )
        ).rows[0]?.role_name || "General"
      : "General";

    // ==============================
    // Get Company Name
    // ==============================

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

    // ==============================
    // Evaluate Each Answer
    // ==============================

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
        Number(
          aiData.final_score ??
          aiData.score ??
          0
        ) || 0;

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

    // ==============================
    // Calculate Overall Score
    // ==============================

    const overallScore =
      Number(
        (totalScore / answers.length).toFixed(2)
      ) || 0;

    // ==============================
    // Calculate Duration
    // ==============================

    const startedDate = startedAt
      ? new Date(startedAt)
      : new Date();

    const completedAt = new Date();

    const durationMinutes = Math.max(
      0,
      Math.round(
        (completedAt - startedDate) / 60000
      )
    );

    // ==============================
    // Save Test Attempt
    // ==============================

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

    // ==============================
    // Update Monthly Ranking
    // ==============================

    await updateMonthlyRanking(
      candidateId,
      overallScore
    );

    return res.json({
      success: true,
      sessionId,
      overallScore,
      results,
      attemptId:
        attemptResult.rows[0]?.attempt_id,
    });
  } catch (err) {
    console.error(
      "Interview evaluation error",
      err
    );

    return res.status(500).json({
      error: "Evaluation failed",
      details:
        err.message || "Unknown error",
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

    if (!targetSession) {
      const latest = await pool.query(
        `SELECT session_id
         FROM answers
         WHERE candidate_id = $1
         ORDER BY created_at DESC
         LIMIT 1`,
        [candidateId]
      );

      targetSession =
        latest.rows[0]?.session_id;
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
                (sum, row) =>
                  sum +
                  Number(row.ai_score || 0),
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
    console.error(
      "Analysis error",
      err
    );

    return res.status(500).json({
      error: "Analysis failed",
    });
  }
};