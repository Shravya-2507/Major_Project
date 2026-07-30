import { pool } from "../db.js";

// ==============================
// Get Subject ID for a Question
// ==============================
export const getSubjectIdForQuestion = async (questionId) => {
  const result = await pool.query(
    `SELECT s.subject_id
     FROM questions q
     LEFT JOIN vtu_syllabus s ON q.syllabus_id = s.id
     WHERE q.id = $1`,
    [questionId]
  );

  return result.rows[0]?.subject_id || null;
};

// ==============================
// Update Subject Performance
// ==============================
export const updateSubjectPerformance = async (
  candidateId,
  score,
  questionId
) => {
  const subjectId = await getSubjectIdForQuestion(questionId);

  if (!subjectId) {
    return;
  }

  const existing = await pool.query(
    `SELECT average_score,
            highest_score,
            tests_taken
     FROM subject_performance
     WHERE candidate_id = $1
       AND subject_id = $2`,
    [candidateId, subjectId]
  );

  const numericScore = Number(score) || 0;

  if (existing.rows.length > 0) {
    const row = existing.rows[0];

    const previousTests = Number(row.tests_taken || 0);
    const totalTests = previousTests + 1;

    const newAverage = Number(
      (
        (Number(row.average_score || 0) * previousTests + numericScore) /
        totalTests
      ).toFixed(2)
    );

    const newHighest = Math.max(
      Number(row.highest_score || 0),
      numericScore
    );

    await pool.query(
      `UPDATE subject_performance
       SET average_score = $3,
           highest_score = $4,
           tests_taken = $5,
           last_updated = NOW()
       WHERE candidate_id = $1
         AND subject_id = $2`,
      [
        candidateId,
        subjectId,
        newAverage,
        newHighest,
        totalTests,
      ]
    );
  } else {
    await pool.query(
      `INSERT INTO subject_performance
      (
        candidate_id,
        subject_id,
        average_score,
        highest_score,
        tests_taken,
        last_updated
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        NOW()
      )`,
      [
        candidateId,
        subjectId,
        numericScore,
        numericScore,
        1,
      ]
    );
  }
};