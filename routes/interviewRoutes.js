// routes/interviewRoutes.js
import express from "express";
import { generateQuestionsFree, evaluateAnswersFree } from "../controllers/interviewController.js";

const router = express.Router();

// Generate questions (simulated AI)
router.post("/generate-questions-free", generateQuestionsFree);

// Evaluate answers (simulated AI scoring)
router.post("/evaluate-free", evaluateAnswersFree);

export default router;