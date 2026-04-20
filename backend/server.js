import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import interviewRoutes from "./routes/interviewRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import codeRunnerRoutes from "./routes/codeRunnerRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import selectionRoutes from "./routes/selectionRoutes.js";

import { pool } from "./db.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/interview", interviewRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/code", codeRunnerRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/selection", selectionRoutes);

// HEALTH CHECK (REAL DB TEST)
app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "ok",
      mode: "database-connected",
      time: result.rows[0],
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      error: err.message,
    });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Promise Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
});