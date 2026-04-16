import pool from "../config/db.js";
import { evaluateAnswer } from "../services/evaluationService.js";
import axios from "axios";

const AI_API = process.env.AI_API_URL || "http://localhost:8000";

// ==============================
// 1. Evaluate Answers
// ==============================
export const evaluateAnswers = async (req, res) => {
  try {
    const { candidateId, answers, roleId, companyId } = req.body;

    // ✅ Validation
    if (!candidateId || !answers?.length) {
      return res.status(400).json({
        error: "candidateId and answers are required",
      });
    }

    // ✅ Unique sessionId
    const sessionId = `${candidateId}-${Date.now()}`;

    const results = [];
    let totalSum = 0;

    // Default names
    let selectedRoleName = "Academic/VTU";
    let selectedCompanyName = "General Practice";

    // Fetch role name
    if (roleId) {
      const roleRes = await pool.query(
        "SELECT role_name FROM roles WHERE id = $1",
        [roleId]
      );
      selectedRoleName = roleRes.rows[0]?.role_name || selectedRoleName;
    }

    // Fetch company name
    if (companyId) {
      const compRes = await pool.query(
        "SELECT company_name FROM companies WHERE id = $1",
        [companyId]
      );
      selectedCompanyName =
        compRes.rows[0]?.company_name || selectedCompanyName;
    }

    // ✅ Fetch all expected answers in one query (performance optimization)
    const questionIds = answers.map((a) => a.questionId);

    const questionData = await pool.query(
      `SELECT id, expected_answer FROM questions WHERE id = ANY($1)`,
      [questionIds]
    );

    const questionMap = {};
    questionData.rows.forEach((q) => {
      questionMap[q.id] = q.expected_answer;
    });

    // ==============================
    // Loop through answers
    // ==============================
    for (const ans of answers) {
      const expected = questionMap[ans.questionId] || "";

      const aiData = await evaluateAnswer(
        ans.answerText,
        expected,
        selectedRoleName,
        selectedCompanyName
      );

      // Save to DB
      await pool.query(
        `INSERT INTO answers 
        (candidate_id, question_id, answer_text, ai_score, ai_feedback, session_id, semantic_score, smith_score, role_id, company_id) 
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          candidateId,
          ans.questionId,
          ans.answerText,
          aiData.final_score || 0,
          aiData.result || "",
          sessionId,
          aiData.semantic_score || 0,
          aiData.smith_score || 0,
          roleId || null,
          companyId || null,
        ]
      );

      results.push({
        questionId: ans.questionId,
        role: selectedRoleName,
        company: selectedCompanyName,
        final_score: aiData.final_score || 0,
        result: aiData.result || "",
      });

      totalSum += parseFloat(aiData.final_score || 0);
    }

    // ✅ Correct average calculation
    const overallScore =
      results.length > 0
        ? (totalSum / results.length).toFixed(2)
        : 0;

    // Save summary report
    await pool.query(
      `INSERT INTO candidate_reports (candidate_id, session_id, total_score) 
       VALUES ($1,$2,$3)`,
      [candidateId, sessionId, overallScore]
    );

    res.json({
      sessionId,
      overallScore: parseFloat(overallScore),
      results,
    });

  } catch (err) {
    console.error("Evaluation Error:", err);
    res.status(500).json({ error: "Evaluation failed" });
  }
};

// ==============================
// 2. Generate Final Report (Topic Analysis)
// ==============================
export const generateFinalReport = async (req, res) => {
  try {
    const { candidateId } = req.params;
    const { sessionId } = req.query;

    // ✅ Validate
    if (!candidateId) {
      return res.status(400).json({ error: "candidateId required" });
    }

    let targetSession = sessionId;

    // If no sessionId, fetch latest
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
        error: "No sessions found for this candidate",
      });
    }

    // ==============================
    // Fetch data for analysis
    // ==============================
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
        error: "No answers found for this session",
      });
    }

    const questionsForAI = dbData.rows.map((r) => ({
      question: r.question_text,
      answer: r.expected_answer,
      topic: r.topic,
    }));

    // ==============================
    // Call AI for topic analysis
    // ==============================
    const analysisResponse = await axios.post(
      `${AI_API}/analyze-topics`,
      {
        questions: questionsForAI,
        user_answers: dbData.rows.map((r) => r.answer_text),
      }
    );

    const report = analysisResponse.data;

    // ==============================
    // Calculate total score safely
    // ==============================
    const avgValues = Object.values(report.topic_average || {});
    const totalScore =
      avgValues.length > 0
        ? (
            avgValues.reduce((a, b) => a + b, 0) / avgValues.length
          ).toFixed(2)
        : 0;

    // ==============================
    // Save / Update report
    // ==============================
    const savedReport = await pool.query(
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
      report: savedReport.rows[0],
    });

  } catch (err) {
    console.error("Analysis Error:", err);
    res.status(500).json({ error: "Analysis failed" });
  }
};