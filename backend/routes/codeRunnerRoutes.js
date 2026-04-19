import express from "express";
import fs from "fs";
import { exec } from "child_process";

const router = express.Router();

/* ---------------- RUN CODE ---------------- */
router.post("/run", async (req, res) => {
  const { code, language } = req.body;

  try {
    const output = await runCode(code, language, "");
    res.json({ output });
  } catch (err) {
    res.json({ error: err.toString() });
  }
});

/* ---------------- SUBMIT CODE ---------------- */
router.post("/submit", async (req, res) => {
  const { code, language, testCases } = req.body;

  // 🔥 SAFE CHECK (FIX CRASH)
  if (!testCases || !Array.isArray(testCases)) {
    return res.status(400).json({
      error: "testCases missing or invalid",
    });
  }

  let results = [];

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];

    try {
      const output = await runCode(code, language, test.input);

      const passed =
        output.trim() === test.output.toString().trim();

      results.push({
        input: test.input,
        expected: test.output,
        output,
        passed,
      });
    } catch (err) {
      results.push({
        input: test.input,
        expected: test.output,
        output: "Error",
        passed: false,
      });
    }
  }

  const success = results.every((r) => r.passed);

  res.json({
    success,
    results,
  });
});
/* ---------------- CODE RUNNER ---------------- */
function runCode(code, language, input) {
  return new Promise((resolve, reject) => {
    let fileName = "";

    if (language === "javascript") {
      fileName = "temp.js";
      fs.writeFileSync(fileName, code);

      exec(`node ${fileName}`, (err, stdout, stderr) => {
        if (err) return reject(err);
        if (stderr) return reject(stderr);
        resolve(stdout);
      });
    }

    else if (language === "python") {
      fileName = "temp.py";
      fs.writeFileSync(fileName, code);

      exec(`python ${fileName}`, (err, stdout, stderr) => {
        if (err) return reject(err);
        if (stderr) return reject(stderr);
        resolve(stdout);
      });
    }

    else {
      reject("Unsupported language");
    }
  });
}

export default router;