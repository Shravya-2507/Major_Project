import { useEffect, useRef } from "react";

const ChatWindow = ({ messages }) => {
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-4">
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`max-w-xl px-4 py-2 rounded-2xl ${
            msg.role === "ai"
              ? "bg-white text-gray-700"
              : "bg-indigo-500 text-white ml-auto"
          }`}
        >
          {msg.text}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;