import pool from "../config/db.js";
import { evaluateAnswer } from "../services/evaluationService.js";
import axios from "axios";

const AI_API = process.env.AI_API_URL || "http://localhost:8000";

// ==============================
// 1. Evaluate Answers (FINAL FIX)
// ==============================
export const evaluateAnswers = async (req, res) => {
  const client = await pool.connect();

  try {
    console.log("🚀 API HIT");

    const { candidateId, answers, roleId, companyId } = req.body;

    if (!candidateId || !answers?.length) {
      return res.status(400).json({
        error: "candidateId and answers are required",
      });
    }

    // ✅ FIXED session id (no collision)
    const sessionId = `${candidateId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await client.query("BEGIN");

    let selectedRoleName = "Academic/VTU";
    let selectedCompanyName = "General Practice";

    // Fetch role
    if (roleId) {
      const roleRes = await client.query(
        "SELECT role_name FROM roles WHERE id = $1",
        [roleId]
      );
      selectedRoleName = roleRes.rows[0]?.role_name || selectedRoleName;
    }

    // Fetch company
    if (companyId) {
      const compRes = await client.query(
        "SELECT company_name FROM companies WHERE id = $1",
        [companyId]
      );
      selectedCompanyName =
        compRes.rows[0]?.company_name || selectedCompanyName;
    }

    // Fetch expected answers
    const questionIds = answers.map((a) => a.questionId);

    const questionData = await client.query(
      `SELECT id, expected_answer FROM questions WHERE id = ANY($1)`,
      [questionIds]
    );

    const questionMap = {};
    questionData.rows.forEach((q) => {
      questionMap[q.id] = q.expected_answer;
    });

    const results = [];
    let totalSum = 0;

    // ==============================
    // LOOP
    // ==============================
    for (const ans of answers) {
      console.log("👉 Processing Question:", ans.questionId);

      const expected = questionMap[ans.questionId] || "";

      const aiData = await evaluateAnswer(
        ans.answerText,
        expected,
        selectedRoleName,
        selectedCompanyName
      );

      // ✅ SAFE VALUES (NO NaN EVER)
      const finalScore = Number(aiData.final_score ?? aiData.score ?? 0) || 0;
      const feedback = aiData.result ?? aiData.feedback ?? "";

      const semantic = Number(aiData.semantic_score) || 0;
      const smith = Number(aiData.smith_score) || 0;

      // ✅ INSERT ANSWER
      const inserted = await client.query(
        `INSERT INTO answers 
        (candidate_id, question_id, answer_text, ai_score, ai_feedback, session_id, semantic_score, smith_score, role_id, company_id) 
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
        RETURNING *`,
        [
          candidateId,
          ans.questionId,
          ans.answerText,
          finalScore,
          feedback,
          sessionId,
          semantic,
          smith,
          roleId || null,
          companyId || null,
        ]
      );

      console.log("✅ INSERTED:", inserted.rows[0]);

      results.push({
        questionId: ans.questionId,
        role: selectedRoleName,
        company: selectedCompanyName,
        final_score: finalScore,
        result: feedback,
      });

      totalSum += finalScore;
    }

    // ✅ SAFE AVERAGE (NO NaN)
    let overallScore =
      results.length > 0 ? totalSum / results.length : 0;

    overallScore = Number(overallScore.toFixed(2)) || 0;

    // ✅ UPSERT REPORT (NO CRASH)
    await client.query(
      `INSERT INTO candidate_reports (candidate_id, session_id, total_score) 
       VALUES ($1,$2,$3)
       ON CONFLICT (session_id) DO UPDATE
       SET total_score = EXCLUDED.total_score`,
      [candidateId, sessionId, overallScore]
    );

    await client.query("COMMIT");

    console.log("✅ REPORT SAVED");

    res.json({
      sessionId,
      overallScore,
      results,
    });

  } catch (err) {
    await client.query("ROLLBACK");
    console.error("❌ Evaluation Error FULL:", err);

    res.status(500).json({ error: "Evaluation failed" });

  } finally {
    client.release();
  }
};



// ==============================
// 2. Generate Final Report
// ==============================
export const generateFinalReport = async (req, res) => {
  try {
    console.log("🔥 ANALYZE ROUTE HIT");

    const { candidateId } = req.params;
    const { sessionId } = req.query;

    if (!candidateId) {
      return res.status(400).json({ error: "candidateId required" });
    }

    let targetSession = sessionId;

    // Get latest session if not provided
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
        error: "No sessions found",
      });
    }

    // Fetch answers
    const dbData = await pool.query(
      `SELECT q.question_text, q.expected_answer, a.answer_text, 
              COALESCE(sub.subject_name, 'General Technical') as topic
       FROM answers a
       JOIN questions q ON a.question_id = q.id
       LEFT JOIN vtu_syllabus s ON q.syllabus_id = s.id
       LEFT JOIN vtu_subjects sub ON s.subject_id = sub.id
       WHERE a.candidate_id = $1 AND a.session_id = $2`,
      [candidateId, targetSession]
    );

    if (dbData.rows.length === 0) {
      return res.status(404).json({
        error: "No answers found",
      });
    }

    // AI analysis
    const analysisResponse = await axios.post(
      `${AI_API}/analyze-topics`,
      {
        questions: dbData.rows.map((r) => ({
          question: r.question_text,
          answer: r.expected_answer,
          topic: r.topic,
        })),
        user_answers: dbData.rows.map((r) => r.answer_text),
      }
    );

    const report = analysisResponse.data;

    const avgValues = Object.values(report.topic_average || {});

    let totalScore =
      avgValues.length > 0
        ? avgValues.reduce((a, b) => a + b, 0) / avgValues.length
        : 0;

    totalScore = Number(totalScore.toFixed(2)) || 0;

    // ✅ UPSERT FINAL REPORT
    const saved = await pool.query(
      `INSERT INTO candidate_reports 
        (candidate_id, session_id, topic_averages, classifications, pagerank_importance, total_score) 
        VALUES ($1,$2,$3,$4,$5,$6) 
        ON CONFLICT (session_id) DO UPDATE SET 
          total_score = EXCLUDED.total_score,
          topic_averages = EXCLUDED.topic_averages,
          classifications = EXCLUDED.classifications,
          pagerank_importance = EXCLUDED.pagerank_importance
        RETURNING *`,
      [
        candidateId,
        targetSession,
        JSON.stringify(report.topic_average || {}),
        JSON.stringify(report.classification || {}),
        JSON.stringify(report.pagerank || {}),
        totalScore,
      ]
    );

    res.json({
      message: "Analysis successful",
      report: saved.rows[0],
    });

  } catch (err) {
    console.error("❌ Analysis Error FULL:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
};