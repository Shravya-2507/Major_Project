import { useEffect, useState } from "react";
import { fetchQuestions, submitAnswers } from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Interview() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  const candidateId = 1; // TEMP (later from login)

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    const data = await fetchQuestions({
      roleId: 1,
      companyId: null,
    });
    setQuestions(data);
  };

  const handleChange = (id, value) => {
    setAnswers({ ...answers, [id]: value });
  };

  const handleSubmit = async () => {
    const formattedAnswers = Object.keys(answers).map((qid) => ({
      questionId: Number(qid),
      answerText: answers[qid],
    }));

    const res = await submitAnswers({
      candidateId,
      answers: formattedAnswers,
      roleId: 1,
      companyId: null,
    });

    navigate("/feedback", {
      state: {
        sessionId: res.sessionId,
        candidateId,
      },
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Mock Interview</h2>

      {questions.map((q) => (
        <div key={q.id} className="mb-6">
          <p className="font-medium">{q.question_text}</p>

          <textarea
            className="w-full border p-2 mt-2 rounded"
            onChange={(e) => handleChange(q.id, e.target.value)}
          />
        </div>
      ))}

      <button
        onClick={handleSubmit}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        Submit Answers
      </button>
    </div>
  );
}