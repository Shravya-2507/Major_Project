import { useLocation, useNavigate } from "react-router-dom";

const keywords = ["data", "process", "system", "memory", "algorithm"];

const Feedback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const answers = location.state?.answers || [];

  let score = 0;

  answers.forEach((ans) => {
    keywords.forEach((word) => {
      if (ans.toLowerCase().includes(word)) {
        score += 10;
      }
    });
  });

  score = Math.min(score, 100);

  const feedbackText =
    score > 80
      ? "Excellent performance! 🚀"
      : score > 50
      ? "Good job! 👍"
      : "Keep practicing 💪";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
      
      <div className="bg-white p-8 rounded-3xl shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Feedback</h1>

        <p className="text-5xl text-indigo-500 font-bold mb-4">
          {score}%
        </p>

        <p className="mb-6">{feedbackText}</p>

        <button
          onClick={() => navigate("/dashboard")}
          className="bg-indigo-500 text-white px-6 py-2 rounded-xl"
        >
          Back
        </button>
      </div>

    </div>
  );
};

export default Feedback;