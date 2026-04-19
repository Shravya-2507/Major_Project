import { useState } from "react";
import { analyzeResume } from "../utils/resumeAnalyzer";

export default function ResumeUpload() {
  const [resumeText, setResumeText] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [fileName, setFileName] = useState("");

  // ✅ Safe upload (no crash)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);

    // Simulated parsing (temporary)
    setResumeText(`File: ${file.name}

Skills: JavaScript, React, Node
Projects: Portfolio Website
Experience: Internship`);
  };

  const handleAnalyze = () => {
    const result = analyzeResume(resumeText);
    setFeedback(result);
  };

  return (
    <div className="space-y-5">

      {/* Upload */}
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileUpload}
        className="block"
      />

      {fileName && (
        <p className="text-sm text-gray-500">
          Uploaded: {fileName}
        </p>
      )}

      {/* Text Preview */}
      <textarea
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        rows={8}
        className="w-full p-3 border rounded-lg"
        placeholder="Resume text will appear here..."
      />

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!resumeText}
        className="bg-indigo-600 text-white px-5 py-2 rounded-lg disabled:opacity-50"
      >
        Analyze Resume
      </button>

      {/* Feedback */}
      {feedback && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-bold text-lg">
            Score: {feedback.score}
          </h3>

          <p className="mt-2 text-sm">
            Keywords Found: {feedback.foundKeywords.join(", ") || "None"}
          </p>

          <ul className="mt-3 list-disc ml-5 space-y-1">
            {feedback.suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}