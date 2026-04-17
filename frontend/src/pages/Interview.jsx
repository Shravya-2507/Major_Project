import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchQuestions, submitAnswers, getReport } from "../services/api";

export default function Interview() {
  const location = useLocation();
  const navigate = useNavigate();

  // Extract navigation state
  const { roleId, companyId } = location.state || {};

  // Core State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);

  // Submission & Report State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [report, setReport] = useState(null);

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

  // ==============================
  // UPDATED: Submit Logic
  // ==============================
 

    const handleSubmit = async () => {
  try {
    setIsSubmitting(true);

    // 1. Get the logged-in user from localStorage
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;

    // 2. Safety Check: If no user is found, don't allow submission
    if (!user || !user.id) {
      alert("Session expired. Please log in again.");
      navigate("/login");
      return;
    }

    // 3. Create the payload using the dynamic user.id
    const payload = {
      candidateId: user.id, // <--- CHANGED FROM 1 TO DYNAMIC ID
      roleId: roleId,       // Add this (from location.state)
      companyId: companyId,
      answers: questions.map((q, index) => ({
        questionId: q.id,
        answerText: answers[index] || ""
      }))
    };

    const result = await submitAnswers(payload); 

    if (result && (result.sessionId || result.session_id)) {
      // Clear session storage so a new interview can start next time
      sessionStorage.removeItem("current_interview_questions");

      navigate("/feedback", { 
        state: { 
          candidateId: user.id, // Use dynamic ID for feedback too
          sessionId: result.sessionId || result.session_id 
        } 
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
  // UI STATE: Initial Question Loading
  if (loading) return <div className="p-10 text-center text-xl animate-pulse">Loading Questions...</div>;

  // UI STATE: Analysis in Progress
  if (isSubmitting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-10 text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-800">Analyzing your responses...</h2>
        <p className="text-gray-500 mt-2">Our AI is grading your interview. Please don't close this page.</p>
      </div>
    );
  }

  // UI STATE: Display Final Report
  if (report) {
    return (
      <div className="p-10 max-w-3xl mx-auto bg-white shadow-2xl rounded-2xl border mt-10">
        <h2 className="text-3xl font-extrabold text-blue-800 mb-6">Interview Feedback</h2>
        <div className="space-y-6">
          {report.map((item, idx) => (
            <div key={idx} className="p-6 bg-gray-50 rounded-xl border-l-4 border-green-500">
              <h3 className="font-bold text-lg text-gray-800">Q: {item.question_text || `Question ${item.question_id}`}</h3>
              <div className="flex items-center my-2 gap-2">
                <span className="bg-green-100 text-green-800 text-xs font-bold px-2.5 py-0.5 rounded">
                  Score: {item.ai_score}/10
                </span>
              </div>
              <p className="text-gray-700 bg-white p-3 rounded border mt-2 italic">
                <span className="font-semibold text-blue-600">AI Feedback:</span> {item.ai_feedback}
              </p>
            </div>
          ))}
        </div>
        <button 
          onClick={() => navigate("/dashboard")}
          className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  // UI STATE: No Questions Found
  if (questions.length === 0) return <div className="p-10 text-center">No questions found for this criteria.</div>;

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;

  // UI STATE: Active Interview Question
  return (
    <div className="p-10 max-w-2xl mx-auto shadow-xl rounded-2xl bg-white border mt-10">
      <div className="w-full bg-gray-200 h-2 rounded-full mb-6">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-blue-700">Question {currentIndex + 1} of {questions.length}</h2>
      </div>

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