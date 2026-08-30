import { spawn } from "child_process";
import fs from "fs";
import axios from "axios";

// =====================================================
// AI SERVICE CONFIGURATION
// =====================================================

const AI_API =
  process.env.AI_API_URL ||
  "http://localhost:8000";

const AI_TIMEOUT =
  Number(process.env.AI_TIMEOUT) ||
  120000;

// Remove trailing slash
const normalizedAI_API =
  String(AI_API).replace(/\/+$/, "");

const api = axios.create({
  baseURL: normalizedAI_API,

  timeout: AI_TIMEOUT,

  headers: {
    "Content-Type": "application/json",
  },
});

// =====================================================
// HELPER: NORMALIZE SCORE TO 0-100
// =====================================================

const normalizeScore = (score) => {
  const numericScore =
    Number(score) || 0;

  // Support AI returning scores from 0-10
  if (
    numericScore >= 0 &&
    numericScore <= 10
  ) {
    return Math.round(
      numericScore * 10
    );
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(numericScore)
    )
  );
};

// =====================================================
// HELPER: GET AI ERROR MESSAGE
// =====================================================

const getAIErrorMessage = (
  error
) => {

  // Timeout
  if (
    error?.code === "ECONNABORTED" ||
    error?.code === "ETIMEDOUT"
  ) {
    return (
      `AI service timed out after ${
        AI_TIMEOUT / 1000
      } seconds. ` +
      `Check that the AI server is running at ` +
      `${normalizedAI_API}.`
    );
  }

  // Connection refused
  if (
    error?.code === "ECONNREFUSED"
  ) {
    return (
      `AI service is not running or unreachable at ` +
      `${normalizedAI_API}.`
    );
  }

  // DNS error
  if (
    error?.code === "ENOTFOUND"
  ) {
    return (
      `AI service host could not be found: ` +
      `${normalizedAI_API}`
    );
  }

  // Network error
  if (
    error?.code === "ERR_NETWORK"
  ) {
    return (
      `Unable to connect to AI service at ` +
      `${normalizedAI_API}.`
    );
  }

  // HTTP response
  if (error?.response) {

    const data =
      error.response.data;

    if (
      typeof data === "string" &&
      data.trim()
    ) {
      return data;
    }

    if (data?.detail) {
      return String(data.detail);
    }

    if (data?.error) {
      return String(data.error);
    }

    if (data?.message) {
      return String(data.message);
    }

    return (
      `AI service returned HTTP ` +
      `${error.response.status}`
    );
  }

  return (
    error?.message ||
    "AI service request failed"
  );
};

// =====================================================
// CHECK AI SERVICE
// =====================================================

export const checkAIService =
  async () => {

    try {

      console.log(
        "========== CHECKING AI SERVICE =========="
      );

      console.log(
        "AI URL:",
        normalizedAI_API
      );

      const response =
        await api.get("/");

      console.log(
        "AI service reachable:",
        response.status
      );

      return {
        available: true,

        status:
          response.status,

        data:
          response.data,
      };

    } catch (error) {

      console.error(
        "AI service health check failed:",
        {
          message:
            getAIErrorMessage(error),

          code:
            error?.code,

          status:
            error?.response?.status,
        }
      );

      return {
        available: false,

        error:
          getAIErrorMessage(error),
      };
    }
  };

// =====================================================
// 1. EVALUATE SINGLE ANSWER
// =====================================================
// =====================================================
// 1. EVALUATE TEXT ANSWER
// =====================================================

export const evaluateAnswer = async (
  userAnswer,
  questionText,
  role = "General",
  company = "General"
) => {
  try {
    // ================================================
    // VALIDATE ANSWER
    // ================================================

    if (!userAnswer?.trim()) {
      return {
        final_score: 0,
        score: 0,

        result: "No answer provided",
        feedback: "No answer provided",

        llm_score: 0,
        smith_waterman_score: 0,

        semantic_score: 0,
        keyword_match_score: 0,

        evaluation_method: {},
      };
    }

    // ================================================
    // VALIDATE QUESTION
    // ================================================

    if (!questionText?.trim()) {
      throw new Error(
        "Question text is required for evaluation"
      );
    }

    console.log(
      "========== AI ANSWER EVALUATION =========="
    );

    console.log({
      endpoint: `${normalizedAI_API}/evaluate`,

      question: questionText,

      role,

      company,

      hasQuestion: Boolean(
        questionText?.trim()
      ),

      hasAnswer: Boolean(
        userAnswer?.trim()
      ),
    });

    // ================================================
    // FASTAPI PAYLOAD
    //
    // Must match AnswerRequest exactly:
    //
    // question
    // student_answer
    // role
    // company
    // ================================================

    const payload = {
      question: String(
        questionText
      ).trim(),

      student_answer: String(
        userAnswer
      ).trim(),

      role: String(
        role || "General"
      ).trim(),

      company: String(
        company || "General"
      ).trim(),
    };

    console.log(
      "Evaluation payload:",
      payload
    );

    // ================================================
    // CALL AI API
    // ================================================

    const response = await api.post(
      "/evaluate",
      payload
    );

    const data = response.data || {};

    console.log(
      "========== AI EVALUATION RESPONSE =========="
    );

    console.dir(
      data,
      {
        depth: null,
      }
    );

    console.log(
      "============================================"
    );

    // ================================================
    // CHECK AI RESPONSE
    // ================================================

    if (data.success === false) {
      throw new Error(
        data.error ||
        "AI evaluation failed"
      );
    }

    // ================================================
    // NORMALIZE SCORES
    // ================================================

    const rawFinalScore =
      data.final_score ??
      data.score ??
      0;

    const normalizedFinalScore =
      normalizeScore(
        rawFinalScore
      );

    const llmScore =
      normalizeScore(
        data.llm_score ?? 0
      );

    const smithWatermanScore =
      normalizeScore(
        data.smith_waterman_score ?? 0
      );

    // ================================================
    // FEEDBACK
    // ================================================

    const resultText =
      data.feedback ??
      data.result ??
      "Answer evaluated successfully";

    // ================================================
    // RETURN STANDARD FORMAT
    // ================================================

    return {
      success: true,

      final_score:
        normalizedFinalScore,

      score:
        normalizedFinalScore,

      llm_score:
        llmScore,

      smith_waterman_score:
        smithWatermanScore,

      result:
        resultText,

      feedback:
        resultText,

      semantic_score:
        Number(
          data.semantic_score
        ) || 0,

      keyword_match_score:
        Number(
          data.keyword_match_score
        ) || 0,

      evaluation_method:
        data.evaluation_method || {},
    };

  } catch (error) {

    const message =
      getAIErrorMessage(error);

    console.error(
      "========== AI EVALUATION ERROR =========="
    );

    console.error({
      message,

      code:
        error?.code,

      status:
        error?.response?.status,

      response:
        error?.response?.data,
    });

    // ================================================
    // FASTAPI 422 VALIDATION ERROR
    // ================================================

    if (
      error?.response?.status === 422
    ) {
      console.error(
        "========== FASTAPI VALIDATION ERROR =========="
      );

      console.dir(
        error.response.data,
        {
          depth: null,
        }
      );

      console.error(
        "=============================================="
      );
    }

    console.error(
      "========================================="
    );

    // Return safe result so interview does not crash

    return {
      success: false,

      final_score: 0,
      score: 0,

      llm_score: 0,
      smith_waterman_score: 0,

      result:
        "AI evaluation failed",

      feedback:
        message,

      semantic_score: 0,

      keyword_match_score: 0,

      evaluation_method: {},
    };
  }
};

// =====================================================
// 2. GENERATE QUESTION
// =====================================================

export const generateQuestion =
  async ({
    role,
    company = "General",
    topic = "General",
    question_type = "Technical",
    category = "Conceptual",
    history = [],
    difficulty = "Medium",
  }) => {

    try {

      console.log(
        "========== GENERATING QUESTION =========="
      );

      console.log({
        AI_API:
          normalizedAI_API,

        endpoint:
          `${normalizedAI_API}/generate-question`,

        role,

        company,

        topic,

        question_type,

        category,

        difficulty,

        historyLength:
          Array.isArray(history)
            ? history.length
            : 0,
      });

      // -----------------------------------------------
      // NORMALIZE PAYLOAD
      // -----------------------------------------------

      const payload = {

        role:
          role || "General",

        company:
          company || "General",

        topic:
          topic || "General",

        question_type:
          String(
            question_type ||
            "Technical"
          )
            .trim()
            .toLowerCase(),

        category:
          category ||
          "Conceptual",

        history:
          Array.isArray(history)
            ? history
            : [],

        difficulty:
          difficulty ||
          "Medium",
      };

      console.log(
        "AI request payload:",
        payload
      );

      // -----------------------------------------------
      // CALL AI SERVER
      // -----------------------------------------------

      const response =
        await api.post(
          "/generate-question",
          payload
        );

      console.log(
        "========== GENERATE QUESTION RESPONSE =========="
      );

      console.dir(
        response.data,
        { depth: null }
      );

      console.log(
        "================================================"
      );

      // -----------------------------------------------
      // VALIDATE RESPONSE
      // -----------------------------------------------

      if (
        !response.data ||
        typeof response.data !== "object"
      ) {

        throw new Error(
          "AI server returned an invalid response."
        );
      }

      if (
        !response.data.question ||
        !String(
          response.data.question
        ).trim()
      ) {

        throw new Error(
          "AI server did not return a question."
        );
      }

      return response.data;

    } catch (error) {

      const message =
        getAIErrorMessage(error);

      console.error(
        "========== GENERATE QUESTION ERROR =========="
      );

      console.error({
        AI_API:
          normalizedAI_API,

        endpoint:
          `${normalizedAI_API}/generate-question`,

        message,

        code:
          error?.code,

        status:
          error?.response?.status,

        response:
          error?.response?.data,
      });

      console.error(
        "============================================="
      );

      throw new Error(message);
    }
  };

// =====================================================
// 3. GENERATE FINAL INTERVIEW REPORT
// =====================================================

export const generateInterviewReport =
  async ({
    role = "General",
    company = "General",
    answers = [],
  }) => {

    try {

      console.log(
        "========== GENERATING FINAL INTERVIEW REPORT =========="
      );

      console.log({
        endpoint:
          `${normalizedAI_API}/evaluate-interview`,

        role,

        company,

        answerCount:
          Array.isArray(answers)
            ? answers.length
            : 0,
      });

      // -----------------------------------------------
      // VALIDATE
      // -----------------------------------------------

      if (
        !Array.isArray(answers) ||
        answers.length === 0
      ) {

        throw new Error(
          "No interview answers provided for final evaluation."
        );
      }

      // -----------------------------------------------
      // NORMALIZE ANSWERS
      // -----------------------------------------------

      const normalizedAnswers =
        answers.map(
          (item) => ({

            question:
              String(
                item.question || ""
              ),

            student_answer:
              String(
                item.student_answer || ""
              ),

            topic:
              String(
                item.topic || "General"
              ),

            llm_score:
              Number(
                item.llm_score ?? 0
              ) || 0,

            smith_waterman_score:
              Number(
                item.smith_waterman_score ?? 0
              ) || 0,

            final_score:
              Number(
                item.final_score ?? 0
              ) || 0,
          })
        );

      const payload = {

        role:
          role || "General",

        company:
          company || "General",

        answers:
          normalizedAnswers,
      };

      console.log(
        "Final report request:",
        payload
      );

      // -----------------------------------------------
      // CALL PYTHON API
      // -----------------------------------------------

      const response =
        await api.post(
          "/evaluate-interview",
          payload
        );

      const data =
        response.data || {};

      console.log(
        "========== FINAL INTERVIEW REPORT RESPONSE =========="
      );

      console.dir(
        data,
        { depth: null }
      );

      console.log(
        "====================================================="
      );

      // -----------------------------------------------
      // VALIDATE RESPONSE
      // -----------------------------------------------

      if (
        !data ||
        typeof data !== "object"
      ) {

        throw new Error(
          "AI server returned an invalid final report."
        );
      }

      if (
        data.success === false
      ) {

        throw new Error(
          data.error ||
          "Final interview evaluation failed."
        );
      }

      return data;

    } catch (error) {

      const message =
        getAIErrorMessage(error);

      console.error(
        "========== FINAL INTERVIEW REPORT ERROR =========="
      );

      console.error({
        message,

        code:
          error?.code,

        status:
          error?.response?.status,

        response:
          error?.response?.data,
      });

      console.error(
        "================================================="
      );

      throw new Error(message);
    }
  };

// =====================================================
// 4. EXECUTE CODE LOCALLY
// =====================================================

export const executeCode =
  (
    code,
    language_id,
    input = ""
  ) => {

    return new Promise(
      (resolve) => {

        const langStr =
          String(
            language_id
          ).toLowerCase();

        const isJavaScript =
          langStr.includes(
            "javascript"
          ) ||
          langStr === "63" ||
          langStr === "js";

        const fileName =
          isJavaScript
            ? "temp.js"
            : "temp.py";

        const command =
          isJavaScript
            ? "node"
            : process.platform === "win32"
            ? "python"
            : "python3";

        fs.writeFileSync(
          fileName,
          code
        );

        const processRun =
          spawn(
            command,
            [fileName]
          );

        let output = "";
        let error = "";
        let finished = false;

        const done =
          (
            stdout,
            stderr,
            statusId,
            description
          ) => {

            if (finished) {
              return;
            }

            finished = true;

            try {

              if (
                fs.existsSync(fileName)
              ) {

                fs.unlinkSync(fileName);
              }

            } catch (cleanupError) {

              console.error(
                "Temp file cleanup failed:",
                cleanupError.message
              );
            }

            resolve({

              stdout,

              stderr,

              compile_output:
                stderr &&
                statusId === 6
                  ? stderr
                  : "",

              status: {

                id:
                  statusId,

                description,
              },
            });
          };

        const timeout =
          setTimeout(
            () => {

              processRun.kill();

              done(
                "",
                "Time limit exceeded",
                5,
                "Time Limit Exceeded"
              );

            },
            3000
          );

        processRun.stdout.on(
          "data",
          (data) => {

            output +=
              data.toString();
          }
        );

        processRun.stderr.on(
          "data",
          (data) => {

            error +=
              data.toString();
          }
        );

        if (input) {

          processRun.stdin.write(
            input + "\n"
          );
        }

        processRun.stdin.end();

        processRun.on(
          "close",
          (exitCode) => {

            clearTimeout(timeout);

            if (
              error &&
              exitCode !== 0
            ) {

              done(
                output,
                error,
                6,
                "Execution Error"
              );

            } else {

              done(
                output,
                error,
                3,
                "Accepted"
              );
            }
          }
        );

        processRun.on(
          "error",
          (err) => {

            clearTimeout(timeout);

            done(
              "",
              err.message,
              6,
              "Internal Error"
            );
          }
        );
      }
    );
  };

// =====================================================
// 5. RUN TEST CASES
// =====================================================

export const runTestCases =
  async (
    code,
    language_id,
    testCases = []
  ) => {

    const results = [];

    for (
      const tc of testCases
    ) {

      const inputStr =
        tc.input !== undefined &&
        tc.input !== null
          ? String(tc.input)
          : "";

      const expectedStr =
        tc.expected !== undefined &&
        tc.expected !== null
          ? String(tc.expected)
          : tc.output !== undefined &&
            tc.output !== null
          ? String(tc.output)
          : "";

      try {

        const executionResult =
          await executeCode(
            code,
            language_id,
            inputStr
          );

        const actualOutput =
          clean(
            executionResult.stdout
          );

        const expectedOutput =
          clean(
            expectedStr
          );

        const stderr =
          clean(
            executionResult.stderr ||
            executionResult.compile_output
          );

        const isPassed =
          executionResult.status?.id === 3 &&
          !stderr &&
          normalize(actualOutput) ===
          normalize(expectedOutput);

        results.push({

          input:
            inputStr,

          expected:
            expectedOutput,

          output:
            actualOutput ||
            stderr,

          status:
            isPassed
              ? "AC"
              : "WA",

          passed:
            isPassed,
        });

      } catch (err) {

        results.push({

          input:
            inputStr,

          expected:
            expectedStr,

          output:
            err.message,

          status:
            "RE",

          passed:
            false,
        });
      }
    }

    return results;
  };

// =====================================================
// HELPERS
// =====================================================

function clean(str) {

  return (
    str ?? ""
  )
    .toString()
    .replace(/\r/g, "")
    .trim();
}

function normalize(str) {

  return (
    str ?? ""
  )
    .toString()
    .replace(/\r/g, "")
    .replace(/\n/g, "")
    .replace(/\s+/g, "")
    .trim();
}