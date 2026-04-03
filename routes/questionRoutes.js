import express from "express";
import { getQuestions } from "../controllers/questionController.js";

const router = express.Router();

router.post("/generate", getQuestions);

export default router;