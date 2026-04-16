import express from "express";
import multer from "multer";
import { analyzeResume } from "../controllers/resumeController.js";

const router = express.Router();

// Using memoryStorage is usually better for small AI tasks
const upload = multer({ storage: multer.memoryStorage() });

// CHANGE: Changed "/analyze" to "/analyze-resume" to match your frontend call
// ALSO: Ensure the upload.single name matches what you append in FormData
router.post("/analyze-resume", upload.single("file"), analyzeResume);

export default router;