import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  fetchQuestions,
  getNextQuestion,
  submitAnswers,
} from "../services/api";

const TOTAL_QUESTIONS = 5;

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  // =====================================================
  // INTERVIEW CONFIG
  // =====================================================

  const interviewState = location.state || {};

  const {
    roleId,
    companyId,
    role = "General",
    company = "General",
    topic = "General",
    question_type = "Technical",
    category = "Conceptual",
    totalQuestions = TOTAL_QUESTIONS,
  } = interviewState;

  const TOTAL =
    Number(totalQuestions) || TOTAL_QUESTIONS;

  const firstQuestionLoaded = useRef(false);

  // =====================================================
  // STATE
  // =====================================================

  const [questions, setQuestions] =
    useState([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [answers, setAnswers] =
    useState({});

  const [evaluatedAnswers, setEvaluatedAnswers] =
    useState([]);

  const [history, setHistory] =
    useState([]);

  const [sessionId, setSessionId] =
    useState(null);

  // =====================================================
  // UI STATE
  // =====================================================

  const [loading, setLoading] =
    useState(true);

  const [isEvaluating, setIsEvaluating] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  // =====================================================
  // GET CURRENT USER
  // =====================================================

  const getCurrentUser = () => {
    try {
      const savedUser =
        localStorage.getItem("user");

      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch (error) {
      console.error(
        "Failed to parse user:",
        error
      );

      return null;
    }
  };

  // =====================================================
  // LOAD FIRST QUESTION
  // =====================================================

  useEffect(() => {
    if (!roleId) {
      navigate("/mock-interview");
      return;
    }

    if (firstQuestionLoaded.current) {
      return;
    }

    firstQuestionLoaded.current = true;

    const loadFirstQuestion = async () => {
      try {
        setLoading(true);
        setErrorMessage("");

        // =================================================
        // RESTORE INTERVIEW CONFIG
        // =================================================

        const savedInterview =
          sessionStorage.getItem(
            "current_interview"
          );

        let storedInterview = {};

        if (savedInterview) {
          try {
            storedInterview =
              JSON.parse(savedInterview);
          } catch {
            sessionStorage.removeItem(
              "current_interview"
            );
          }
        }

        const requestTopic =
          storedInterview.topic || topic;

        const requestQuestionType =
          storedInterview.question_type ||
          question_type;

        const requestCategory =
          storedInterview.category ||
          category;

        // =================================================
        // RESTORE EXISTING INTERVIEW
        // =================================================

        const savedQuestions =
          sessionStorage.getItem(
            "current_interview_questions"
          );

        const savedSessionId =
          sessionStorage.getItem(
            "current_interview_session_id"
          );

        const savedAnswers =
          sessionStorage.getItem(
            "current_interview_answers"
          );

        const savedEvaluations =
          sessionStorage.getItem(
            "current_interview_evaluations"
          );

        const savedHistory =
          sessionStorage.getItem(
            "current_interview_history"
          );

        if (
          savedQuestions &&
          savedSessionId
        ) {
          try {
            const parsedQuestions =
              JSON.parse(savedQuestions);

            if (
              Array.isArray(parsedQuestions) &&
              parsedQuestions.length > 0
            ) {
              setQuestions(parsedQuestions);

              setSessionId(
                savedSessionId
              );

              if (savedAnswers) {
                setAnswers(
                  JSON.parse(savedAnswers)
                );
              }

              if (savedEvaluations) {
                setEvaluatedAnswers(
                  JSON.parse(
                    savedEvaluations
                  )
                );
              }

              if (savedHistory) {
                setHistory(
                  JSON.parse(
                    savedHistory
                  )
                );
              }

              /*
                Important:

                If the last question is unanswered,
                go to that question.

                Otherwise restore the next position.
              */

              const parsedAnswers =
                savedAnswers
                  ? JSON.parse(savedAnswers)
                  : {};

              const unansweredIndex =
                parsedQuestions.findIndex(
                  (_, index) =>
                    !parsedAnswers[index]?.trim()
                );

              setCurrentIndex(
                unansweredIndex >= 0
                  ? unansweredIndex
                  : Math.min(
                      parsedQuestions.length - 1,
                      TOTAL - 1
                    )
              );

              return;
            }
          } catch (error) {
            console.error(
              "Failed to restore interview:",
              error
            );

            sessionStorage.removeItem(
              "current_interview_questions"
            );

            sessionStorage.removeItem(
              "current_interview_session_id"
            );

            sessionStorage.removeItem(
              "current_interview_answers"
            );

            sessionStorage.removeItem(
              "current_interview_evaluations"
            );

            sessionStorage.removeItem(
              "current_interview_history"
            );
          }
        }

        // =================================================
        // USER
        // =================================================

        const user =
          getCurrentUser();

        const candidateId =
          user?.id || null;

        // =================================================
        // START TIME
        // =================================================

        if (
          !sessionStorage.getItem(
            "current_interview_started_at"
          )
        ) {
          sessionStorage.setItem(
            "current_interview_started_at",
            new Date().toISOString()
          );
        }

        // =================================================
        // GENERATE FIRST QUESTION
        // =================================================

        console.log(
          "========== FIRST QUESTION =========="
        );

        const data =
          await fetchQuestions({
            roleId:
              Number(roleId),

            companyId:
              companyId
                ? Number(companyId)
                : null,

            topic:
              requestTopic,

            question_type:
              requestQuestionType,

            category:
              requestCategory,

            candidateId,
          });

        console.log(
          "First question:",
          data
        );

        if (
          !data ||
          !data.success ||
          !data.question
        ) {
          throw new Error(
            data?.details ||
            data?.error ||
            "Invalid first question response."
          );
        }

        const firstQuestion =
          data.question;

        const newSessionId =
          data.sessionId;

        if (!newSessionId) {
          throw new Error(
            "Session ID was not returned by the server."
          );
        }

        setQuestions([
          firstQuestion,
        ]);

        setSessionId(
          newSessionId
        );

        setCurrentIndex(0);

        setAnswers({});
        setEvaluatedAnswers([]);
        setHistory([]);

        // =================================================
        // SAVE SESSION
        // =================================================

        sessionStorage.setItem(
          "current_interview_questions",
          JSON.stringify([
            firstQuestion,
          ])
        );

        sessionStorage.setItem(
          "current_interview_session_id",
          newSessionId
        );

        sessionStorage.setItem(
          "current_interview_answers",
          JSON.stringify({})
        );

        sessionStorage.setItem(
          "current_interview_evaluations",
          JSON.stringify([])
        );

        sessionStorage.setItem(
          "current_interview_history",
          JSON.stringify([])
        );

      } catch (error) {
        console.error(
          "Failed to load first question:",
          error
        );

        const message =
          error?.response?.data?.details ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load interview.";

        setErrorMessage(message);

        firstQuestionLoaded.current =
          false;

      } finally {
        setLoading(false);
      }
    };

    loadFirstQuestion();

  }, [
    roleId,
    companyId,
    topic,
    question_type,
    category,
    navigate,
  ]);

  // =====================================================
  // INPUT
  // =====================================================

  const handleInputChange = (e) => {
    const value =
      e.target.value;

    setAnswers((prev) => {
      const updated = {
        ...prev,
        [currentIndex]: value,
      };

      sessionStorage.setItem(
        "current_interview_answers",
        JSON.stringify(updated)
      );

      return updated;
    });
  };

  // =====================================================
  // NEXT QUESTION
  // =====================================================

  const handleNext = async () => {
    try {
      setIsEvaluating(true);
      setErrorMessage("");

      const currentQuestion =
        questions[currentIndex];

      const currentAnswer =
        answers[currentIndex];

      if (!currentQuestion) {
        throw new Error(
          "Current question not found."
        );
      }

      if (
        !currentAnswer ||
        !currentAnswer.trim()
      ) {
        throw new Error(
          "Please provide an answer."
        );
      }

      if (!sessionId) {
        throw new Error(
          "Interview session not found."
        );
      }

      // =================================================
      // USER
      // =================================================

      const user =
        getCurrentUser();

      const candidateId =
        user?.id || null;

      if (!candidateId) {
        throw new Error(
          "User not found. Please login again."
        );
      }

      // =================================================
      // CURRENT QUESTION ID
      // =================================================

      const currentQuestionId =
        currentQuestion.id ||
        currentQuestion.question_id;

      if (!currentQuestionId) {
        throw new Error(
          "Current question ID not found."
        );
      }

      // =================================================
      // CALL BACKEND
      //
      // Backend:
      // 1. Evaluates current answer
      // 2. Saves answer
      // 3. Updates performance
      // 4. Calculates difficulty
      // 5. Generates next question
      // =================================================

      console.log(
        "========== GETTING NEXT QUESTION =========="
      );

      const nextResult =
        await getNextQuestion({
          candidateId,

          roleId:
            Number(roleId),

          companyId:
            companyId
              ? Number(companyId)
              : null,

          sessionId,

          currentQuestionId,

          currentAnswer:
            currentAnswer.trim(),

          topic,

          question_type,

          category,

          history,
        });

      console.log(
        "========== NEXT QUESTION RESPONSE =========="
      );

      console.dir(
        nextResult,
        { depth: null }
      );

      if (
        !nextResult ||
        !nextResult.success ||
        !nextResult.nextQuestion
      ) {
        throw new Error(
          nextResult?.details ||
          nextResult?.error ||
          "No next question returned."
        );
      }

      // =================================================
      // SAVE EVALUATION
      // =================================================

      const evaluation = {
        question:
          currentQuestion.question_text ||
          currentQuestion.question ||
          "",

        student_answer:
          currentAnswer,

        topic:
          currentQuestion.topic ||
          topic ||
          "General",

        final_score:
          Number(
            nextResult.evaluation?.score || 0
          ),

        feedback:
          nextResult.evaluation?.feedback ||
          "",
      };

      const updatedEvaluations = [
        ...evaluatedAnswers,
        evaluation,
      ];

      setEvaluatedAnswers(
        updatedEvaluations
      );

      sessionStorage.setItem(
        "current_interview_evaluations",
        JSON.stringify(
          updatedEvaluations
        )
      );

      // =================================================
      // SAVE HISTORY
      // =================================================

      const updatedHistory =
        Array.isArray(nextResult.history)
          ? nextResult.history
          : [
              ...history,
              {
                question:
                  evaluation.question,

                answer:
                  currentAnswer,

                score:
                  evaluation.final_score,

                difficulty:
                  currentQuestion.difficulty ||
                  "Medium",

                feedback:
                  evaluation.feedback,
              },
            ];

      setHistory(
        updatedHistory
      );

      sessionStorage.setItem(
        "current_interview_history",
        JSON.stringify(
          updatedHistory
        )
      );

      // =================================================
      // ADD NEXT QUESTION
      // =================================================

      const nextQuestion =
        nextResult.nextQuestion;

      const updatedQuestions = [
        ...questions,
        nextQuestion,
      ];

      setQuestions(
        updatedQuestions
      );

      sessionStorage.setItem(
        "current_interview_questions",
        JSON.stringify(
          updatedQuestions
        )
      );

      // =================================================
      // MOVE FORWARD
      // =================================================

      setCurrentIndex(
        currentIndex + 1
      );

    } catch (error) {
      console.error(
        "Next question failed:",
        error
      );

      const message =
        error?.response?.data?.details ||
        error?.response?.data?.error ||
        error?.message ||
        "Unable to generate next question.";

      setErrorMessage(message);

    } finally {
      setIsEvaluating(false);
    }
  };

// =====================================================
// SUBMIT FINAL QUESTION
// =====================================================

const handleSubmit = async () => {
  try {
    setIsSubmitting(true);
    setErrorMessage("");

    // ===================================================
    // CURRENT QUESTION + ANSWER
    // ===================================================

    const currentQuestion =
      questions[currentIndex];

    const currentAnswer =
      answers[currentIndex];

    if (!currentQuestion) {
      throw new Error(
        "Final question not found."
      );
    }

    if (
      !currentAnswer ||
      !currentAnswer.trim()
    ) {
      throw new Error(
        "Please provide an answer."
      );
    }

    if (!sessionId) {
      throw new Error(
        "Interview session not found."
      );
    }

    // ===================================================
    // CURRENT USER
    // ===================================================

    const user =
      getCurrentUser();

    const candidateId =
      user?.id || null;

    if (!candidateId) {
      throw new Error(
        "User not found. Please login again."
      );
    }

    // ===================================================
    // QUESTION ID
    // ===================================================

    const currentQuestionId =
      currentQuestion.id ||
      currentQuestion.question_id;

    if (!currentQuestionId) {
      throw new Error(
        "Final question ID not found."
      );
    }

    // ===================================================
    // START TIME
    // ===================================================

    const startedAt =
      sessionStorage.getItem(
        "current_interview_started_at"
      );

    // ===================================================
    // SUBMIT FINAL ANSWER
    //
    // This calls:
    //
    // POST /api/interview/evaluate
    //
    // through submitAnswers() in api.js
    // ===================================================

    console.log(
      "========== SUBMITTING FINAL INTERVIEW =========="
    );

    const result =
      await submitAnswers({
        candidateId,

        sessionId,

        companyId:
          companyId
            ? Number(companyId)
            : null,

        roleId:
          roleId
            ? Number(roleId)
            : null,

        currentQuestionId,

        currentAnswer:
          currentAnswer.trim(),

        testType:
          "interview",

        startedAt,

        // Send existing evaluated answers too
        answers:
          Array.isArray(evaluatedAnswers)
            ? evaluatedAnswers
            : [],
      });

    console.log(
      "========== FINAL SUBMISSION RESPONSE =========="
    );

    console.dir(
      result,
      { depth: null }
    );

    // ===================================================
    // VALIDATE BACKEND RESPONSE
    // ===================================================

    if (
      !result ||
      !result.success
    ) {
      throw new Error(
        result?.details ||
        result?.error ||
        result?.message ||
        "Interview submission failed."
      );
    }

    // ===================================================
    // FINAL SESSION ID
    // ===================================================

    const finalSessionId =
      result.sessionId ||
      sessionId;

    // ===================================================
    // SAVE FEEDBACK DATA BEFORE CLEARING SESSION
    //
    // Feedback.jsx can read this from location.state.
    // ===================================================

    const feedbackState = {
      candidateId,

      sessionId:
        finalSessionId,

      role:
        role || "General",

      company:
        company || "General",

      roleId:
        roleId
          ? Number(roleId)
          : null,

      companyId:
        companyId
          ? Number(companyId)
          : null,

      topic:
        topic || "General",

      testType:
        "interview",

      // Backend final response
      result,

      // All evaluations collected during interview
      evaluations:
        Array.isArray(evaluatedAnswers)
          ? evaluatedAnswers
          : [],

      // Interview history
      history:
        Array.isArray(history)
          ? history
          : [],
    };

    console.log(
      "========== NAVIGATING TO FEEDBACK =========="
    );

    console.dir(
      feedbackState,
      { depth: null }
    );

    // ===================================================
    // CLEAR ACTIVE INTERVIEW SESSION
    // ===================================================

    sessionStorage.removeItem(
      "current_interview_questions"
    );

    sessionStorage.removeItem(
      "current_interview_answers"
    );

    sessionStorage.removeItem(
      "current_interview_evaluations"
    );

    sessionStorage.removeItem(
      "current_interview_history"
    );

    sessionStorage.removeItem(
      "current_interview_session_id"
    );

    sessionStorage.removeItem(
      "current_interview_started_at"
    );

    sessionStorage.removeItem(
      "current_interview"
    );

    // ===================================================
    // GO TO FEEDBACK PAGE
    // ===================================================

    navigate(
      "/feedback",
      {
        state: feedbackState,
        replace: true,
      }
    );

  } catch (error) {
    console.error(
      "Final interview submission failed:",
      error
    );

    const message =
      error?.response?.data?.details ||
      error?.response?.data?.error ||
      error?.response?.data?.message ||
      error?.message ||
      "Interview submission failed.";

    setErrorMessage(message);

  } finally {
    setIsSubmitting(false);
  }
};


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="p-10 text-center text-xl animate-pulse">
        Loading Questions...
      </div>
    );
  }

  // =====================================================
  // PROCESSING
  // =====================================================

  if (
    isEvaluating ||
    isSubmitting
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-10 text-center">

        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />

        <h2 className="text-2xl font-bold text-gray-800">

          {isSubmitting
            ? "Submitting your interview..."
            : "Evaluating your answer and generating the next question..."}

        </h2>

        <p className="text-gray-500 mt-2">
          Please wait while the AI processes your response.
        </p>

      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (
    errorMessage &&
    questions.length === 0
  ) {
    return (
      <div className="p-10 max-w-xl mx-auto text-center">

        <div className="bg-red-50 border border-red-200 rounded-xl p-6">

          <h2 className="text-xl font-bold text-red-700 mb-3">
            Unable to load interview
          </h2>

          <p className="text-red-600 mb-5">
            {errorMessage}
          </p>

          <button
            onClick={() =>
              window.location.reload()
            }
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold"
          >
            Retry
          </button>

        </div>

      </div>
    );
  }

  // =====================================================
  // NO QUESTIONS
  // =====================================================

  if (
    questions.length === 0
  ) {
    return (
      <div className="p-10 text-center">
        No questions found.
      </div>
    );
  }

  // =====================================================
  // CURRENT QUESTION
  // =====================================================

  const currentQuestion =
    questions[currentIndex];

  if (!currentQuestion) {
    return (
      <div className="p-10 text-center">
        Unable to load current question.
      </div>
    );
  }

  const questionText =
    currentQuestion.question_text ||
    currentQuestion.question ||
    "";

  const isLastQuestion =
    currentIndex === TOTAL - 1;

  const progress =
    ((currentIndex + 1) / TOTAL) * 100;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="p-10 max-w-2xl mx-auto shadow-xl rounded-2xl bg-white border mt-10">

      {/* Progress */}

      <div className="w-full bg-gray-200 h-2 rounded-full mb-6">

        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${Math.min(
              progress,
              100
            )}%`,
          }}
        />

      </div>

      {/* Header */}

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-xl font-bold text-blue-700">

          Question{" "}
          {currentIndex + 1} of{" "}
          {TOTAL}

        </h2>

        <span className="text-sm text-gray-500 font-semibold">

          {currentQuestion.difficulty ||
            "Medium"}

        </span>

      </div>

      {/* Question */}

      <div className="mb-8">

        <p className="text-2xl font-semibold text-gray-800 mb-4">

          {questionText}

        </p>

        <textarea
          className="w-full p-4 border-2 rounded-xl focus:border-blue-500 outline-none transition-all resize-none"
          rows="6"
          placeholder="Type your response here..."
          value={
            answers[currentIndex] || ""
          }
          onChange={
            handleInputChange
          }
          disabled={
            isEvaluating ||
            isSubmitting
          }
        />

      </div>

      {/* Error */}

      {errorMessage && (

        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">

          {errorMessage}

        </div>

      )}

      {/* Navigation */}

      <div className="flex justify-end">

        {isLastQuestion ? (

          <button
            onClick={handleSubmit}
            disabled={
              !answers[
                currentIndex
              ]?.trim() ||
              isSubmitting ||
              isEvaluating
            }
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >

            Submit Interview ✅

          </button>

        ) : (

          <button
            onClick={handleNext}
            disabled={
              !answers[
                currentIndex
              ]?.trim() ||
              isEvaluating ||
              isSubmitting
            }
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >

            Evaluate & Next ➔

          </button>

        )}

      </div>

    </div>
  );
}