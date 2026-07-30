import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchQuestions, submitAnswers } from "../config/api";

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roleId, companyId } = location.state || {};
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!roleId) {
      navigate("/mock-interview");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const savedQuestions = sessionStorage.getItem("current_interview_questions");

        if (savedQuestions) {
          setQuestions(JSON.parse(savedQuestions));
        } else {
          const data = await fetchQuestions({ roleId, companyId });
          setQuestions(data);
          sessionStorage.setItem("current_interview_questions", JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to load questions", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [roleId, companyId, navigate]);

  const handleInputChange = (e) => {
    setAnswers({ ...answers, [currentIndex]: e.target.value });
  };

  const handleNext = () => {
    if (!answers[currentIndex] || answers[currentIndex].trim() === "") {
      return alert("Please provide an answer before moving to the next question.");
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}") || {};
      const payload = {
        candidateId: user.id,
        roleId,
        companyId,
        testType: "interview",
        startedAt: new Date().toISOString(),
        answers: questions.map((q, index) => ({
          questionId: q.id,
          answerText: answers[index] || "",
        })),
      };

      const result = await submitAnswers(payload);

      if (result?.success) {
        navigate("/feedback", {
          state: {
            candidateId: payload.candidateId,
            sessionId: result.sessionId,
          },
        });
      } else {
        throw new Error("No session ID returned from server");
      }
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Submission failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-xl animate-pulse">Loading Questions...</div>;

  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-10 text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800">Analyzing your responses...</h2>
        <p className="text-gray-500 mt-2">Your interview is being recorded and scored.</p>
      </div>
    );
  }

  if (questions.length === 0) return <div className="p-10 text-center">No questions found for this criteria.</div>;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <div className="p-10 max-w-2xl mx-auto shadow-xl rounded-2xl bg-white border mt-10">
      <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
        <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-700">Question {currentIndex + 1} of {questions.length}</h2>
      </div>

      <div className="mb-8">
        <p className="text-2xl font-semibold text-gray-800 mb-4">{currentQuestion.question_text}</p>
        <textarea className="w-full p-4 border-2 rounded-xl focus:border-blue-500 outline-none transition-all" rows="6" placeholder="Type your response here..." value={answers[currentIndex] || ""} onChange={handleInputChange} />
      </div>

      <div className="flex justify-end">
        {isLastQuestion ? (
          <button onClick={handleSubmit} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg">Submit Interview ✅</button>
        ) : (
          <button onClick={handleNext} className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg">Next Question ➔</button>
        )}
      </div>
    </div>
  );
}