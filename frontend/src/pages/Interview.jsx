import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchQuestions, submitAnswers } from "../services/api";

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  // =========================================
  // Extract navigation state
  // =========================================
  const {
    roleId,
    companyId,
    role,
    company,
    topic,
    question_type = "Technical",
    category = "Conceptual",
  } = location.state || {};

  // Core State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================================
  // Load Questions
  // =========================================
  useEffect(() => {
    // We still require roleId because it is needed
    // later when submitting the interview.
    if (!roleId) {
      navigate("/mock-interview");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);

        // =====================================
        // Check cached questions first
        // =====================================
        const savedQuestions = sessionStorage.getItem(
          "current_interview_questions"
        );

        if (savedQuestions) {
          const parsedQuestions = JSON.parse(savedQuestions);

          if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
            setQuestions(parsedQuestions);
            return;
          }
        }

        // =====================================
        // Get role/topic information
        // =====================================

        // First try navigation state
        let interviewRole = role;
        let interviewCompany = company || "General";
        let interviewTopic = topic;

        // Fallback to sessionStorage if necessary
        if (!interviewRole || !interviewTopic) {
          const savedInterview = sessionStorage.getItem(
            "current_interview"
          );

          if (savedInterview) {
            try {
              const parsedInterview = JSON.parse(savedInterview);

              interviewRole =
                interviewRole ||
                parsedInterview.role ||
                parsedInterview.roleName;

              interviewCompany =
                interviewCompany ||
                parsedInterview.company ||
                parsedInterview.companyName ||
                "General";

              interviewTopic =
                interviewTopic ||
                parsedInterview.topic;
            } catch (storageError) {
              console.error(
                "Failed to parse current interview data:",
                storageError
              );
            }
          }
        }

        // =====================================
        // Validate required backend fields
        // =====================================
        if (!interviewRole) {
          throw new Error(
            "Role is missing. Please select a role before starting the interview."
          );
        }

        if (!interviewTopic) {
          throw new Error(
            "Topic is missing. Please select a topic before starting the interview."
          );
        }

        // =====================================
        // Payload expected by existing backend
        // =====================================
        const payload = {
          role: interviewRole,
          company: interviewCompany,
          topic: interviewTopic,
          question_type,
          category,
        };

        console.log(
          "========== FETCHING INTERVIEW QUESTION =========="
        );
        console.log(payload);
        console.log("=================================================");

        // =====================================
        // Call existing backend
        // =====================================
        const data = await fetchQuestions(payload);

        console.log("Question API response:", data);

        // =====================================
        // Backend returns ONE question object
        // Convert it to array for UI
        // =====================================
        const formattedQuestion = {
          id: data.question_id,
          question_text: data.question,
          difficulty: data.difficulty,
          topic: data.topic || interviewTopic,
          role: data.role || interviewRole,
          company: data.company || interviewCompany,
          category: data.category || category,
          question_type: data.question_type || question_type,
        };

        const questionList = [formattedQuestion];

        setQuestions(questionList);

        sessionStorage.setItem(
          "current_interview_questions",
          JSON.stringify(questionList)
        );

      } catch (err) {
        console.error("Failed to load questions:", err);

        alert(
          err.message ||
            "Failed to load interview questions. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [
    roleId,
    companyId,
    role,
    company,
    topic,
    question_type,
    category,
    navigate,
  ]);

  // =========================================
  // Handle Answer Input
  // =========================================
  const handleInputChange = (e) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: e.target.value,
    }));
  };

  // =========================================
  // Next Question
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
  // Submit Interview
  // =========================================
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Get logged-in user
      const savedUser = localStorage.getItem("user");
      const user = savedUser ? JSON.parse(savedUser) : null;

      // Safety check
      if (!user || !user.id) {
        alert("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      // =====================================
      // Build evaluation payload
      // =====================================
      const payload = {
        candidateId: user.id,
        roleId: roleId,
        companyId: companyId,

        answers: questions.map((q, index) => ({
          questionId: q.id,
          answerText: answers[index] || "",
        })),
      };

      console.log(
        "========== SUBMITTING INTERVIEW =========="
      );
      console.log(payload);
      console.log("==========================================");

      const result = await submitAnswers(payload);

      console.log("Evaluation response:", result);

      // =====================================
      // Navigate to feedback
      // =====================================
      if (
        result &&
        (result.sessionId || result.session_id)
      ) {
        sessionStorage.removeItem(
          "current_interview_questions"
        );

        navigate("/feedback", {
          state: {
            candidateId: user.id,
            sessionId:
              result.sessionId ||
              result.session_id,
          },
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
        err.message ||
          "Submission failed. Please try again."
      );

      setIsSubmitting(false);
    }
  };

  // =========================================
  // Loading UI
  // =========================================
  if (loading) {
    return (
      <div className="p-10 text-center text-xl animate-pulse">
        Loading Questions...
      </div>
    );
  }

  // =========================================
  // Submission UI
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
  // No Questions
  // =========================================
  if (questions.length === 0) {
    return (
      <div className="p-10 text-center">
        <h2 className="text-xl font-bold">
          No questions found for this criteria.
        </h2>

        <button
          onClick={() => navigate("/mock-interview")}
          className="mt-5 bg-blue-600 text-white px-6 py-3 rounded-lg"
        >
          Back to Mock Interview
        </button>
      </div>
    );
  }

  // =========================================
  // Current Question
  // =========================================
  const currentQuestion = questions[currentIndex];

  const isLastQuestion =
    currentIndex === questions.length - 1;

  // =========================================
  // Active Interview UI
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
            }%`,
          }}
        ></div>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-700">
          Question {currentIndex + 1} of{" "}
          {questions.length}
        </h2>

        {currentQuestion.difficulty && (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
            {currentQuestion.difficulty}
          </span>
        )}
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
          value={answers[currentIndex] || ""}
          onChange={handleInputChange}
        />
      </div>

      {/* Button */}
      <div className="flex justify-end">
        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg"
          >
            Submit Interview ✅
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg"
          >
            Next Question ➔
          </button>
        )}
      </div>
    </div>
  );
}