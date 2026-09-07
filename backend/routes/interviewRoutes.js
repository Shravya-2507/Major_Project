import express from "express";

import {
  generateQuestions,
  generateNextQuestion,
  evaluateSingleAnswer,
  evaluateInterview,
  generateReport,
} from "../controllers/interviewController.js";

const router = express.Router();

// Generate first interview question
router.post("/questions", generateQuestions);

// Submit answer and generate next adaptive question
router.post("/next-question", generateNextQuestion);

// Evaluate ONE interview answer
router.post("/evaluate", evaluateSingleAnswer);

// Finish interview and generate final report
router.post("/evaluate-interview", evaluateInterview);

// Get interview report
router.get("/analyze/:candidateId", generateReport);

console.log("✅ interviewRoutes loaded");

export default router;