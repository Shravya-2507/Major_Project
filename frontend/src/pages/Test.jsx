import { useParams } from "react-router-dom";
import { useState } from "react";

export default function Test() {
  const { type, company } = useParams();

  const [answers, setAnswers] = useState({});

  const questions = [
    {
      id: 1,
      question: "What is time complexity of binary search?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    },
  ];

  const handleChange = (qid, value) => {
    setAnswers({ ...answers, [qid]: value });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">
        {type} Test {company && `- ${company}`}
      </h2>

      {questions.map((q) => (
        <div key={q.id} className="mb-6">
          <p className="font-medium">{q.question}</p>

          {q.options.map((opt) => (
            <label key={opt} className="block">
              <input
                type="radio"
                name={q.id}
                onChange={() => handleChange(q.id, opt)}
              />
              {opt}
            </label>
          ))}
        </div>
      ))}
    </div>
  );
}