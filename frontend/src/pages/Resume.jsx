import { useState } from "react";
import axios from "axios";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [role, setRole] = useState("backend");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!file) return alert("Upload resume first");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/analyze-resume",
        formData
      );

      setResult(res.data);
    } catch (err) {
      console.log(err);
      alert("Analysis failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-8">

      {/* HEADER */}
      <h1 className="text-4xl font-bold text-center mb-8">
        🚀 AI Resume Analyzer
      </h1>

      {/* CARD */}
      <div className="max-w-2xl mx-auto bg-gray-900 p-6 rounded-2xl shadow-xl border border-gray-700">

        {/* ROLE SELECT */}
        <label className="block mb-2">Select Role</label>
        <select
          className="w-full p-3 rounded bg-gray-800 mb-4"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="backend">Backend Developer</option>
          <option value="software engineer">Software Engineer</option>
          <option value="data scientist">Data Scientist</option>
        </select>

        {/* FILE INPUT */}
        <input
          type="file"
          className="w-full p-3 bg-gray-800 rounded mb-4"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* BUTTON */}
        <button
          onClick={handleAnalyze}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded font-bold"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>

      {/* RESULT */}
      {result && (
        <div className="max-w-3xl mx-auto mt-8 space-y-6">

          {/* SCORE CARD */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 text-center">
            <h2 className="text-xl mb-2">Resume Score</h2>

            <div className="text-6xl font-bold text-green-400">
              {result.score}
            </div>

            <p className="text-gray-400 mt-2">
              Role Detected: {result.role_detected}
            </p>
          </div>

          {/* FEEDBACK */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl mb-4">AI Feedback</h2>

            <div className="grid gap-3">
              {result.feedback.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-3 rounded-lg border border-gray-700"
                >
                  ❌ {item}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}