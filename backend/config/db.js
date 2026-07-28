import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error("DATABASE_URL is not defined in .env ❌");
}

const isNeon = dbUrl.includes("neon.tech");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isNeon ? { rejectUnauthorized: false } : false
});

export default pool;