import dotenv from "dotenv";
dotenv.config();

import pool from "./config/db.js";
import express from "express";
import cors from "cors";

const app = express();

// =======================
// Middleware
// =======================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173",
    credentials: true,
  })
);

// =======================
// Routes
// =======================

import interviewRoutes from "./routes/interviewRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import selectionRoutes from "./routes/selectionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import codeRunnerRoutes from "./routes/codeRunnerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

console.log("Loading routes...");

app.use(
  "/api/interview",
  interviewRoutes
);

app.use(
  "/api/questions",
  questionRoutes
);

app.use(
  "/api/resume",
  resumeRoutes
);

app.use(
  "/api",
  selectionRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/code",
  codeRunnerRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

console.log("Routes loaded ✅");

// =======================
// Health Check
// =======================

app.get("/", (req, res) => {
  res.json({
    message:
      "AI Interview Backend Running 🚀",
  });
});

// =======================
// 404 Handler
// =======================

app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// =======================
// Global Error Handler
// =======================

app.use(
  (err, req, res, next) => {
    console.error(
      "Server Error:",
      err
    );

    res.status(500).json({
      error: "Internal Server Error",
    });
  }
);

// =======================
// Database Connection + Server Start
// =======================

const PORT =
  process.env.PORT || 5000;

pool
  .query("SELECT 1")
  .then(() => {
    console.log(
      "Database Connected ✅"
    );

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} 🚀`
      );
    });
  })
  .catch((err) => {
    console.error(
      "Database Connection Failed ❌"
    );

    console.error(err.message);

    process.exit(1);
  });