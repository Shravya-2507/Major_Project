import { useState } from "react";
import { motion } from "framer-motion";
import { Play, RotateCcw } from "lucide-react";

const questions = [
  {
    id: 1,
    title: "Two Sum",
    description:
      "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    testCases: [
      { input: "[2,7,11,15], target=9", output: "[0,1]" },
      { input: "[3,2,4], target=6", output: "[1,2]" },
    ],
  },
  {
    id: 2,
    title: "Palindrome Check",
    description: "Check if a given string is a palindrome.",
    testCases: [
      { input: "racecar", output: "true" },
      { input: "hello", output: "false" },
    ],
  },
];

export default function CodingTest() {
  const [currentQ, setCurrentQ] = useState(0);
  const [code, setCode] = useState("// Write your code here...");
  const [output, setOutput] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [loading, setLoading] = useState(false);

  const question = questions[currentQ];

  const runCode = () => {
    setLoading(true);
    setTimeout(() => {
      setOutput(
        question.testCases
          .map(
            (tc, i) =>
              `Test Case ${i + 1}:\nInput: ${tc.input}\nExpected: ${tc.output}\nResult: ✅ Passed\n`
          )
          .join("\n")
      );
      setLoading(false);
    }, 1000);
  };

  const resetCode = () => {
    setCode("// Write your code here...");
    setOutput("");
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#0f0f1a] text-white flex">
      
      {/* LEFT PANEL (QUESTION) */}
      <div className="w-1/2 h-full bg-white text-black flex flex-col">
        
        {/* HEADER */}
        <div className="p-4 border-b font-semibold text-lg">
          {question.title}
        </div>

        {/* CONTENT */}
        <div className="p-4 overflow-y-auto flex-1">
          <p className="text-gray-700 mb-4">{question.description}</p>

          <h3 className="font-semibold mb-2">Test Cases:</h3>
          {question.testCases.map((tc, i) => (
            <div key={i} className="bg-gray-100 p-3 rounded-lg mb-2 text-sm">
              <p><b>Input:</b> {tc.input}</p>
              <p><b>Output:</b> {tc.output}</p>
            </div>
          ))}
        </div>

        {/* FOOTER NAV */}
        <div className="p-4 border-t flex justify-between">
          <button
            disabled={currentQ === 0}
            onClick={() => setCurrentQ((prev) => prev - 1)}
            className="px-4 py-2 bg-gray-200 rounded"
          >
            Prev
          </button>
          <button
            disabled={currentQ === questions.length - 1}
            onClick={() => setCurrentQ((prev) => prev + 1)}
            className="px-4 py-2 bg-indigo-500 text-white rounded"
          >
            Next
          </button>
        </div>
      </div>

      {/* RIGHT PANEL (EDITOR) */}
      <div className="w-1/2 h-full flex flex-col bg-[#1e1e2f]">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center p-3 bg-[#2a2a40]">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-gray-800 px-3 py-1 rounded"
          >
            <option>javascript</option>
            <option>python</option>
            <option>java</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={runCode}
              className="flex items-center gap-1 bg-green-500 px-3 py-1 rounded"
            >
              <Play size={16} /> Run
            </button>

            <button
              onClick={resetCode}
              className="flex items-center gap-1 bg-red-500 px-3 py-1 rounded"
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
        </div>

        {/* EDITOR */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 bg-transparent p-4 font-mono text-sm outline-none resize-none"
        />

        {/* CONSOLE */}
        <div className="h-40 bg-black p-3 text-sm overflow-y-auto border-t border-gray-700">
          {loading ? "Running..." : output || "Output will appear here..."}
        </div>
      </div>
    </div>
  );
}