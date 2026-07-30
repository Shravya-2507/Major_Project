import { pool } from "../db.js";

/*
====================================
Dashboard Statistics
====================================
*/

export const getTotalUsers = async () => {
  const query = `
    SELECT COUNT(*) AS total_users
    FROM candidates;
  `;

  const { rows } = await pool.query(query);

  return rows[0];
};

export const getTotalTests = async () => {
  const query = `
    SELECT COUNT(*) AS total_tests
    FROM test_attempts;
  `;

  const { rows } = await pool.query(query);

  return rows[0];
};

export const getAverageScore = async () => {
  const query = `
    SELECT 
      COALESCE(ROUND(AVG(score), 2), 0) AS average_score
    FROM test_attempts;
  `;

  const { rows } = await pool.query(query);

  return rows[0];
};

export const getHighestScore = async () => {
  const query = `
    SELECT 
      COALESCE(MAX(score), 0) AS highest_score
    FROM test_attempts;
  `;

  const { rows } = await pool.query(query);

  return rows[0];
};

export const getLowestScore = async () => {
  const query = `
    SELECT 
      COALESCE(MIN(score), 0) AS lowest_score
    FROM test_attempts;
  `;

  const { rows } = await pool.query(query);

  return rows[0];
};

export const getActiveUsers = async () => {
  const query = `
    SELECT COUNT(DISTINCT candidate_id) AS active_users
    FROM test_attempts;
  `;

  const { rows } = await pool.query(query);

  return rows[0];
};

/*
====================================
Leaderboards
====================================
*/

export const getOverallLeaderboard = async () => {
  const query = `
    SELECT
      c.id,
      c.name,
      c.email,
      ROUND(AVG(t.score), 2) AS average_score,
      MAX(t.score) AS highest_score,
      COUNT(t.attempt_id) AS tests_attempted,
      RANK() OVER (
        ORDER BY AVG(t.score) DESC
      ) AS overall_rank
    FROM candidates c
    JOIN test_attempts t
      ON c.id = t.candidate_id
    GROUP BY c.id, c.name, c.email
    ORDER BY overall_rank;
  `;

  const { rows } = await pool.query(query);

  return rows;
};

export const getMonthlyLeaderboard = async () => {
  const query = `
    SELECT
      mr.ranking_id,
      mr.overall_rank,
      mr.ranking_month,
      mr.overall_score,
      mr.average_score,
      mr.tests_completed,
      c.id,
      c.name,
      c.email
    FROM monthly_rankings mr
    JOIN candidates c
      ON mr.candidate_id = c.id
    ORDER BY 
      mr.ranking_month DESC,
      mr.overall_rank ASC;
  `;

  const { rows } = await pool.query(query);

  return rows;
};

export const getWeeklyLeaderboard = async () => {
  const query = `
    SELECT
      c.id,
      c.name,
      c.email,
      ROUND(AVG(t.score), 2) AS average_score,
      COUNT(t.attempt_id) AS tests_attempted,
      RANK() OVER (
        ORDER BY AVG(t.score) DESC
      ) AS weekly_rank
    FROM candidates c
    JOIN test_attempts t
      ON c.id = t.candidate_id
    WHERE 
      t.completed_at >= CURRENT_DATE - INTERVAL '7 days'
    GROUP BY 
      c.id, c.name, c.email
    ORDER BY weekly_rank;
  `;

  const { rows } = await pool.query(query);

  return rows;
};

/*
====================================
Candidate Analytics
====================================
*/

export const getCandidateProfile = async (candidateId) => {
  const candidateQuery = `
    SELECT id, name, email
    FROM candidates
    WHERE id = $1
  `;

  const statsQuery = `
    SELECT
      COUNT(t.attempt_id) AS tests_attempted,
      COALESCE(ROUND(AVG(t.score), 2), 0) AS average_score,
      COALESCE(MAX(t.score), 0) AS highest_score,
      COALESCE(MIN(t.score), 0) AS lowest_score
    FROM test_attempts t
    WHERE t.candidate_id = $1
  `;

  const historyQuery = `
    SELECT
      attempt_id,
      test_type,
      score,
      total_questions,
      correct_answers,
      started_at,
      completed_at,
      duration_minutes
    FROM test_attempts
    WHERE candidate_id = $1
    ORDER BY completed_at DESC
  `;

  const subjectQuery = `
    SELECT
      s.subject_name,
      sp.average_score,
      sp.highest_score,
      sp.tests_taken,
      sp.last_updated
    FROM subject_performance sp
    JOIN vtu_subjects s ON sp.subject_id = s.id
    WHERE sp.candidate_id = $1
    ORDER BY sp.average_score DESC
  `;

  const [candidateRes, statsRes, historyRes, subjectRes] = await Promise.all([
    pool.query(candidateQuery, [candidateId]),
    pool.query(statsQuery, [candidateId]),
    pool.query(historyQuery, [candidateId]),
    pool.query(subjectQuery, [candidateId]),
  ]);

  return {
    candidate: candidateRes.rows[0] || null,
    stats: statsRes.rows[0] || {
      tests_attempted: 0,
      average_score: 0,
      highest_score: 0,
      lowest_score: 0,
    },
    history: historyRes.rows,
    subjectPerformance: subjectRes.rows,
  };
};

export const getCandidateTestHistory = async (candidateId) => {
  const query = `
    SELECT
      attempt_id,
      test_type,
      score,
      total_questions,
      correct_answers,
      started_at,
      completed_at,
      duration_minutes
    FROM test_attempts
    WHERE candidate_id = $1
    ORDER BY completed_at DESC;
  `;

  const { rows } = await pool.query(query, [candidateId]);

  return rows;
};

export const getSubjectPerformance = async (candidateId) => {
  const query = `
    SELECT
      s.subject_name,
      sp.average_score,
      sp.highest_score,
      sp.tests_taken,
      sp.last_updated
    FROM subject_performance sp
    JOIN vtu_subjects s
      ON sp.subject_id = s.id
    WHERE sp.candidate_id = $1
    ORDER BY sp.average_score DESC;
  `;

  const { rows } = await pool.query(query, [candidateId]);

  return rows;
};

/*
====================================
Statistics
====================================
*/

export const getRecentActivities = async () => {
  const query = `
    SELECT
      action,
      created_at
    FROM admin_logs
    ORDER BY created_at DESC
    LIMIT 20;
  `;

  const { rows } = await pool.query(query);

  return rows;
};

export const getTopPerformers = async () => {
  const query = `
    SELECT *
    FROM (
      SELECT
        c.id,
        c.name,
        ROUND(AVG(t.score), 2) AS average_score,
        RANK() OVER (
          ORDER BY AVG(t.score) DESC
        ) AS rank
      FROM candidates c
      JOIN test_attempts t
        ON c.id = t.candidate_id
      GROUP BY c.id, c.name
    ) ranked
    WHERE rank <= 5;
  `;

  const { rows } = await pool.query(query);

  return rows;
};

export const getBestSubject = async () => {
  const query = `
    SELECT
      s.subject_name,
      ROUND(AVG(sp.average_score), 2) AS score
    FROM subject_performance sp
    JOIN vtu_subjects s
      ON sp.subject_id = s.id
    GROUP BY s.subject_name
    ORDER BY score DESC
    LIMIT 1;
  `;

  const { rows } = await pool.query(query);

  return rows[0];
};

export const getWeakestSubject = async () => {
  const query = `
    SELECT
      s.subject_name,
      ROUND(AVG(sp.average_score), 2) AS score
    FROM subject_performance sp
    JOIN vtu_subjects s
      ON sp.subject_id = s.id
    GROUP BY s.subject_name
    ORDER BY score ASC
    LIMIT 1;
  `;

  const { rows } = await pool.query(query);

  return rows[0];
};