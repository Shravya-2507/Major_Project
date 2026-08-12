import express from "express";

import {
  generateQuestions,
  evaluateInterview,
  generateReport,
} from "../controllers/interviewController.js";

const router = express.Router();

// ==============================
// Generate Interview Questions
// ==============================

router.post(
  "/questions",
  generateQuestions
);

// ==============================
// Evaluate Candidate Answers
// ==============================

router.post(
  "/evaluate",
  evaluateInterview
);

// ==============================
// Generate Interview Analysis Report
// ==============================

router.get(
  "/analyze/:candidateId",
  generateReport
);

export default router;

console.log("✅ interviewRoutes loaded");