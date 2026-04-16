import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import interviewRoutes from "./routes/interviewRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import pool from "./config/db.js";
import resumeRoutes from "./routes/resumeRoutes.js";

const app = express();

// Middleware
app.use(cors({
  origin: "http://localhost:5173"
}
));
app.use(express.json());

// Routes
app.use("/api/interview", interviewRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/resume", resumeRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong" });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// DB test
pool.query("SELECT 1")
  .then(() => console.log("DB Connected ✅"))
  .catch(err => console.error("DB Error ❌", err));