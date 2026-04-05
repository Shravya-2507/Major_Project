import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const TestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { answers = [], questions = [] } = location.state || {};

  let score = 0;

  questions.forEach((q, i) => {
    if (answers[i] === q.answer) {
      score += 1;
    }
  });

  const percentage = Math.round((score / questions.length) * 100);

  // Save to leaderboard
  useEffect(() => {
    const prev = JSON.parse(localStorage.getItem("leaderboard")) || [];

    const newEntry = {
      score: percentage,
      date: new Date().toLocaleString(),
    };

    const updated = [...prev, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    localStorage.setItem("leaderboard", JSON.stringify(updated));
  }, []);

  const leaderboard =
    JSON.parse(localStorage.getItem("leaderboard")) || [];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-purple-50 p-6">
      
      <div className="bg-white p-8 rounded-2xl shadow-md text-center w-full max-w-md">
        
        <h1 className="text-2xl font-bold mb-4">Test Result</h1>

        <p className="text-4xl text-indigo-500 font-bold mb-4">
          {percentage}%
        </p>

        <p className="mb-6">
          You answered {score} out of {questions.length} correctly.
        </p>

        {/* Leaderboard */}
        <div className="text-left mb-6">
          <h3 className="font-semibold mb-2">Top Scores</h3>
          <ul className="text-sm text-gray-600">
            {leaderboard.map((item, i) => (
              <li key={i}>
                {item.score}% - {item.date}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => navigate("/practice")}
          className="bg-indigo-500 text-white px-6 py-2 rounded-xl"
        >
          Back
        </button>

      </div>
    </div>
  );
};

export default TestResult;