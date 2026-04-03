// server.js (top of file)
import dotenv from "dotenv";
dotenv.config(); // Must come first, before importing anything that uses process.env

import express from "express";
import cors from "cors";
import interviewRoutes from "./routes/interviewRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import pool from "./config/db.js"; // Uses process.env.DATABASE_URL

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/interview", interviewRoutes);
app.use("/api/questions", questionRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

app.listen(5000, () => console.log("Server running on port 5000"));

pool.connect()
  .then(() => console.log("Connected to Neon DB ✅"))
  .catch(err => console.error("DB Connection Error ❌", err));

