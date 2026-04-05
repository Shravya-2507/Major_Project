import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// General question sets
const questionSets = {
  vtu: [
    {
      q: "What is normalization?",
      options: ["Process of organizing data", "Backup", "Sorting", "Indexing"],
      answer: "Process of organizing data",
    },
    {
      q: "What is a process in OS?",
      options: ["Program in execution", "File", "Thread", "Memory"],
      answer: "Program in execution",
    },
  ],
};

// Company-specific questions
const companyQuestions = {
  TCS: [
    {
      q: "What is SDLC?",
      options: ["Software lifecycle", "Database", "Network", "Process"],
      answer: "Software lifecycle",
    },
  ],
  Infosys: [
    {
      q: "What is OOP?",
      options: ["Programming paradigm", "Database", "Loop", "Array"],
      answer: "Programming paradigm",
    },
  ],
  Wipro: [
    {
      q: "What is cloud computing?",
      options: ["Internet-based computing", "Storage", "OS", "CPU"],
      answer: "Internet-based computing",
    },
  ],
};

const Test = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const type = location.state?.type || "vtu";
  const company = location.state?.company;

  // Decide questions dynamically
  let questions;
  if (type === "company" && company) {
    questions = companyQuestions[company] || [];
  } else {
    questions = questionSets[type] || [];
  }

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState("");
  const [time, setTime] = useState(60);

  // Timer
  useEffect(() => {
    if (time === 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [time]);

  const handleNext = () => {
    if (!selected) return;

    const updatedAnswers = [...answers, selected];
    setAnswers(updatedAnswers);
    setSelected("");

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      navigate("/test-result", {
        state: { answers: updatedAnswers, questions },
      });
    }
  };

  const handleSubmit = () => {
    navigate("/test-result", {
      state: { answers: [...answers, selected], questions },
    });
  };

  if (!questions.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No questions available.
      </div>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50 p-6">
      
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-xl">
        
        {/* Header */}
        <div className="flex justify-between mb-4">
          <span className="text-sm text-gray-500">
            Time Left: {time}s
          </span>
          <span className="text-sm text-gray-500">
            Q {current + 1}/{questions.length}
          </span>
        </div>

        {/* Progress */}
        <div className="w-full bg-gray-200 h-2 rounded-full mb-4">
          <div
            className="bg-indigo-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Question */}
        <h2 className="text-lg font-semibold mb-4">
          {q.q}
        </h2>

        {/* Options */}
        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setSelected(opt)}
              className={`w-full p-3 rounded-xl border transition ${
                selected === opt
                  ? "bg-indigo-500 text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Next / Submit */}
        <button
          onClick={handleNext}
          className="mt-5 w-full bg-indigo-500 text-white py-2 rounded-xl hover:bg-indigo-600 transition"
        >
          {current === questions.length - 1 ? "Submit Test" : "Next"}
        </button>

      </div>
    </div>
  );
};

export default Test;