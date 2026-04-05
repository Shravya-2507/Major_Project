import { useState } from "react";

const ChatInput = ({ onSend }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSend(input);
    setInput("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-white flex gap-2 shadow-inner"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your answer..."
        className="flex-1 border rounded-xl px-4 py-2 focus:outline-none"
      />

      <button
        type="submit"
        className="bg-indigo-500 text-white px-4 py-2 rounded-xl hover:bg-indigo-600"
      >
        Send
      </button>
    </form>
  );
};

export default ChatInput;