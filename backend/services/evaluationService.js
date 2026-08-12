import { spawn } from "child_process";
import fs from "fs";
import axios from "axios";

// ==============================
// AI Service Configuration
// ==============================
const AI_API = process.env.AI_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: AI_API,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==============================
// 1. Evaluate Text Answer using AI
// ==============================
export const evaluateAnswer = async (
  userAnswer,
  expectedAnswer,
  role = "General",
  company = "General"
) => {
  try {
    if (!userAnswer || !expectedAnswer) {
      return {
        final_score: 0,
        result: "Invalid input",
        score: 0,
        feedback: "Invalid input",
        semantic_score: 0,
        keyword_match_score: 0,
        evaluation_method: {},
      };
    }

    const response = await api.post("/evaluate", {
      student_answer: userAnswer,
      correct_answer: expectedAnswer,
      role,
      company,
    });

    const data = response.data;
    console.log("========== AI RESPONSE ==========");
console.log(data);
console.log("================================");

    const finalScore = data.final_score || 0;
    const resultText = data.result || "No feedback";

    return {
      final_score: finalScore,
      result: resultText,
      score: Math.round(finalScore * 10),
      feedback: resultText,

      semantic_score: data.semantic_score || 0,
      keyword_match_score: data.keyword_match_score || 0,

      evaluation_method: data.evaluation_method || {},
    };

  } catch (error) {

    console.error("AI Evaluation Error:", {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });

    return {
      final_score: 0,
      result: "AI evaluation failed",
      score: 0,
      feedback: "AI evaluation failed",
      semantic_score: 0,
      keyword_match_score: 0,
      evaluation_method: {},
    };
  }
};

// ==============================
// 2. Generate Next Adaptive Question
// ==============================
export const getNextQuestion = async (
  role,
  company,
  questions,
  user_answers,
  question_type = "Technical"
) => {

  try {

    const response = await api.post("/next-question", {
      role,
      company,
      question_type,
      questions,
      user_answers,
    });

    return response.data;

  } catch (error) {

    console.error(
      "Next Question Error:",
      error.message
    );

    throw error;
  }
};
console.log("===== NEW generateQuestions Controller Loaded =====");
export const generateQuestion = async (data) => {

  try {

    const response = await api.post(
      "/generate-question",
      data
    );

    return response.data;

  } catch (error) {

    console.error(
      "Generate Question Error:",
      error.message
    );

    throw error;
  }
};
// ==============================
// 2. Execute Code Locally via Child Process
// ==============================
export const executeCode = (code, language_id, input) => {
  return new Promise((resolve) => {
    // Explicitly check if it's JavaScript. If it's NOT JavaScript, treat it as Python.
    const langStr = String(language_id).toLowerCase();
    const isJavaScript = langStr.includes("javascript") || langStr === "63" || langStr === "js";

    const fileName = isJavaScript ? "temp.js" : "temp.py";
    const cmd = isJavaScript ? "node" : (process.platform === "win32" ? "python" : "python3");

    fs.writeFileSync(fileName, code);

    const processRun = spawn(cmd, [fileName]);

    let output = "";
    let error = "";
    let finished = false;

    const done = (out, err, statusId, description) => {
      if (finished) return;
      finished = true;
      
      // Clean up temp file safely
      try {
        if (fs.existsSync(fileName)) fs.unlinkSync(fileName);
      } catch (e) {}

      resolve({
        stdout: out,
        stderr: err,
        compile_output: err && statusId === 6 ? err : "",
        status: {
          id: statusId, // 3 = Accepted, 6 = Compilation/Runtime Error, 5 = Time Limit Exceeded
          description: description
        }
      });
    };

    const timeout = setTimeout(() => {
      processRun.kill();
      done("", "Time limit exceeded", 5, "Time Limit Exceeded");
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

    processRun.on("close", (codeExit) => {
      clearTimeout(timeout);
      if (error && codeExit !== 0) {
        done(output, error, 6, "Execution Error");
      } else {
        done(output, error, 3, "Accepted");
      }
    });

    processRun.on("error", (err) => {
      clearTimeout(timeout);
      done("", err.message, 6, "Internal Error");
    });
  });
};

// ==============================
// 3. Run Test Cases (Batch Processing)
// ==============================
export const runTestCases = async (code, language_id, testCases = []) => {
  const results = [];

  for (const tc of testCases) {

    const inputStr = tc.input !== undefined && tc.input !== null
      ? String(tc.input)
      : "";

    const expectedStr =
      tc.expected !== undefined && tc.expected !== null
        ? String(tc.expected)
        : tc.output !== undefined && tc.output !== null
          ? String(tc.output)
          : "";

    try {
      const executionResult = await executeCode(
        code,
        language_id,
        inputStr
      );

      const actualOutput = clean(executionResult.stdout);
      const expectedOutput = clean(expectedStr);

      const stderr = clean(
        executionResult.stderr || executionResult.compile_output
      );

      const isPassed =
        executionResult.status?.id === 3 &&
        !stderr &&
        normalize(actualOutput) === normalize(expectedOutput);

      results.push({
        input: inputStr,
        expected: expectedOutput,
        output: actualOutput || stderr,
        status: isPassed ? "AC" : "WA",
        passed: isPassed,
      });

    } catch (err) {
      results.push({
        input: inputStr,
        expected: expectedStr,
        output: err.message,
        status: "RE",
        passed: false,
      });
    }
  }

  return results;
};

function clean(str) {
  return (str ?? "")
    .toString()
    .replace(/\r/g, "")
    .trim();
}

function normalize(str) {
  return (str ?? "")
    .toString()
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .replace(/\s+/g, "")
    .trim();
}