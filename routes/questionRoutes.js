import express from "express";
import { getQuestions } from "../controllers/questionController.js";

const router = express.Router();

router.get("/", getQuestions);
router.post("/", getQuestions);

export default router;