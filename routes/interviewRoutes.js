// routes/interviewRoutes.js
import express from "express";

// Import from the two separate controller files
import { generateQuestions } from "../controllers/interviewController.js";
import { 
    evaluateAnswers, 
    generateFinalReport 
} from "../controllers/analysisController.js";

const router = express.Router();

// 1. Fetches questions from vtu_syllabus table
router.post("/questions", generateQuestions);

// 2. Evaluates responses via FastAPI
router.post("/evaluate", evaluateAnswers);

// 3. Runs PageRank and Topic Analysis
router.post("/analyze/:candidateId", generateFinalReport);

export default router;