import { pool } from "../db.js";

// ==============================
// Update Monthly Ranking
// ==============================
export const updateMonthlyRanking = async (candidateId, score) => {
  const now = new Date();

  const monthKey = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), 1)
  )
    .toISOString()
    .slice(0, 10);

  // Check if ranking already exists
  const existing = await pool.query(
    `SELECT ranking_id
     FROM monthly_rankings
     WHERE candidate_id = $1
       AND ranking_month = $2::date`,
    [candidateId, monthKey]
  );

  // Total tests completed
  const totalTests = await pool.query(
    `SELECT COUNT(*)::int AS tests_completed
     FROM test_attempts
     WHERE candidate_id = $1`,
    [candidateId]
  );

  // Average score
  const averageScore = await pool.query(
    `SELECT COALESCE(ROUND(AVG(score), 2), 0)::float AS average_score
     FROM test_attempts
     WHERE candidate_id = $1`,
    [candidateId]
  );

  // Get all candidates for ranking
  const allRows = await pool.query(
    `SELECT candidate_id,
            COALESCE(ROUND(AVG(score), 2), 0)::float AS average_score
     FROM test_attempts
     GROUP BY candidate_id`
  );

  // Calculate ranking
  const ranked = allRows.rows
    .sort(
      (a, b) =>
        b.average_score - a.average_score ||
        a.candidate_id - b.candidate_id
    )
    .map((row, index) => ({
      ...row,
      overall_rank: index + 1,
    }));

  const currentRank =
    ranked.find((row) => row.candidate_id === candidateId)?.overall_rank ||
    ranked.length + 1;

  const payload = {
    overall_score: Number(score),
    average_score: Number(
      averageScore.rows[0]?.average_score || 0
    ),
    tests_completed: Number(
      totalTests.rows[0]?.tests_completed || 0
    ),
    overall_rank: Number(currentRank),
  };

  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE monthly_rankings
       SET overall_score = $3,
           average_score = $4,
           tests_completed = $5,
           overall_rank = $6
       WHERE candidate_id = $1
         AND ranking_month = $2::date`,
      [
        candidateId,
        monthKey,
        payload.overall_score,
        payload.average_score,
        payload.tests_completed,
        payload.overall_rank,
      ]
    );
  } else {
    await pool.query(
      `INSERT INTO monthly_rankings
      (
        candidate_id,
        ranking_month,
        overall_score,
        average_score,
        tests_completed,
        overall_rank
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6
      )`,
      [
        candidateId,
        monthKey,
        payload.overall_score,
        payload.average_score,
        payload.tests_completed,
        payload.overall_rank,
      ]
    );
  }
};