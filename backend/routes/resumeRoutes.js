import express from "express";
import multer from "multer";
import { analyzeResume, extractResumeText } from "../controllers/resumeController.js";

const router = express.Router();

// Using memoryStorage for efficient handling of small PDF buffers
const upload = multer({ storage: multer.memoryStorage() });

// Route for standalone text extraction
router.post("/extract-text", upload.single("file"), extractResumeText);

// Route for full RAG analysis pipeline
router.post("/analyze-resume", upload.single("file"), analyzeResume);

export default router;