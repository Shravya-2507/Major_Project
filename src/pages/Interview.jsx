import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ChatWindow from "../components/interview/ChatWindow";
import ChatInput from "../components/interview/ChatInput";

const questionBank = {
  DSA: [
    "What is a linked list?",
    "Explain time complexity.",
    "What is a stack?",
  ],
  DBMS: [
    "What is normalization?",
    "Explain ACID properties.",
    "What is indexing?",
  ],
  OS: [
    "What is a process?",
    "Explain deadlock.",
    "What is virtual memory?",
  ],
  CN: [
    "What is TCP?",
    "Explain OSI model.",
    "What is IP address?",
  ],
};

const Interview = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const skill = location.state?.skill || "DSA";

  const [messages, setMessages] = useState([
    { role: "ai", text: `Starting ${skill} interview 🚀` },
    { role: "ai", text: questionBank[skill][0] },
  ]);

  const [answers, setAnswers] = useState([]);
  const [qIndex, setQIndex] = useState(0);

  const handleSend = (input) => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setAnswers((prev) => [...prev, input]);

    let nextIndex = qIndex + 1;

    let aiMsg;
    if (nextIndex < questionBank[skill].length) {
      aiMsg = {
        role: "ai",
        text: questionBank[skill][nextIndex],
      };
      setQIndex(nextIndex);
    } else {
      aiMsg = {
        role: "ai",
        text: "Interview completed! Click finish to see results.",
      };
    }

    setMessages((prev) => [...prev, userMsg, aiMsg]);
  };

  const handleFinish = () => {
    navigate("/feedback", { state: { answers, skill } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col">
      
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-lg font-semibold text-gray-700">
          {skill} Interview
        </h1>

        <button
          onClick={handleFinish}
          className="bg-green-500 text-white px-4 py-2 rounded-xl"
        >
          Finish
        </button>
      </div>

      <ChatWindow messages={messages} />
      <ChatInput onSend={handleSend} />
    </div>
  );
};

export default Interview;