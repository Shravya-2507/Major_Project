import express from "express";
import { spawn } from "child_process";
import fs from "fs";
import { pool } from "../db.js";
const router = express.Router();

/* ================= RUN CODE ================= */
router.post("/run", (req, res) => {
  const { code, language, input = "" } = req.body;

  runCode(code, language, input, (output, error) => {
    res.json({
      output: clean(output),
      error: error ? clean(error) : null,
    });
  });
});

/* ================= SUBMIT CODE ================= */
router.post("/submit", async (req, res) => {
  const {
    code,
    language,
    testCases = [],
    questionId,
    candidateId = 1,
  } = req.body;

  if (!code || !language || !questionId) {
    return res.status(400).json({
      error: "code, language and questionId are required",
    });
  }

  if (!Array.isArray(testCases) || testCases.length === 0) {
    return res.status(400).json({
      error: "No hidden test cases found for this question",
    });
  }

  let results = [];
  let i = 0;

  const runNext = () => {
    if (i >= testCases.length) {
      const passedTests = results.filter((r) => r.passed).length;
      const totalTests = results.length;
      const success = totalTests > 0 && passedTests === totalTests;
      const status = success ? "ACCEPTED" : "FAILED";
      const score = totalTests > 0 ? Number(((passedTests / totalTests) * 100).toFixed(2)) : 0;

      pool.query(
        `INSERT INTO coding_submissions
          (candidate_id, question_id, language, status, passed_tests, total_tests, score, code, results)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
        [
          Number(candidateId) || 1,
          Number(questionId),
          language,
          status,
          passedTests,
          totalTests,
          score,
          code,
          JSON.stringify(results),
        ]
      )
        .then(() => {
          res.json({
            success,
            status,
            passedTests,
            totalTests,
            score,
            results,
          });
        })
        .catch((dbErr) => {
          console.error("Failed to save coding submission:", dbErr);
          res.status(500).json({ error: "Submission evaluated but failed to save" });
        });

      return;
    }

    const test = testCases[i];

    runCode(code, language, test.input, (output, error) => {
      const actual = clean(output);
      const expected = clean(test.output);

    const passed =
      normalize(actual) === normalize(expected) && normalize(actual) !== "";

      results.push({
        input: test.input,
        expected,
        output: actual || error || "",
        passed,
      });

      i++;
      runNext();
    });
  };

  runNext();
});

/* ================= GET SUBMISSIONS ================= */
router.get("/submissions", async (req, res) => {
  try {
    const candidateId = Number(req.query.candidateId || 1);
    const limit = Math.min(Number(req.query.limit || 50), 200);

    const result = await pool.query(
      `SELECT
         cs.id,
         cs.candidate_id,
         cs.question_id,
         cs.language,
         cs.status,
         cs.passed_tests,
         cs.total_tests,
         cs.score,
         cs.created_at,
         cq.title AS problem_title
       FROM coding_submissions cs
       LEFT JOIN "CodingQuestion" cq ON cq.id = cs.question_id
       WHERE cs.candidate_id = $1
       ORDER BY cs.created_at DESC
       LIMIT $2`,
      [candidateId, limit]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to fetch coding submissions:", err);
    res.status(500).json({ error: "Failed to fetch submissions" });
  }
});

/* ================= CODE RUNNER ================= */
function runCode(code, language, input, callback) {
  const fileName = language === "python" ? "temp.py" : "temp.js";
  fs.writeFileSync(fileName, code);

  const cmd =
    language === "python"
      ? (process.platform === "win32" ? "py" : "python3")
      : "node";

  const processRun = spawn(cmd, [fileName]);

  let output = "";
  let error = "";
  let finished = false;

  const done = (out, err) => {
    if (finished) return;
    finished = true;
    callback(out, err);
  };

  const timeout = setTimeout(() => {
    processRun.kill();
    done("", "Time limit exceeded");
  }, 3000);

  processRun.stdout.on("data", (data) => {
    output += data.toString();
  });

  processRun.stderr.on("data", (data) => {
    error += data.toString();
  });

  if (input) {
    processRun.stdin.write(input + "\n");
  }

  processRun.stdin.end();

  processRun.on("close", () => {
    clearTimeout(timeout);
    done(output, error);
  });

  processRun.on("error", (err) => {
    clearTimeout(timeout);
    done("", err.message);
  });
}

/* ================= CLEAN OUTPUT ================= */
function clean(str) {
  return (str ?? "").toString().replace(/\r/g, "").trim();
}

function normalize(str) {
  return (str ?? "")
    .toString()
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .replace(/\s+/g, "")
    .trim();
}
export default router;