import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchVtuQuestions, submitAnswers } from "../services/api";

export default function Test() {
  const navigate = useNavigate();

  // Core State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        // Check session storage first to maintain state on refresh
        const saved = sessionStorage.getItem("vtu_test_questions");
        
        if (saved) {
          setQuestions(JSON.parse(saved));
        } else {
          const data = await fetchVtuQuestions();
          setQuestions(data);
          sessionStorage.setItem("vtu_test_questions", JSON.stringify(data));
        }
      } catch (err) {
        console.error("Failed to load VTU questions", err);
      } finally {
        setLoading(false);
      }
    };
    
    load();
  }, []);

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
      if (!answers[currentIndex] || answers[currentIndex].trim() === "") {
        return alert("Please answer the final question before submitting.");
      }

      setIsSubmitting(true);

      const payload = {
        candidateId: 1, // Default or from Auth context
        answers: questions.map((q, index) => ({
          questionId: q.id,
          answerText: answers[index] || ""
        }))
      };

      const result = await submitAnswers(payload); 

      if (result && (result.sessionId || result.session_id)) {
        // Clear session storage as the test is done
        sessionStorage.removeItem("vtu_test_questions");
        
        navigate("/feedback", { 
          state: { 
            candidateId: payload.candidateId, 
            sessionId: result.sessionId || result.session_id 
          } 
        });
      } else {
        throw new Error("No session ID returned");
      }

    } catch (err) {
      console.error("Submission failed:", err);
      alert("Submission failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  // 1. Loading State
  if (loading) return <div className="p-10 text-center text-xl animate-pulse">Loading VTU Questions...</div>;

  // 2. Submitting/Analyzing State
  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-10 text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800">Analyzing your responses...</h2>
        <p className="text-gray-500 mt-2">Our AI is grading your VTU test. Please don't close this page.</p>
      </div>
    );
  }

  // 3. No Questions Found
  if (questions.length === 0) return <div className="p-10 text-center">No VTU questions found.</div>;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // 4. Main Test UI (Exact match to Interview.jsx)
  return (
    <div className="p-10 max-w-2xl mx-auto shadow-xl rounded-2xl bg-white border mt-10 mb-10">
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      {/* Counter */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-700">Question {currentIndex + 1} of {questions.length}</h2>
      </div>

      {/* Question & Input */}
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

      {/* Navigation */}
      <div className="flex justify-end gap-4">
        {currentIndex > 0 && (
            <button
                onClick={() => setCurrentIndex(prev => prev - 1)}
                className="bg-gray-100 text-gray-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-200"
            >
                Previous
            </button>
        )}

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-lg transition-all"
          >
            Submit Test ✅
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 shadow-lg transition-all"
          >
            Next Question ➔
          </button>
        )}
      </div>
    </div>
  );
}