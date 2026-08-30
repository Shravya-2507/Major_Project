import pool from "../config/db.js";

import {
  evaluateAnswer,
  generateQuestion,
} from "../services/evaluationService.js";

import {
  updateMonthlyRanking,
} from "../services/rankingService.js";

import {
  updateSubjectPerformance,
} from "../services/performanceService.js";

import axios from "axios";

const AI_API =
  process.env.AI_API_URL ||
  "http://localhost:8000";

const normalizedAI_API =
  String(AI_API).replace(/\/+$/, "");

const aiApi = axios.create({
  baseURL: normalizedAI_API,
  timeout: 0, // No Axios timeout
  headers: {
    "Content-Type": "application/json",
  },
});
// =====================================================
// HELPER: NORMALIZE DIFFICULTY
// =====================================================

const normalizeDifficulty = (
  difficulty,
  fallback = "Medium"
) => {
  const value = String(
    difficulty || fallback
  )
    .trim()
    .toLowerCase();

  if (value === "easy") return "Easy";
  if (value === "hard") return "Hard";

  return "Medium";
};

// =====================================================
// HELPER: NORMALIZE QUESTION TYPE
// =====================================================

const normalizeQuestionType = (
  questionType,
  fallback = "technical"
) => {
  const value = String(
    questionType || fallback
  )
    .trim()
    .toLowerCase();

  if (
    value === "technical" ||
    value === "tech"
  ) {
    return "technical";
  }

  if (
    value === "hr" ||
    value === "behavioral" ||
    value === "behavioural"
  ) {
    return "hr";
  }

  if (
    value === "aptitude" ||
    value === "ability"
  ) {
    return "aptitude";
  }

  return "technical";
};

// =====================================================
// HELPER: NORMALIZE CATEGORY
// =====================================================

const normalizeCategory = (
  category,
  fallback = "Conceptual"
) => {
  const value = String(
    category || fallback
  ).trim();

  return value || fallback;
};

// =====================================================
// HELPER: GET ROLE + COMPANY
// =====================================================

const getInterviewDetails = async (
  roleId,
  companyId
) => {
  if (
    roleId === null ||
    roleId === undefined ||
    String(roleId).trim() === ""
  ) {
    throw new Error(
      "roleId is required"
    );
  }

  const numericRoleId =
    Number(roleId);

  if (
    !Number.isInteger(numericRoleId) ||
    numericRoleId <= 0
  ) {
    throw new Error(
      `Invalid roleId: ${roleId}`
    );
  }

  // ===================================================
  // ROLE
  // ===================================================

  const roleResult =
    await pool.query(
      `
      SELECT
        id,
        role_name
      FROM roles
      WHERE id = $1
      LIMIT 1
      `,
      [numericRoleId]
    );

  if (
    roleResult.rows.length === 0
  ) {
    throw new Error(
      `Role not found for roleId: ${numericRoleId}`
    );
  }

  const role =
    roleResult.rows[0].role_name;

  // ===================================================
  // COMPANY
  // ===================================================

  let company = "General";
  let validCompanyId = null;

  if (
    companyId !== null &&
    companyId !== undefined &&
    String(companyId).trim() !== "" &&
    String(companyId).toLowerCase() !== "general"
  ) {
    const numericCompanyId =
      Number(companyId);

    if (
      !Number.isInteger(
        numericCompanyId
      ) ||
      numericCompanyId <= 0
    ) {
      console.warn(
        `Invalid companyId "${companyId}". Using NULL.`
      );
    } else {
      const companyResult =
        await pool.query(
          `
          SELECT
            id,
            company_name
          FROM companies
          WHERE id = $1
          LIMIT 1
          `,
          [numericCompanyId]
        );

      if (
        companyResult.rows.length > 0
      ) {
        validCompanyId =
          companyResult.rows[0].id;

        company =
          companyResult.rows[0]
            .company_name;
      } else {
        console.warn(
          `Company ${numericCompanyId} not found. Using NULL.`
        );
      }
    }
  }

  return {
    role,
    company,
    roleId: numericRoleId,
    companyId: validCompanyId,
  };
};

// =====================================================
// HELPER: NEXT DIFFICULTY
// =====================================================

const getNextDifficulty = (
  score
) => {
  const numericScore =
    Number(score) || 0;

  if (numericScore >= 85) {
    return "Hard";
  }

  if (numericScore >= 65) {
    return "Medium";
  }

  return "Easy";
};

// =====================================================
// HELPER: SESSION ID
// =====================================================

const createSessionId = (
  candidateId
) => {
  return `session-${candidateId || "guest"}-${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 8)}`;
};

// =====================================================
// HELPER: VALIDATE AI QUESTION
// =====================================================

const validateGeneratedQuestion = (
  generated
) => {
  if (
    !generated ||
    typeof generated !== "object"
  ) {
    throw new Error(
      "AI service returned an invalid response"
    );
  }

  if (
    !generated.question ||
    !String(
      generated.question
    ).trim()
  ) {
    throw new Error(
      "AI service returned no question"
    );
  }
};

// =====================================================
// HELPER: SAVE QUESTION
// =====================================================

const saveQuestion = async ({
  questionText,
  expectedAnswer,
  roleId,
  companyId,
  difficulty,
  questionType,
  category,
  candidateId,
}) => {
  const normalizedDifficulty =
    normalizeDifficulty(
      difficulty
    );

  const normalizedQuestionType =
    normalizeQuestionType(
      questionType
    );

  const normalizedCategory =
    normalizeCategory(
      category
    );

  const safeCandidateId =
    candidateId &&
    Number.isInteger(
      Number(candidateId)
    )
      ? Number(candidateId)
      : null;

  console.log(
    "========== DATABASE QUESTION INSERT =========="
  );

  console.log({
    questionText,
    roleId,
    companyId,
    difficulty:
      normalizedDifficulty.toLowerCase(),
    questionType:
      normalizedQuestionType,
    category:
      normalizedCategory,
    candidateId:
      safeCandidateId,
  });

  const result =
    await pool.query(
      `
      INSERT INTO questions
      (
        question_text,
        role_id,
        company_id,
        difficulty_level,
        question_type,
        expected_answer,
        generated_by,
        category,
        created_for_candidate,
        ai_difficulty
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10
      )
      RETURNING
        id,
        question_text,
        difficulty_level,
        question_type,
        expected_answer,
        category,
        ai_difficulty
      `,
      [
        String(
          questionText
        ).trim(),

        roleId,

        companyId || null,

        normalizedDifficulty.toLowerCase(),

        normalizedQuestionType,

        expectedAnswer
          ? String(
              expectedAnswer
            ).trim()
          : null,

        "AI",

        normalizedCategory,

        safeCandidateId,

        normalizedDifficulty,
      ]
    );

  const saved =
    result.rows[0];

  if (!saved?.id) {
    throw new Error(
      "Question insert succeeded but no question ID was returned"
    );
  }

  console.log(
    "Question saved successfully:",
    saved.id
  );

  return saved;
};

// =====================================================
// GENERATE FIRST QUESTION
// =====================================================

export const generateQuestions =
  async (req, res) => {
    try {
      const {
        roleId,
        companyId,
        topic = "General",
        question_type = "Technical",
        category = "Conceptual",
        candidateId = null,
      } = req.body;

      console.log(
        "========== GENERATING FIRST QUESTION =========="
      );

      console.log({
        roleId,
        companyId,
        topic,
        question_type,
        category,
        candidateId,
      });

      // =================================================
      // VALIDATE ROLE
      // =================================================

      if (
        roleId === null ||
        roleId === undefined ||
        String(roleId).trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          error:
            "roleId is required",
        });
      }

      // =================================================
      // ROLE + COMPANY
      // =================================================

      const details =
        await getInterviewDetails(
          roleId,
          companyId
        );

      const {
        role,
        company,
        roleId: validRoleId,
        companyId:
          validCompanyId,
      } = details;

      console.log(
        "Resolved interview details:",
        {
          role,
          company,
          validRoleId,
          validCompanyId,
        }
      );

      // =================================================
      // SESSION
      // =================================================

      const sessionId =
        createSessionId(
          candidateId
        );

      // =================================================
      // NORMALIZE INPUTS
      // =================================================

      const normalizedQuestionType =
        normalizeQuestionType(
          question_type
        );

      const normalizedCategory =
        normalizeCategory(
          category
        );

      // =================================================
      // GENERATE WITH AI
      // =================================================

      const generated =
        await generateQuestion({
          role,
          company,
          topic:
            topic || "General",

          question_type:
            normalizedQuestionType,

          category:
            normalizedCategory,

          history: [],

          difficulty: "Medium",
        });

      console.log(
        "========== AI GENERATED FIRST QUESTION =========="
      );

      console.dir(
        generated,
        { depth: null }
      );

      validateGeneratedQuestion(
        generated
      );

      // =================================================
      // QUESTION DATA
      // =================================================

      const questionText =
        String(
          generated.question
        ).trim();

      const expectedAnswer =
        generated.expected_answer
          ? String(
              generated.expected_answer
            ).trim()
          : null;

      const difficulty =
        normalizeDifficulty(
          generated.difficulty,
          "Medium"
        );

      // =================================================
      // SAVE
      // =================================================

      const savedQuestion =
        await saveQuestion({
          questionText,
          expectedAnswer,

          roleId:
            validRoleId,

          companyId:
            validCompanyId,

          difficulty,

          questionType:
            normalizedQuestionType,

          category:
            normalizedCategory,

          candidateId,
        });

      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({
        success: true,

        sessionId,

        question: {
          id:
            savedQuestion.id,

          question_id:
            savedQuestion.id,

          question_text:
            savedQuestion.question_text,

          question:
            savedQuestion.question_text,

          difficulty:
            normalizeDifficulty(
              savedQuestion.difficulty_level
            ),

          topic:
            generated.topic ||
            topic,

          role,
          company,

          category:
            savedQuestion.category,

          question_type:
            savedQuestion.question_type,
        },

        history: [],
      });

    } catch (error) {
      console.error(
        "========== FIRST QUESTION GENERATION ERROR =========="
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(
        "PostgreSQL code:",
        error?.code
      );

      console.error(
        "Detail:",
        error?.detail
      );

      console.error(
        "Hint:",
        error?.hint
      );

      console.error(
        "Where:",
        error?.where
      );

      console.error(
        "Constraint:",
        error?.constraint
      );

      console.error(
        "Table:",
        error?.table
      );

      console.error(
        "Column:",
        error?.column
      );

      console.error(
        "Stack:",
        error?.stack
      );

      console.error(
        "======================================================"
      );

      return res.status(500).json({
        success: false,

        error:
          "Question generation failed",

        details:
          error?.message ||
          "Unknown server error",

        code:
          error?.code || null,

        database_detail:
          error?.detail || null,

        constraint:
          error?.constraint || null,
      });
    }
  };

// =====================================================
// GENERATE NEXT QUESTION
// =====================================================

export const generateNextQuestion =
  async (req, res) => {
    try {
      const {
        candidateId,
        roleId,
        companyId,
        sessionId,
        currentQuestionId,
        currentAnswer,
        topic = "General",
        history = [],
        question_type = "Technical",
        category = "Conceptual",
      } = req.body;

      console.log(
        "========== GENERATING NEXT QUESTION =========="
      );

      console.log({
        candidateId,
        roleId,
        companyId,
        sessionId,
        currentQuestionId,
        topic,
        question_type,
        category,
        historyLength:
          Array.isArray(history)
            ? history.length
            : 0,
      });

      // =================================================
      // VALIDATION
      // =================================================

      if (!roleId) {
        return res.status(400).json({
          success: false,
          error:
            "roleId is required",
        });
      }

      if (!sessionId) {
        return res.status(400).json({
          success: false,
          error:
            "sessionId is required",
        });
      }

      if (!currentQuestionId) {
        return res.status(400).json({
          success: false,
          error:
            "currentQuestionId is required",
        });
      }

      if (
        !currentAnswer ||
        !String(
          currentAnswer
        ).trim()
      ) {
        return res.status(400).json({
          success: false,
          error:
            "currentAnswer is required",
        });
      }

      // =================================================
      // DETAILS
      // =================================================

      const {
        role,
        company,
        roleId: validRoleId,
        companyId:
          validCompanyId,
      } = await getInterviewDetails(
        roleId,
        companyId
      );

      // =================================================
      // CURRENT QUESTION
      // =================================================

      const questionResult =
        await pool.query(
          `
          SELECT
            id,
            question_text,
            expected_answer,
            difficulty_level,
            question_type,
            category
          FROM questions
          WHERE id = $1
          LIMIT 1
          `,
          [currentQuestionId]
        );

      if (
        questionResult.rows.length === 0
      ) {
        return res.status(404).json({
          success: false,
          error:
            "Current question not found",
        });
      }

      const currentQuestion =
        questionResult.rows[0];

      // =================================================
      // EVALUATE
      // =================================================

      const evaluation =
        await evaluateAnswer(
          currentAnswer,
          currentQuestion.expected_answer ||
            "",
          role,
          company
        );

      const score =
        Number(
          evaluation.final_score ??
            evaluation.score ??
            0
        ) || 0;

      const feedback =
        evaluation.feedback ??
        evaluation.result ??
        "No feedback available";

      console.log(
        "========== ANSWER EVALUATION =========="
      );

      console.log({
        score,
        feedback,
      });

      // =================================================
      // NEXT DIFFICULTY
      // =================================================

      const nextDifficulty =
        getNextDifficulty(
          score
        );

      console.log(
        "Next difficulty:",
        nextDifficulty
      );

      // =================================================
      // SAVE ANSWER
      // =================================================

      if (candidateId) {
        await pool.query(
          `
          INSERT INTO answers
          (
            candidate_id,
            question_id,
            answer_text,
            ai_score,
            llm_score,
            smith_waterman_score,
            final_score,
            ai_feedback,
            session_id,
            role_id,
            company_id
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11
          )
          `,
          [
            candidateId,
            currentQuestionId,
            currentAnswer,

            score,

            Number(evaluation.llm_score) || 0,

            Number(
              evaluation.smith_waterman_score
            ) || 0,

            Number(evaluation.final_score) || score,

            feedback,

            sessionId,

            validRoleId,

            validCompanyId,
          ]
        );

        await updateSubjectPerformance(
          candidateId,
          score,
          currentQuestionId
        );
      }

      // =================================================
      // HISTORY
      // =================================================

      const safeHistory =
        Array.isArray(history)
          ? history
          : [];

      const adaptiveHistory = [
        ...safeHistory,

        {
          question:
            currentQuestion.question_text,

          answer:
            currentAnswer,

          score,

          difficulty:
            currentQuestion.difficulty_level,

          feedback,
        },
      ];

      // =================================================
      // GENERATE NEXT QUESTION
      // =================================================

      const normalizedQuestionType =
        normalizeQuestionType(
          question_type
        );

      const normalizedCategory =
        normalizeCategory(
          category
        );

      const generated =
        await generateQuestion({
          role,
          company,

          topic:
            topic || "General",

          question_type:
            normalizedQuestionType,

          category:
            normalizedCategory,

          history:
            adaptiveHistory,

          difficulty:
            nextDifficulty,
        });

      console.log(
        "========== AI GENERATED NEXT QUESTION =========="
      );

      console.dir(
        generated,
        { depth: null }
      );

      validateGeneratedQuestion(
        generated
      );

      // =================================================
      // QUESTION DATA
      // =================================================

      const questionText =
        String(
          generated.question
        ).trim();

      const expectedAnswer =
        generated.expected_answer
          ? String(
              generated.expected_answer
            ).trim()
          : null;

      const generatedDifficulty =
        normalizeDifficulty(
          generated.difficulty,
          nextDifficulty
        );

      // =================================================
      // SAVE NEXT QUESTION
      // =================================================

      const savedQuestion =
        await saveQuestion({
          questionText,
          expectedAnswer,

          roleId:
            validRoleId,

          companyId:
            validCompanyId,

          difficulty:
            generatedDifficulty,

          questionType:
            normalizedQuestionType,

          category:
            normalizedCategory,

          candidateId,
        });

      // =================================================
      // RESPONSE
      // =================================================

      return res.status(200).json({
        success: true,

        sessionId,

        evaluation: {
          score,
          feedback,

          previousDifficulty:
            normalizeDifficulty(
              currentQuestion.difficulty_level
            ),

          nextDifficulty,
        },

        nextQuestion: {
          id:
            savedQuestion.id,

          question_id:
            savedQuestion.id,

          question_text:
            savedQuestion.question_text,

          question:
            savedQuestion.question_text,

          difficulty:
            normalizeDifficulty(
              savedQuestion.difficulty_level
            ),

          topic:
            generated.topic ||
            topic,

          role,
          company,

          category:
            savedQuestion.category,

          question_type:
            savedQuestion.question_type,
        },

        history:
          adaptiveHistory,
      });

    } catch (error) {
      console.error(
        "========== ADAPTIVE QUESTION ERROR =========="
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(
        "PostgreSQL code:",
        error?.code
      );

      console.error(
        "Detail:",
        error?.detail
      );

      console.error(
        "Hint:",
        error?.hint
      );

      console.error(
        "Where:",
        error?.where
      );

      console.error(
        "Constraint:",
        error?.constraint
      );

      console.error(
        "Table:",
        error?.table
      );

      console.error(
        "Column:",
        error?.column
      );

      console.error(
        "Stack:",
        error?.stack
      );

      console.error(
        "============================================="
      );

      return res.status(500).json({
        success: false,

        error:
          "Failed to generate next question",

        details:
          error?.message ||
          "Unknown server error",

        code:
          error?.code || null,

        database_detail:
          error?.detail || null,

        constraint:
          error?.constraint || null,
      });
    }
  };

// =====================================================
// FINISH INTERVIEW
// =====================================================

// =====================================================
// FINISH INTERVIEW
// =====================================================

export const evaluateInterview = async (req, res) => {
  try {
    const {
      candidateId,
      sessionId,
      companyId,
      roleId,
      currentQuestionId,
      currentAnswer,
      testType = "interview",
      startedAt,
    } = req.body;

    console.log(
      "========== FINISHING INTERVIEW =========="
    );

    console.log({
      candidateId,
      sessionId,
      companyId,
      roleId,
      currentQuestionId,
      hasAnswer: Boolean(
        currentAnswer &&
        String(currentAnswer).trim()
      ),
      testType,
      startedAt,
    });

    // =================================================
    // VALIDATION
    // =================================================

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        error: "candidateId is required",
      });
    }

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: "sessionId is required",
      });
    }

    // =================================================
    // SAVE FINAL ANSWER
    // =================================================

    if (
      currentQuestionId &&
      currentAnswer &&
      String(currentAnswer).trim()
    ) {
      // -----------------------------------------------
      // CHECK IF FINAL ANSWER ALREADY EXISTS
      // -----------------------------------------------

      const existingAnswer =
        await pool.query(
          `
          SELECT id
          FROM answers
          WHERE candidate_id = $1
          AND session_id = $2
          AND question_id = $3
          LIMIT 1
          `,
          [
            candidateId,
            sessionId,
            currentQuestionId,
          ]
        );

      // -----------------------------------------------
      // ONLY SAVE IF NOT ALREADY SAVED
      // -----------------------------------------------

      if (existingAnswer.rows.length === 0) {
        const questionResult =
          await pool.query(
            `
            SELECT
              id,
              question_text,
              expected_answer,
              difficulty_level,
              question_type,
              category
            FROM questions
            WHERE id = $1
            LIMIT 1
            `,
            [currentQuestionId]
          );

        if (questionResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            error: "Final question not found",
          });
        }

        // IMPORTANT:
        // The variable is called "question".
        // Do NOT use currentQuestion here.
        const question =
          questionResult.rows[0];

        console.log(
          "Final question found:",
          {
            id: question.id,
            question_text:
              question.question_text,
            hasExpectedAnswer:
              Boolean(
                question.expected_answer
              ),
          }
        );

        // ---------------------------------------------
        // GET ROLE + COMPANY
        // ---------------------------------------------

        const {
          role,
          company,
          roleId: validRoleId,
          companyId: validCompanyId,
        } = await getInterviewDetails(
          roleId,
          companyId
        );

        // ---------------------------------------------
        // EVALUATE FINAL ANSWER
        // ---------------------------------------------

        console.log(
          "========== EVALUATING FINAL ANSWER =========="
        );

        const evaluation =
          await evaluateAnswer(
            currentAnswer,
            question.expected_answer || "",
            role,
            company
          );

        const score =
          Number(
            evaluation.final_score ??
            evaluation.score ??
            0
          ) || 0;

        const feedback =
          evaluation.feedback ??
          evaluation.result ??
          "No feedback available";

        console.log(
          "Final evaluation:",
          {
            score,
            feedback,
          }
        );

        // ---------------------------------------------
        // SAVE FINAL ANSWER
        // ---------------------------------------------

        await pool.query(
          `
          INSERT INTO answers
          (
            candidate_id,
            question_id,
            answer_text,
            ai_score,
            llm_score,
            smith_waterman_score,
            final_score,
            ai_feedback,
            session_id,
            role_id,
            company_id
          )
          VALUES
          (
            $1,
            $2,
            $3,
            $4,
            $5,
            $6,
            $7,
            $8,
            $9,
            $10,
            $11
          )
          `,
          [
            candidateId,

            currentQuestionId,

            currentAnswer,

            Number(
              evaluation.ai_score ??
              score
            ) || 0,

            Number(
              evaluation.llm_score
            ) || 0,

            Number(
              evaluation.smith_waterman_score
            ) || 0,

            Number(
              evaluation.final_score ??
              score
            ) || 0,

            feedback,

            sessionId,

            validRoleId,

            validCompanyId,
          ]
        );

        // ---------------------------------------------
        // UPDATE SUBJECT PERFORMANCE
        // ---------------------------------------------

        await updateSubjectPerformance(
          candidateId,
          score,
          currentQuestionId
        );

        console.log(
          "Final answer saved successfully."
        );
      } else {
        console.log(
          "Final answer already exists. Skipping duplicate insert."
        );
      }
    }

    // =================================================
    // GET ALL ANSWERS FOR SESSION
    // =================================================

    const answersResult =
      await pool.query(
        `
        SELECT
          id,
          ai_score,
          llm_score,
          smith_waterman_score,
          final_score
        FROM answers
        WHERE candidate_id = $1
        AND session_id = $2
        ORDER BY id ASC
        `,
        [
          candidateId,
          sessionId,
        ]
      );

    const answers =
      answersResult.rows;

    if (answers.length === 0) {
      return res.status(400).json({
        success: false,
        error:
          "No answers found for this session",
      });
    }

    // =================================================
    // CALCULATE SCORE
    // =================================================

    let totalScore = 0;
    let correctAnswers = 0;

    for (const answer of answers) {
      const score =
        Number(
          answer.final_score ??
          answer.ai_score ??
          0
        ) || 0;

      totalScore += score;

      if (score >= 70) {
        correctAnswers++;
      }
    }

    const overallScore =
      Number(
        (
          totalScore /
          answers.length
        ).toFixed(2)
      );

    // =================================================
    // DURATION
    // =================================================

    const startedDate =
      startedAt
        ? new Date(startedAt)
        : new Date();

    const completedAt =
      new Date();

    const durationMinutes =
      Math.max(
        0,
        Math.round(
          (
            completedAt -
            startedDate
          ) / 60000
        )
      );

    // =================================================
    // SAVE ATTEMPT
    // =================================================

    const attemptResult =
      await pool.query(
        `
        INSERT INTO test_attempts
        (
          candidate_id,
          test_type,
          company_id,
          score,
          total_questions,
          correct_answers,
          started_at,
          completed_at,
          duration_minutes
        )
        VALUES
        (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9
        )
        RETURNING attempt_id
        `,
        [
          candidateId,

          testType,

          companyId || null,

          overallScore,

          answers.length,

          correctAnswers,

          startedDate,

          completedAt,

          durationMinutes,
        ]
      );

    // =================================================
    // UPDATE RANKING
    // =================================================

    await updateMonthlyRanking(
      candidateId,
      overallScore
    );

    // =================================================
    // RESPONSE
    // =================================================

    console.log(
      "========== INTERVIEW COMPLETED =========="
    );

    console.log({
      sessionId,
      overallScore,
      totalQuestions:
        answers.length,
      correctAnswers,
      durationMinutes,
      attemptId:
        attemptResult.rows[0]
          ?.attempt_id,
    });

    return res.status(200).json({
      success: true,

      sessionId,

      overallScore,

      totalQuestions:
        answers.length,

      correctAnswers,

      durationMinutes,

      attemptId:
        attemptResult.rows[0]
          ?.attempt_id,
    });

  } catch (error) {
    console.error(
      "========== INTERVIEW COMPLETION ERROR =========="
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Code:",
      error?.code
    );

    console.error(
      "Detail:",
      error?.detail
    );

    console.error(
      "Constraint:",
      error?.constraint
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "================================================="
    );

    return res.status(500).json({
      success: false,

      error:
        "Interview completion failed",

      details:
        error?.message ||
        "Unknown server error",

      code:
        error?.code || null,

      database_detail:
        error?.detail || null,
    });
  }
};
// =====================================================
// GENERATE DETAILED INTERVIEW REPORT
// =====================================================

export const generateReport =
  async (req, res) => {

    try {

      const {
        candidateId,
      } = req.params;

      const {
        sessionId,
      } = req.query;

      console.log(
        "========== GENERATING INTERVIEW REPORT =========="
      );

      console.log({
        candidateId,
        sessionId,
      });

      // ===============================================
      // VALIDATE CANDIDATE
      // ===============================================

      if (!candidateId) {

        return res.status(400).json({
          success: false,
          error:
            "candidateId is required",
        });

      }

      // ===============================================
      // GET SESSION
      // ===============================================

      let targetSession =
        sessionId;

      if (!targetSession) {

        const latestResult =
          await pool.query(
            `
            SELECT
              session_id
            FROM answers
            WHERE candidate_id = $1
            AND session_id IS NOT NULL
            ORDER BY created_at DESC
            LIMIT 1
            `,
            [
              candidateId,
            ]
          );

        targetSession =
          latestResult.rows[0]
            ?.session_id;

      }

      if (!targetSession) {

        return res.status(404).json({
          success: false,
          error:
            "No interview session found",
        });

      }

      console.log(
        "Target session:",
        targetSession
      );

      // ===============================================
      // GET COMPLETE INTERVIEW DATA
      // ===============================================

      const interviewResult =
        await pool.query(
          `
          SELECT
            a.id AS answer_id,

            a.candidate_id,

            a.session_id,

            a.question_id,

            a.answer_text,

            a.ai_score,

            a.llm_score,

            a.smith_waterman_score,

            a.final_score,

            a.ai_feedback,

            a.role_id,

            a.company_id,

            q.question_text,

            q.category,

            q.question_type,

            q.expected_answer,

            q.difficulty_level,

            r.role_name,

            c.company_name

          FROM answers a

          JOIN questions q
            ON q.id = a.question_id

          LEFT JOIN roles r
            ON r.id = a.role_id

          LEFT JOIN companies c
            ON c.id = a.company_id

          WHERE a.candidate_id = $1
          AND a.session_id = $2

          ORDER BY a.id ASC
          `,
          [
            candidateId,
            targetSession,
          ]
        );

      const rows =
        interviewResult.rows;

      // ===============================================
      // VALIDATE ANSWERS
      // ===============================================

      if (
        !rows ||
        rows.length === 0
      ) {

        return res.status(404).json({
          success: false,
          error:
            "No answers found for this interview session",
        });

      }

      // ===============================================
      // GET ROLE AND COMPANY
      // ===============================================

      const firstRow =
        rows[0];

      const role =
        firstRow.role_name ||
        "General";

      const company =
        firstRow.company_name ||
        "General";

      console.log(
        "Interview details:",
        {
          role,
          company,
          totalAnswers:
            rows.length,
        }
      );

      // ===============================================
      // PREPARE ANSWERS FOR PYTHON AI
      // ===============================================

      const answers =
        rows.map(
          (row) => {

            const finalScore =
              Number(
                row.final_score ??
                row.ai_score ??
                0
              ) || 0;

            return {

              question:
                row.question_text ||
                "",

              student_answer:
                row.answer_text ||
                "",

              topic:
                row.category ||
                row.question_type ||
                "General",

              llm_score:
                Number(
                  row.llm_score ?? 0
                ) || 0,

              smith_waterman_score:
                Number(
                  row.smith_waterman_score ?? 0
                ) || 0,

              final_score:
                finalScore,
            };

          }
        );

      // ===============================================
      // PYTHON REQUEST PAYLOAD
      // ===============================================

      const payload = {

        role,

        company,

        answers,

      };

      console.log(
        "========== CALLING AI FINAL REPORT =========="
      );

      console.dir(
        payload,
        { depth: null }
      );

      // ===============================================
      // CALL PYTHON /evaluate-interview
      // ===============================================

      const aiResponse =
        await aiApi.post(
          "/evaluate-interview",
          payload
        );

      const report =
        aiResponse.data;

      console.log(
        "========== AI FINAL REPORT RESPONSE =========="
      );

      console.dir(
        report,
        { depth: null }
      );

      // ===============================================
      // VALIDATE AI RESPONSE
      // ===============================================

      if (
        !report ||
        report.success === false
      ) {

        throw new Error(
          report?.error ||
          "AI failed to generate interview report"
        );

      }

      // ===============================================
      // RETURN COMPLETE REPORT
      // ===============================================

      return res.status(200).json({

        success: true,

        candidateId:
          Number(candidateId),

        sessionId:
          targetSession,

        report: {

          success:
            report.success,

          overall_score:
            report.overall_score ??
            0,

          percentage:
            report.percentage ??
            report.overall_score ??
            0,

          classification:
            report.classification ??
            "Not Available",

          total_questions:
            report.total_questions ??
            answers.length,

          summary:
            report.summary ??
            "No detailed summary available.",

          strengths:
            Array.isArray(
              report.strengths
            )
              ? report.strengths
              : [],

          weaknesses:
            Array.isArray(
              report.weaknesses
            )
              ? report.weaknesses
              : [],

          recommendations:
            Array.isArray(
              report.recommendations
            )
              ? report.recommendations
              : [],

          final_assessment:
            report.final_assessment ??
            "No final assessment available.",

          scores:
            Array.isArray(
              report.scores
            )
              ? report.scores
              : [],

          evaluation_method:
            report.evaluation_method ||
            {},

          role:
            report.role ||
            role,

          company:
            report.company ||
            company,

        },

      });

    } catch (error) {

      console.error(
        "========== REPORT GENERATION ERROR =========="
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(
        "AI Response:",
        error?.response?.data
      );

      console.error(
        "Status:",
        error?.response?.status
      );

      console.error(
        "Stack:",
        error?.stack
      );

      console.error(
        "============================================="
      );

      return res.status(500).json({

        success: false,

        error:
          "Failed to generate interview report",

        details:
          error?.response?.data?.error ||
          error?.response?.data?.detail ||
          error?.message ||
          "Unknown server error",

      });

    }

  };