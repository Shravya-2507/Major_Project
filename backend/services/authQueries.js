import { pool } from "../db.js";

// ===========================
// USER
// ===========================

export const findUserByEmail = async (email) => {
  const result = await pool.query(
    `SELECT * FROM candidates WHERE email = $1`,
    [email]
  );

  return result.rows[0];
};

export const createUser = async (
  name,
  email,
  passwordHash,
  appliedRoleId = null,
  resumeLink = null
) => {
  const result = await pool.query(
    `
    INSERT INTO candidates
    (
      name,
      email,
      password_hash,
      applied_role_id,
      resume_link
    )
    VALUES ($1,$2,$3,$4,$5)
    RETURNING *
    `,
    [
      name,
      email,
      passwordHash,
      appliedRoleId,
      resumeLink,
    ]
  );

  return result.rows[0];
};

// ===========================
// ADMIN
// ===========================

export const findAdminByEmail = async (email) => {
  const result = await pool.query(
    `
    SELECT *
    FROM admin_users
    WHERE email=$1
    AND is_active=true
    `,
    [email]
  );

  return result.rows[0];
};