// backend/config/dbClient.js
import dotenv from "dotenv";
dotenv.config(); // Must be first

import { neon } from "@neondatabase/serverless";

export const sql = neon(process.env.DATABASE_URL);