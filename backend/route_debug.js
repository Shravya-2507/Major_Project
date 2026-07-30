import dotenv from 'dotenv';
dotenv.config();
import { pool } from './db.js';
import { evaluateAnswer } from './services/evaluationService.js';

const candidateId = 14;
const answers = [{ questionId: 1, answerText: 'I am ready to learn.' }];
const roleId = 1;
const companyId = 1;
const testType = 'interview';
const startedAt = new Date().toISOString();

const getSubjectIdForQuestion = async (questionId) => {
  const result = await pool.query(
    `SELECT s.subject_id
     FROM questions q
     LEFT JOIN vtu_syllabus s ON q.syllabus_id = s.id
     WHERE q.id = $1`,
    [questionId]
  );
  return result.rows[0]?.subject_id || null;
};

const updateMonthlyRanking = async (candidateId, score) => {
  const now = new Date();
  const monthKey = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1)).toISOString().slice(0, 10);
  console.log('monthKey', monthKey);
  const existing = await pool.query(
    `SELECT ranking_id FROM monthly_rankings WHERE candidate_id = $1 AND ranking_month = $2::date`,
    [candidateId, monthKey]
  );
  console.log('existing', existing.rows);
  const totalTests = await pool.query(
    `SELECT COUNT(*)::int AS tests_completed FROM test_attempts WHERE candidate_id = $1`,
    [candidateId]
  );
  console.log('totalTests', totalTests.rows);
  const averageScore = await pool.query(
    `SELECT COALESCE(ROUND(AVG(score), 2), 0)::float AS average_score FROM test_attempts WHERE candidate_id = $1`,
    [candidateId]
  );
  console.log('averageScore', averageScore.rows);
  const allRows = await pool.query(
    `SELECT candidate_id, COALESCE(ROUND(AVG(score), 2), 0)::float AS average_score
     FROM test_attempts
     GROUP BY candidate_id`
  );
  console.log('allRows', allRows.rows);
  const ranked = allRows.rows
    .sort((a, b) => b.average_score - a.average_score || a.candidate_id - b.candidate_id)
    .map((row, index) => ({ ...row, overall_rank: index + 1 }));
  const currentRank = ranked.find((row) => row.candidate_id === candidateId)?.overall_rank || ranked.length + 1;
  console.log('ranked', ranked, 'currentRank', currentRank);
  const payload = {
    overall_score: Number(score),
    average_score: Number(averageScore.rows[0]?.average_score || 0),
    tests_completed: Number(totalTests.rows[0]?.tests_completed || 0),
    overall_rank: Number(currentRank),
  };
  if (existing.rows.length > 0) {
    await pool.query(`UPDATE monthly_rankings SET overall_score = $3, average_score = $4, tests_completed = $5, overall_rank = $6 WHERE candidate_id = $1 AND ranking_month = $2::date`, [candidateId, monthKey, payload.overall_score, payload.average_score, payload.tests_completed, payload.overall_rank]);
  } else {
    await pool.query(`INSERT INTO monthly_rankings (candidate_id, ranking_month, overall_score, average_score, tests_completed, overall_rank) VALUES ($1, $2, $3, $4, $5, $6)`, [candidateId, monthKey, payload.overall_score, payload.average_score, payload.tests_completed, payload.overall_rank]);
  }
};

const updateSubjectPerformance = async (candidateId, score, questionId) => {
  const subjectId = await getSubjectIdForQuestion(questionId);
  console.log('subjectId', subjectId);
  if (!subjectId) return;
  const existing = await pool.query(`SELECT average_score, highest_score, tests_taken FROM subject_performance WHERE candidate_id = $1 AND subject_id = $2`, [candidateId, subjectId]);
  const numericScore = Number(score) || 0;
  if (existing.rows.length > 0) {
    const row = existing.rows[0];
    const totalTests = Number(row.tests_taken || 0) + 1;
    const newAverage = Number(((Number(row.average_score || 0) * Number(row.tests_taken || 0)) + numericScore) / totalTests).toFixed(2);
    const newHighest = Math.max(Number(row.highest_score || 0), numericScore);
    await pool.query(`UPDATE subject_performance SET average_score = $3, highest_score = $4, tests_taken = $5, last_updated = NOW() WHERE candidate_id = $1 AND subject_id = $2`, [candidateId, subjectId, newAverage, newHighest, totalTests]);
  } else {
    await pool.query(`INSERT INTO subject_performance (candidate_id, subject_id, average_score, highest_score, tests_taken, last_updated) VALUES ($1, $2, $3, $4, $5, NOW())`, [candidateId, subjectId, numericScore, numericScore, 1]);
  }
};

try {
  console.log('step1');
  const roleName = roleId ? (await pool.query('SELECT role_name FROM roles WHERE id = $1', [roleId])).rows[0]?.role_name || 'General' : 'General';
  const companyName = companyId ? (await pool.query('SELECT company_name FROM companies WHERE id = $1', [companyId])).rows[0]?.company_name || 'General' : 'General';
  console.log('role/company', roleName, companyName);
  const sessionId = `session-${candidateId}-${Date.now()}`;
  const questionMap = {};
  for (const ans of answers) {
    const questionResult = await pool.query('SELECT id, expected_answer, syllabus_id FROM questions WHERE id = $1', [ans.questionId]);
    if (questionResult.rows[0]) questionMap[ans.questionId] = questionResult.rows[0];
  }
  console.log('questionMap', questionMap);
  let totalScore = 0;
  let correctAnswers = 0;
  const results = [];
  for (const ans of answers) {
    const expected = questionMap[ans.questionId]?.expected_answer || '';
    const aiData = await evaluateAnswer(ans.answerText, expected, roleName, companyName);
    const finalScore = Number(aiData.final_score ?? aiData.score ?? 0) || 0;
    const feedback = aiData.result ?? aiData.feedback ?? 'No feedback';
    console.log('aiData', aiData);
    await pool.query(`INSERT INTO answers (candidate_id, question_id, answer_text, ai_score, ai_feedback, session_id, role_id, company_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [candidateId, ans.questionId, ans.answerText, finalScore, feedback, sessionId, roleId || null, companyId || null]);
    results.push({ questionId: ans.questionId, final_score: finalScore, result: feedback });
    totalScore += finalScore;
    if (finalScore >= 7) correctAnswers += 1;
    await updateSubjectPerformance(candidateId, finalScore, ans.questionId);
  }
  const overallScore = Number((totalScore / answers.length).toFixed(2)) || 0;
  const startedDate = startedAt ? new Date(startedAt) : new Date();
  const completedAt = new Date();
  const durationMinutes = Math.max(0, Math.round((completedAt - startedDate) / 60000));
  const attemptResult = await pool.query(`INSERT INTO test_attempts (candidate_id, test_type, company_id, score, total_questions, correct_answers, started_at, completed_at, duration_minutes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING attempt_id`, [candidateId, testType, companyId || null, overallScore, answers.length, correctAnswers, startedDate, completedAt, durationMinutes]);
  console.log('attemptResult', attemptResult.rows[0]);
  await updateMonthlyRanking(candidateId, overallScore);
  console.log('done');
} catch (err) {
  console.error(err);
  console.error(err.stack);
} finally {
  await pool.end();
}
