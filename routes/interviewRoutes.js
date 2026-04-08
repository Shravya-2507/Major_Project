import express from "express";
import { generateQuestions, evaluateAnswers } from "../controllers/interviewController.js";

const router = express.Router();

router.post("/questions", generateQuestions);
router.post("/answers", evaluateAnswers);

export default router;