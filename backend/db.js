import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// IMPORTANT: Neon-safe pool config
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});