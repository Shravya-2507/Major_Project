import express from "express";
import { getRoles, getCompanies, getRolesByCompany, getVtuQuestions } from "../controllers/selectionController.js";
import { evaluateAnswers } from "../controllers/analysisController.js";
import multer from "multer";
import { transcribeAudio } from "../controllers/audioController.js";
const router = express.Router();

router.get("/roles", getRoles);
router.get("/companies", getCompanies);

// NEW: This matches the fetch in your frontend when a company is picked
router.get("/companies/:companyId/roles", getRolesByCompany);
// routes/questionRoutes.js
router.get("/vtu-questions", getVtuQuestions);

// Submit VTU module answers
router.post("/vtu-answers", evaluateAnswers);
// Transcribe recorded audio using Whisper
const upload = multer({ storage: multer.memoryStorage() });

router.post("/transcribe-audio", upload.single("audio"), transcribeAudio);

export default router;
