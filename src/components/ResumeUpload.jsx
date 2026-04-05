import { useState } from "react";
import { motion } from "framer-motion";
import { analyzeResume } from "../utils/resumeAnalyzer";
import {
  extractTextFromPDF,
  extractTextFromDOCX,
} from "../utils/fileParser";

export default function ResumeUpload() {
  const [resumeText, setResumeText] = useState("");
  const [company, setCompany] = useState("google");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (file) => {
    setLoading(true);

    let text = "";

    if (file.type === "application/pdf") {
      text = await extractTextFromPDF(file);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      text = await extractTextFromDOCX(file);
    } else {
      alert("Only PDF or DOCX allowed");
      setLoading(false);
      return;
    }

    setResumeText(text);
    setLoading(false);
  };

  const handleAnalyze = () => {
    const analysis = analyzeResume(resumeText, company);
    setResult(analysis);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-6 flex justify-center items-center">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-3xl">

        <h2 className="text-2xl font-bold mb-4 text-center">
          Resume Analyzer (ATS Checker)
        </h2>

        {/* Company Select */}
        <select
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="w-full mb-4 p-2 border rounded-lg"
        >
          <option value="google">Google</option>
          <option value="amazon">Amazon</option>
          <option value="microsoft">Microsoft</option>
        </select>

        {/* FILE UPLOAD */}
        <input
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => handleFileUpload(e.target.files[0])}
          className="mb-4"
        />

        {loading && (
          <p className="text-indigo-500 mb-2">Extracting resume...</p>
        )}

        {/* TEXT PREVIEW */}
        <textarea
          placeholder="Resume content will appear here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
          className="w-full h-40 p-3 border rounded-lg mb-4"
        />

        <button
          onClick={handleAnalyze}
          className="w-full bg-indigo-500 text-white py-2 rounded-lg"
        >
          Analyze Resume
        </button>

        {/* RESULT */}
        {result && (
          <motion.div
            className="mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-xl font-semibold mb-2">
              ATS Score: {result.score}%
            </h3>

            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div
                className="bg-green-500 h-3 rounded-full"
                style={{ width: `${result.score}%` }}
              />
            </div>

            <p className="font-semibold">Matched Keywords:</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {result.matched.map((item, i) => (
                <span
                  key={i}
                  className="bg-green-100 px-2 py-1 rounded"
                >
                  {item}
                </span>
              ))}
            </div>

            <p className="font-semibold">Missing Keywords:</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {result.missing.map((item, i) => (
                <span
                  key={i}
                  className="bg-red-100 px-2 py-1 rounded"
                >
                  {item}
                </span>
              ))}
            </div>

            <p className="font-semibold">Suggestions:</p>
            <ul className="list-disc ml-5">
              {result.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}