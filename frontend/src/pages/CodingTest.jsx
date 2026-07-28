import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { codingAPI } from "../services/api";

export default function CodingTest() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Track code drafts per question via localStorage
  const [codeMap, setCodeMap] = useState(() => {
    const saved = localStorage.getItem("candidate_code_drafts_1");
    if (saved) {
      try { return JSON.parse(saved); } catch { return {}; }
    }
    return {};
  });

  // Track passed status per question ID
  const [passedMap, setPassedMap] = useState({});

  const [language, setLanguage] = useState("javascript");
  const [customInput, setCustomInput] = useState("");
  const [output, setOutput] = useState("");
  const [results, setResults] = useState(null);
  const [runLoading, setRunLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState("");

  // New states for end test confirmation modal and score summary view
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [testSummary, setTestSummary] = useState(null);
  
  const navigate = useNavigate();

  // Load next non-repeating questions and user submission history concurrently
  useEffect(() => {
    const loadTestData = async () => {
      try {
        setQuestionsLoading(true);
        setQuestionsError("");

        // Call the exact backend endpoints you specified
        const [nextRes, subsRes] = await Promise.all([
          codingAPI.get ? codingAPI.get("/coding/next?candidateId=1") : fetch("http://localhost:5000/api/coding/next?candidateId=1").then(r => r.json()),
          codingAPI.get ? codingAPI.get("/coding/submissions?candidateId=1") : fetch("http://localhost:5000/api/coding/submissions?candidateId=1").then(r => r.json())
        ]);

        const questionRows = Array.isArray(nextRes) ? nextRes : (nextRes?.data || nextRes?.rows || []);
        const submissionRows = Array.isArray(subsRes) ? subsRes : (subsRes?.data || subsRes?.rows || []);

        if (questionRows.length === 0) {
          setQuestionsError("Congratulations! You have solved all available coding questions.");
          return;
        }

        // Pre-populate passedMap for already solved questions
        const initialPassedMap = {};
        submissionRows.forEach(sub => {
          if (sub.status === "ACCEPTED" || sub.status === "AC" || sub.score === 100) {
            initialPassedMap[sub.question_id] = true;
          }
        });
        setPassedMap(initialPassedMap);
        setQuestions(questionRows);

      } catch (err) {
        console.error("Load Questions Error:", err);
        setQuestionsError("Failed to load coding questions from database.");
      } finally {
        setQuestionsLoading(false);
      }
    };

    loadTestData();
  }, []);

  const currentQuestion = questions[currentIndex] || null;
  const currentQuestionId = currentQuestion ? currentQuestion.id : null;

  // Active code text for current question
  const code = currentQuestionId ? (codeMap[currentQuestionId] || "") : "";

  const handleCodeChange = (newCode) => {
    if (!currentQuestionId) return;
    const updated = { ...codeMap, [currentQuestionId]: newCode };
    setCodeMap(updated);
    localStorage.setItem("candidate_code_drafts_1", JSON.stringify(updated));
  };

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
      const questionId = currentQuestion.id; 

      // Combine sample and hidden test cases to send to your backend /submit endpoint
      const allTestCases = [...sampleTestCases, ...hiddenTestCases];

      const res = await codingAPI.submitCode({
        code, 
        language_id: language, 
        questionId, 
        testCases: allTestCases,
        candidateId: 1
      });
      
      setResults(res);

      if (res && res.success) {
        setPassedMap(prev => ({ ...prev, [questionId]: true }));
      }
    } catch (err) {
      console.error("Submit error:", err);
      setResults({ success: false, results: [] });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleConfirmEndTest = () => {
    setShowConfirmModal(false);

    const attemptedQuestionIds = Object.keys(codeMap).filter((qId) => {
      const draftText = codeMap[qId];
      return draftText && draftText.trim().length > 0;
    });

    const attemptedCount = attemptedQuestionIds.length;
    const totalQuestions = questions.length;

    const passedCount = Object.values(passedMap).filter(Boolean).length;
    const calculatedScore = totalQuestions > 0 
      ? Math.round((passedCount / totalQuestions) * 100) 
      : 0;

    setTestSummary({
      attemptedCount,
      totalQuestions,
      score: `${calculatedScore} / 100`
    });

    localStorage.removeItem("candidate_code_drafts_1");
  };

  const goPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setResults(null);
    setOutput("");
  };

  const goNext = () => {
    setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
    setResults(null);
    setOutput("");
  };

  if (questionsLoading) {
    return <div className="p-6 text-center">Loading strict set of 3 coding questions...</div>;
  }

  if (questionsError) {
    return <div className="p-6 text-red-600 text-center font-semibold">{questionsError}</div>;
  }

  if (!currentQuestion) {
    return <div className="p-6 text-center">No active coding questions available.</div>;
  }

  if (testSummary) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
        <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center border">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Test Completed</h2>
          <p className="text-gray-500 mb-6">Here is your final performance summary</p>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-6 space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Questions Attempted</p>
              <p className="text-3xl font-extrabold text-blue-600 mt-1">
                {testSummary.attemptedCount} <span className="text-lg text-gray-400 font-normal">/ {testSummary.totalQuestions}</span>
              </p>
            </div>
            
            <div className="border-t border-blue-200 pt-4">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Final Session Score</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{testSummary.score}</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/practice")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-screen bg-gray-50 relative">
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Are you sure?</h3>
            <p className="text-gray-600 text-sm mb-6">Do you want to end the test? Your current progress will be finalized.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEndTest}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold transition cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT - QUESTION */}
      <div className="border p-6 rounded-lg bg-white shadow-sm overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-2xl font-bold text-gray-800">{currentQuestion.title}</h2>
          <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded uppercase text-gray-600">
            {currentQuestion.difficulty || "Medium"}
          </span>
        </div>

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
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition cursor-pointer" 
            onClick={goPrev} 
            disabled={currentIndex === 0}
          >
            Previous Question
          </button>
          <span className="self-center text-sm font-medium text-gray-500">
            Question {currentIndex + 1} of {questions.length}
          </span>
          <button 
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition cursor-pointer" 
            onClick={goNext} 
            disabled={currentIndex === questions.length - 1}
          >
            Next Question
          </button>
        </div>
      </div>

      {/* RIGHT - CODE EDITOR */}
      <div className="border p-6 rounded-lg bg-white shadow-sm flex flex-col relative">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
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

            <button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-sm transition shadow cursor-pointer"
            >
              End
            </button>
        </div>

        <textarea
          className="w-full flex-grow h-80 border p-3 font-mono text-sm bg-gray-900 text-green-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
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
            className="flex-1 bg-gray-700 text-white font-bold py-2 rounded hover:bg-gray-800 disabled:bg-gray-400 transition cursor-pointer"
          >
            {runLoading ? "Running..." : "Run Code"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitLoading}
            className="flex-1 bg-green-600 text-white font-bold py-2 rounded hover:bg-green-700 disabled:bg-green-400 transition cursor-pointer"
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