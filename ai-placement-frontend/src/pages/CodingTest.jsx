import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { codingAPI } from "../config/api";

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
        const rows = Array.isArray(res?.data) ? res.data : [];
        setQuestions(rows);
      } catch (err) {
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
      const fallbackSampleInput =
        currentQuestion?.sampleInput || currentQuestion?.sample_input || "";
      const stdin = (customInput || fallbackSampleInput || "").toString();

      const res = await axios.post("/api/code/run", {
        code,
        language,
        input: stdin,
      });
      const runOutput = (res.data?.output ?? "").toString();
      const runError = (res.data?.error ?? "").toString();
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
      const res = await axios.post("/api/code/submit", {
        code,
        language,
        questionId: currentQuestion.id,
        candidateId: 1,
        testCases: hiddenTestCases,
      });
      setResults(res.data);
    } catch (err) {
      setResults({ success: false, results: [] });
    } finally {
      setSubmitLoading(false);
    }
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
    return <div className="p-6">Loading coding questions from database...</div>;
  }

  if (questionsError) {
    return <div className="p-6 text-red-600">{questionsError}</div>;
  }

  if (!currentQuestion) {
    return <div className="p-6">No coding questions found in your database.</div>;
  }

  return (
    <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* LEFT - QUESTION */}
      <div className="border p-4 rounded">
        <h2 className="text-xl font-bold">
          {currentQuestion.title}
        </h2>

        <p className="mt-2 whitespace-pre-wrap">
          {currentQuestion.description}
        </p>

        <div className="mt-4">
          <p><b>Sample Input:</b> {currentQuestion.sampleInput || currentQuestion.sample_input || "-"}</p>
          <p><b>Sample Output:</b> {currentQuestion.sampleOutput || currentQuestion.sample_output || "-"}</p>
        </div>

        {sampleTestCases.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold">Visible Sample Test Cases</p>
            {sampleTestCases.map((tc, idx) => (
              <div key={idx} className="border p-2 mt-2 rounded bg-gray-50">
                <p>Input: {tc.input}</p>
                <p>Expected: {tc.output}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-sm text-gray-600">
          Hidden test cases are evaluated only when you submit.
        </div>

        <div className="flex justify-between mt-4">
          <button onClick={goPrev} disabled={currentIndex === 0}>Prev</button>
          <button onClick={goNext} disabled={currentIndex === questions.length - 1}>Next</button>
        </div>
      </div>

      {/* RIGHT - CODE EDITOR */}
      <div className="border p-4 rounded">

        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="javascript">JavaScript</option>
          <option value="python">Python</option>
        </select>

        <textarea
          className="w-full h-60 border mt-2 p-2 font-mono"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <label className="block mt-3 font-semibold">Run Input (stdin)</label>
        <textarea
          className="w-full h-24 border mt-2 p-2 font-mono"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder={currentQuestion.sampleInput || currentQuestion.sample_input || "Enter input for Run"}
        />

        {/* BUTTONS */}
        <div className="flex gap-2 mt-3">

          <button
            onClick={handleRun}
            disabled={runLoading}
            className="bg-gray-600 text-white px-4 py-2"
          >
            {runLoading ? "Running..." : "Run"}
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitLoading || hiddenTestCases.length === 0}
            className="bg-green-600 text-white px-4 py-2"
          >
            {submitLoading ? "Submitting..." : "Submit"}
          </button>

        </div>

        {/* OUTPUT */}
        {output && (
          <pre className="bg-gray-100 p-2 mt-3">
            {typeof output === "string"
              ? output
              : JSON.stringify(output, null, 2)}
          </pre>
        )}

        {/* RESULTS */}
        {results && (
          <div className="mt-3">
            <h3 className="font-bold">
              {results.success ? "ACCEPTED" : "FAILED"}
            </h3>

            {results.results.map((r, i) => (
              <div key={i} className="border p-2 mt-2">
                <p><b>Hidden Test {i + 1}</b></p>
                <p>Input: {r.input}</p>
                <p>Expected: {r.expected}</p>
                <p>Your Output: {r.output}</p>
                <p>{r.passed ? "PASS" : "FAIL"}</p>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}