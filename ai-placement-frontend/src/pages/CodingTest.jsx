import { useState } from "react";

export default function CodingTest() {
  const [code, setCode] = useState("");

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Coding Test</h2>

      <p className="mb-2">Write a function to reverse a string.</p>

      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        className="w-full h-64 p-4 border rounded-lg font-mono"
        placeholder="Write your code here..."
      />

      <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
        Submit Code
      </button>
    </div>
  );
}