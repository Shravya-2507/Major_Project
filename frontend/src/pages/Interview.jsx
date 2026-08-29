import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchQuestions, submitAnswers } from "../services/api";

const TOTAL_QUESTIONS = 5;

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract navigation state
  const { roleId, companyId } = location.state || {};

  // =========================================
  // Interview State
  // =========================================
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [history, setHistory] = useState([]);

  // FIX: loading state was missing
  const [loading, setLoading] = useState(true);

  // Submission & Report State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState(null);

  // =========================================
  // LOAD QUESTIONS
  // =========================================
  useEffect(() => {
    if (!roleId) {
      navigate("/mock-interview");
      return;
    }

    const loadFirstQuestion = async () => {
      try {
        setLoading(true);

        const savedQuestions = sessionStorage.getItem(
          "current_interview_questions"
        );

        if (savedQuestions) {
          setQuestions(JSON.parse(savedQuestions));
        } else {
          const data = await fetchQuestions({
            roleId,
            companyId
          });

          setQuestions(data);

          sessionStorage.setItem(
            "current_interview_questions",
            JSON.stringify(data)
          );
        }
      } catch (err) {
        console.error("Failed to load questions", err);
      } finally {
        setLoading(false);
      }
    };

    // FIX: was load()
    loadFirstQuestion();

  }, [roleId, companyId, navigate]);

  // =========================================
  // ANSWER INPUT
  // =========================================
  const handleInputChange = (e) => {
    setAnswers({
      ...answers,
      [currentIndex]: e.target.value
    });
  };

  // =========================================
  // NEXT QUESTION
  // DO NOT CHANGE THIS LOGIC
  // =========================================
  const handleNext = () => {
    if (
      !answers[currentIndex] ||
      answers[currentIndex].trim() === ""
    ) {
      return alert(
        "Please provide an answer before moving to the next question."
      );
    }

    setCurrentIndex((prev) => prev + 1);
  };

  // =========================================
  // SUBMIT INTERVIEW
  // =========================================
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Get logged-in user
      const savedUser = localStorage.getItem("user");

      const user = savedUser
        ? JSON.parse(savedUser)
        : null;

      // Safety check
      if (!user || !user.id) {
        alert("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      // Create payload
      const payload = {
        candidateId: user.id,

        roleId: roleId,

        companyId: companyId,

        answers: questions.map((q, index) => ({
          questionId: q.id,
          answerText: answers[index] || ""
        }))
      };

      console.log("Submitting interview:", payload);

      const result = await submitAnswers(payload);

      console.log("Submit response:", result);

      if (
        result &&
        (result.sessionId || result.session_id)
      ) {
        // Clear old interview questions
        sessionStorage.removeItem(
          "current_interview_questions"
        );

        // Navigate to feedback page
        navigate("/feedback", {
          state: {
            candidateId: user.id,

            sessionId:
              result.sessionId ||
              result.session_id
          }
        });

      } else {
        throw new Error(
          "No session ID returned from server"
        );
      }

    } catch (err) {
      console.error(
        "Submission failed:",
        err
      );

      alert(
        "Submission failed. Please try again."
      );

      setIsSubmitting(false);
    }
  };

  // =========================================
  // LOADING QUESTIONS
  // =========================================
  if (loading) {
    return (
      <div className="p-10 text-center text-xl animate-pulse">
        Loading Questions...
      </div>
    );
  }

  // =========================================
  // ANALYSIS IN PROGRESS
  // =========================================
  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-10 text-center">

        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>

        <h2 className="text-2xl font-bold text-gray-800">
          Analyzing your responses...
        </h2>

        <p className="text-gray-500 mt-2">
          Our AI is grading your interview.
          Please don't close this page.
        </p>

      </div>
    );
  }

  // =========================================
  // NO QUESTIONS
  // =========================================
  if (questions.length === 0) {
    return (
      <div className="p-10 text-center">
        No questions found for this criteria.
      </div>
    );
  }

  // =========================================
  // CURRENT QUESTION
  // =========================================
  const currentQuestion =
    questions[currentIndex];

  const isLastQuestion =
    currentIndex === questions.length - 1;

  // =========================================
  // ACTIVE INTERVIEW
  // =========================================
  return (
    <div className="p-10 max-w-2xl mx-auto shadow-xl rounded-2xl bg-white border mt-10">

      {/* Progress */}
      <div className="w-full bg-gray-200 h-2 rounded-full mb-6">

        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{
            width: `${
              ((currentIndex + 1) /
                questions.length) *
              100
            }%`
          }}
        />

      </div>

      {/* Question Number */}
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-xl font-bold text-blue-700">
          Question {currentIndex + 1} of{" "}
          {questions.length}
        </h2>

      </div>

      {/* Question */}
      <div className="mb-8">

        <p className="text-2xl font-semibold text-gray-800 mb-4">
          {currentQuestion.question_text}
        </p>

        <textarea
          className="w-full p-4 border-2 rounded-xl focus:border-blue-500 outline-none transition-all"
          rows="6"
          placeholder="Type your response here..."
          value={
            answers[currentIndex] || ""
          }
          onChange={handleInputChange}
        />

      </div>

      {/* Navigation */}
      <div className="flex justify-end">

        {isLastQuestion ? (

          <button
            onClick={handleSubmit}
            disabled={
              !answers[currentIndex]?.trim()
            }
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg disabled:bg-gray-400"
          >
            Submit Interview ✅
          </button>

        ) : (

          <button
            onClick={handleNext}
            disabled={
              !answers[currentIndex]?.trim()
            }
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg disabled:bg-gray-400"
          >
            Next Question ➔
          </button>

        )}

      </div>

    </div>
  );
}