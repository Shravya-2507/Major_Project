import express from "express";

import {
  generateQuestions,
  generateNextQuestion,
  evaluateInterview,
  generateReport,
} from "../controllers/interviewController.js";

const router = express.Router();

// ===============================================
// GENERATE FIRST INTERVIEW QUESTION
// ===============================================

router.post(
  "/questions",
  generateQuestions
);

// ===============================================
// SUBMIT ANSWER + GET NEXT ADAPTIVE QUESTION
// ===============================================

router.post(
  "/next-question",
  generateNextQuestion
);

// ===============================================
// FINISH INTERVIEW
// ===============================================

router.post(
  "/evaluate",
  evaluateInterview
);

// ===============================================
// GET INTERVIEW REPORT
// ===============================================

router.get(
  "/analyze/:candidateId",
  generateReport
);

export default router;

console.log("✅ interviewRoutes loaded");