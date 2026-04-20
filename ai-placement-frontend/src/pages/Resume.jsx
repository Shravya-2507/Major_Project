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
    setResult(null); // Clear previous results

    try {
      // UPDATED URL: Added /api/resume to match your server.js configuration
      const res = await axios.post(
        "http://localhost:5000/api/resume/analyze-resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setResult(res.data);
    } catch (err) {
      console.error("Analysis Error:", err.response || err);
      
      // Better error messaging
      const errorMsg = err.response?.data?.error || "Analysis failed. Please check backend logs.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
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
        <label className="block mb-2 font-semibold">Select Role</label>
        <select
          className="w-full p-3 rounded bg-gray-800 mb-4 border border-gray-600 focus:outline-none focus:border-blue-500"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="backend">Backend Developer</option>
          <option value="software engineer">Software Engineer</option>
          <option value="data scientist">Data Scientist</option>
        </select>

        {/* FILE INPUT */}
        <label className="block mb-2 font-semibold">Upload Resume (PDF)</label>
        <input
          type="file"
          accept=".pdf"
          className="w-full p-3 bg-gray-800 rounded mb-4 border border-gray-600"
          onChange={(e) => setFile(e.target.files[0])}
        />

        {/* BUTTON */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`w-full p-3 rounded font-bold transition ${
            loading 
              ? "bg-gray-600 cursor-not-allowed" 
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>

      {/* RESULT SECTION */}
      {result && (
        <div className="max-w-3xl mx-auto mt-8 space-y-6">
          {/* SCORE CARD */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700 text-center">
            <h2 className="text-xl mb-2">Resume Score</h2>
            <div className="text-6xl font-bold text-green-400">
              {result.score}/100
            </div>
            <p className="text-gray-400 mt-2">
              Role Detected: <span className="text-white capitalize">{result.role_detected || role}</span>
            </p>
          </div>

          {/* FEEDBACK */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-700">
            <h2 className="text-xl mb-4 font-bold">AI Feedback</h2>
            <div className="grid gap-3">
              {result.feedback && result.feedback.length > 0 ? (
                result.feedback.map((item, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-start gap-2"
                  >
                    <span className="text-red-400">❌</span>
                    <span>{item}</span>
                  </div>
                ))
              ) : (
                <p className="text-green-400">Perfect! No major improvements needed.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}