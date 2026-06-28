import express from "express";
import { runTestCases } from "../services/judgeService.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { code, language, hiddenTestCases } = req.body;

  const results = await runTestCases(code, language, hiddenTestCases);

  const allPassed = results.every(r => r.status === "AC");

  res.json({
    status: allPassed ? "ACCEPTED" : "FAILED",
    results,
  });
});

export default router;