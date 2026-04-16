import express from "express";
import { generateQuestions } from "../controllers/interviewController.js";
import { evaluateAnswers, generateFinalReport } from "../controllers/analysisController.js";

const router = express.Router();

router.post("/questions", generateQuestions);
router.post("/evaluate", evaluateAnswers);
router.get("/analyze/:candidateId", generateFinalReport);

export default router;
console.log("✅ interviewRoutes loaded");