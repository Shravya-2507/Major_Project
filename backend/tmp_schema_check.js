import dotenv from 'dotenv';
dotenv.config();
import { pool } from './db.js';

const test = async () => {
  const tables = ['answers', 'test_attempts', 'monthly_rankings', 'subject_performance'];
  for (const table of tables) {
    const q = `SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${table}' ORDER BY ordinal_position`;
    const r = await pool.query(q);
    console.log('TABLE', table);
    console.log(JSON.stringify(r.rows, null, 2));
  }

  try {
    await pool.query('BEGIN');
    const r1 = await pool.query(`INSERT INTO answers (candidate_id, question_id, answer_text, ai_score, ai_feedback, session_id, role_id, company_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [11, 1, 'test', 8.47, 'Incorrect', 'session-test', 1, 1]);
    console.log('answer insert ok', r1.rowCount);
    const r2 = await pool.query(`INSERT INTO test_attempts (candidate_id, test_type, company_id, score, total_questions, correct_answers, started_at, completed_at, duration_minutes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING attempt_id`, [11, 'interview', 1, 8.47, 1, 0, new Date(), new Date(), 0]);
    console.log('attempt insert ok', r2.rows);
    const r3 = await pool.query(`INSERT INTO monthly_rankings (candidate_id, ranking_month, overall_score, average_score, tests_completed, overall_rank)
      VALUES ($1, $2, $3, $4, $5, $6)`, [11, '2026-07-01', 8.47, 8.47, 1, 1]);
    console.log('ranking insert ok', r3.rowCount);
    await pool.query('COMMIT');
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('insert failed', err.message);
    console.error(err.stack);
  } finally {
    await pool.end();
  }
};

test();
