import express from "express";
import {
  generateQuestions,
  evaluateInterview,
  generateReport,
} from "../controllers/interviewController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==============================
// Interview Routes
// ==============================

// Generate Interview Questions
router.post("/questions", generateQuestions);

// Evaluate Candidate Answers
router.post("/evaluate", evaluateInterview);

// Generate Interview Analysis Report
router.get("/analyze/:candidateId", generateReport);

export default router;