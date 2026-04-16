// routes/interviewRoutes.js
import express from "express";

import { generateQuestions } from "../controllers/interviewController.js";
import { evaluateAnswers, generateFinalReport } from "../controllers/analysisController.js";

const router = express.Router();

// ==============================
// 1. Get Questions
// ==============================
router.post("/questions", generateQuestions);

// ==============================
// 2. Evaluate Answers
// ==============================
router.post("/evaluate", evaluateAnswers);

// ==============================
// 3. Final Report / Analysis (UPDATED)
// ==============================
router.get("/analyze/:candidateId", generateFinalReport);

export default router;