import React, { useEffect, useMemo, useState } from "react";
// Removed direct axios import to use the service layer
import { codingAPI } from "../services/api";

export default function CodingTest() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [results, setResults] = useState(null);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState("");

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setQuestionsLoading(true);
        setQuestionsError("");
        const res = await codingAPI.getQuestions();
        
        // FIX: res is already the array/data because handleResponse returns res.json()
        const rows = Array.isArray(res) ? res : (res?.data || []);
        
        setQuestions(rows);
      } catch (err) {
        console.error("Load Questions Error:", err);
        setQuestionsError("Failed to load coding questions from database.");
      } finally {
        setQuestionsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const currentQuestion = questions[currentIndex] || null;

  const parseTestCases = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string") {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const sampleTestCases = useMemo(() => {
    if (!currentQuestion) return [];
    return parseTestCases(currentQuestion.sampleTestCases || currentQuestion.sample_test_cases);
  }, [currentQuestion]);

  const hiddenTestCases = useMemo(() => {
    if (!currentQuestion) return [];
    return parseTestCases(currentQuestion.hiddenTestCases || currentQuestion.hidden_test_cases);
  }, [currentQuestion]);

  const handleRun = async () => {
    setRunLoading(true);
    setOutput("");
    try {
      const fallbackSampleInput = currentQuestion?.sampleInput || currentQuestion?.sample_input || "";
      const stdin = (customInput || fallbackSampleInput || "").toString();

      // FIX: Use codingAPI instead of axios
      const res = await codingAPI.runCode(code, language, stdin);
      
      const runOutput = (res?.output ?? "").toString();
      const runError = (res?.error ?? "").toString();
      setOutput(runOutput || runError || "No output");
    } catch (err) {
      setOutput("Error: " + err.message);
    } finally {
      setRunLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion) return;

    setSubmitLoading(true);
    setResults(null);
    try {
      // Get the ID from your current question object
      const questionId = currentQuestion.id; 

      // FIX: Ensure you pass the questionId as required by your backend
      const res = await codingAPI.submitCode(
        code, 
        language, 
        questionId,      // <--- ADD THIS
        hiddenTestCases
      );
      
      setResults(res);
    } catch (err) {
      console.error("Submit error:", err);
      setResults({ success: false, results: [] });
    } finally {
      setSubmitLoading(false);
    }
  };

  const goPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setResults(null);
    setOutput("");
    setCode(""); // Optional: Clear code on question change
  };

  const goNext = () => {
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
    setResults(null);
    setOutput("");
    setCode(""); // Optional: Clear code on question change
  };

  if (questionsLoading) {
    return <div className="p-6 text-center">Loading coding questions from database...</div>;
  }

  if (questionsError) {
    return <div className="p-6 text-red-600 text-center font-semibold">{questionsError}</div>;
  }

  if (!currentQuestion) {
    return <div className="p-6 text-center">No coding questions found in your database.</div>;
  }

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-screen bg-gray-50">

      {/* LEFT - QUESTION */}
      <div className="border p-6 rounded-lg bg-white shadow-sm overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 border-b pb-2">
          {currentQuestion.title}
        </h2>

        <p className="mt-4 text-gray-700 whitespace-pre-wrap leading-relaxed">
          {currentQuestion.description}
        </p>

        <div className="mt-6 space-y-2 bg-blue-50 p-4 rounded border border-blue-100">
          <p><b>Sample Input:</b> <code className="bg-white px-1 rounded">{currentQuestion.sampleInput || currentQuestion.sample_input || "-"}</code></p>
          <p><b>Sample Output:</b> <code className="bg-white px-1 rounded">{currentQuestion.sampleOutput || currentQuestion.sample_output || "-"}</code></p>
        </div>

        {sampleTestCases.length > 0 && (
          <div className="mt-6">
            <p className="font-semibold text-gray-800">Visible Sample Test Cases</p>
            {sampleTestCases.map((tc, idx) => (
              <div key={idx} className="border p-3 mt-2 rounded bg-gray-50 font-mono text-sm">
                <p className="text-blue-600">Input: {tc.input}</p>
                <p className="text-green-600">Expected: {tc.output}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button 
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition" 
            onClick={goPrev} 
            disabled={currentIndex === 0}
          >
            Previous Question
          </button>
          <button 
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition" 
            onClick={goNext} 
            disabled={currentIndex === questions.length - 1}
          >
            Next Question
          </button>
        </div>
      </div>

      {/* RIGHT - CODE EDITOR */}
      <div className="border p-6 rounded-lg bg-white shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-gray-700">Select Language:</span>
            <select
              className="border p-2 rounded bg-white shadow-sm focus:ring-2 focus:ring-blue-500"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
        </div>

        <textarea
          className="w-full flex-grow h-80 border p-3 font-mono text-sm bg-gray-900 text-green-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="// Write your code here..."
        />

        <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-600 mb-1">Custom Input (stdin)</label>
            <textarea
              className="w-full h-20 border p-2 font-mono text-sm bg-white rounded"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder={currentQuestion.sampleInput || "Enter input for Run"}
            />
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleRun}
            disabled={runLoading}
            className="flex-1 bg-gray-700 text-white font-bold py-2 rounded hover:bg-gray-800 disabled:bg-gray-400 transition"
          >
            {runLoading ? "Running..." : "Run Code"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitLoading}
            className="flex-1 bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 disabled:bg-green-400 transition"
          >
            {submitLoading ? "Submitting..." : "Submit Answer"}
          </button>
        </div>

        {/* OUTPUT CONSOLE */}
        {(output || results) && (
            <div className="mt-6 p-4 bg-black rounded text-white font-mono text-xs overflow-y-auto max-h-60">
                {output && (
                    <div className="mb-4">
                        <p className="text-yellow-400 mb-1 border-b border-gray-700 pb-1">Console Output:</p>
                        <pre className="whitespace-pre-wrap">{output}</pre>
                    </div>
                )}
                
                {results && (
                    <div>
                        <p className={`text-lg font-bold mb-2 ${results.success ? "text-green-400" : "text-red-400"}`}>
                          Result: {results.success ? "ACCEPTED" : "FAILED"}
                        </p>
                        {results.results?.map((r, i) => (
                          <div key={i} className="border-t border-gray-800 pt-2 mt-2">
                            <p className={r.passed ? "text-green-500" : "text-red-500"}>
                               Test {i + 1}: {r.passed ? "PASS" : "FAIL"}
                            </p>
                            {!r.passed && (
                                <div className="text-gray-400 text-[10px] mt-1">
                                    <p>Expected: {r.expected}</p>
                                    <p>Actual: {r.output}</p>
                                </div>
                            )}
                          </div>
                        ))}
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
}