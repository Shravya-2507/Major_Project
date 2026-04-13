import { useState } from "react";

export default function Resume() {
  const [file, setFile] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload a resume first");
      return;
    }

    setLoading(true);

    try {
      // Backend integration (future)
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      setFeedback(data.feedback || "No feedback received");
    } catch (err) {
      console.log(err);

      // TEMP fallback (for now, before backend)
      setFeedback(
        "Your resume looks good but can be improved:\n\n• Add more measurable achievements\n• Improve project descriptions\n• Include technical keywords\n• Keep formatting consistent"
      );
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        
        <h1 className="text-2xl font-bold mb-4 text-center">
          Resume Analysis
        </h1>

        {/* Upload */}
        <div className="mb-4">
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="w-full border p-2 rounded"
          />
        </div>

        {/* File name */}
        {file && (
          <p className="text-sm text-gray-600 mb-4">
            Selected: {file.name}
          </p>
        )}

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>

        {/* Feedback */}
        {feedback && (
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">AI Feedback</h2>
            <pre className="text-sm whitespace-pre-wrap">
              {feedback}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}