import { useState, useEffect } from "react";
import axios from "axios";

export default function ResumeAnalyzer() {
  const roles = [
  "Backend Developer",
  "Frontend Developer",
  "Full Stack Developer",
  "Java Developer",
  "Python Developer",
  "Software Engineer",

  "Data Scientist",
  "Data Analyst",
  "Data Engineer",
  "Machine Learning Engineer",
  "AI Engineer",

  "DevOps Engineer",
  "Cloud Engineer",

  "Android Developer",
  "iOS Developer",
  "Mobile Developer",

  "QA Engineer",
  "Cyber Security Engineer",

  "UI UX Designer",
  "Database Administrator",
  "Business Analyst",
  "Product Manager"
];
  const [file, setFile] = useState(null);
  const [role, setRole] = useState(localStorage.getItem("resume_role") || "");
  const [jd, setJd] = useState(localStorage.getItem("resume_jd") || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(
    JSON.parse(localStorage.getItem("resume_result")) || null
  );
  const [meta, setMeta] = useState(
    JSON.parse(localStorage.getItem("resume_meta")) || null
  );

  useEffect(() => {
    localStorage.setItem("resume_role", role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem("resume_jd", jd);
  }, [jd]);

  const handleAnalyze = async () => {
    if (!file) {
      alert("Please upload resume PDF");
      return;
    }

    if (!role) {
      alert("Please select target role");
      return;
    }

    if (!jd.trim()) {
      alert("Job Description is mandatory");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role.toLowerCase());
    formData.append("job_description", jd);

    setLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:5000/api/resume/analyze-resume",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const data = response.data;

      setResult(data.report);
      setMeta(data);

      localStorage.setItem("resume_result", JSON.stringify(data.report));
      localStorage.setItem("resume_meta", JSON.stringify(data));
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Resume analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white p-8">
      {/* HEADER */}
      <h1 className="text-4xl font-bold text-center mb-10">
        Resume Analyzer
      </h1>

      {/* INPUT CARD */}
      <div className="max-w-3xl mx-auto bg-gray-900 p-8 rounded-3xl shadow-2xl border border-gray-700 space-y-6">
        <div>
          <label className="block mb-2 font-semibold">Select Target Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 rounded-xl bg-gray-800 border border-gray-600 focus:outline-none focus:border-blue-500"
          >
            <option value="">Choose Role</option>
            {roles.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-2 font-semibold">
            Job Description <span className="text-red-400 ml-2">*</span>
          </label>
          <textarea
            rows="7"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste complete job description here..."
            className="w-full p-4 rounded-xl bg-gray-800 border border-gray-600 focus:outline-none focus:border-blue-500 resize-none text-sm placeholder-gray-500 text-white"
          />
        </div>

        <div>
          <label className="block mb-2 font-semibold">Upload Resume PDF</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-3 bg-gray-800 rounded-xl border border-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
          />
          {file && (
            <p className="text-green-400 mt-2 text-sm">
              📄 {file.name}
            </p>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`w-full p-4 rounded-xl font-bold transition ${
            loading
              ? "bg-gray-600 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Analyzing Resume..." : "Analyze Resume"}
        </button>
      </div>

      {/* RESULT SECTION */}
      {result && (
        <div className="max-w-4xl mx-auto mt-10 space-y-8">
          {/* SCORE CARD */}
          <div className="bg-gray-900 p-8 rounded-3xl border border-gray-700 text-center shadow-xl">
            <h2 className="text-2xl font-semibold mb-4">Resume Score</h2>
            <div className="text-7xl font-bold text-green-400">
              {result.overall_score || 0}
              <span className="text-3xl text-gray-400">/100</span>
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-6 text-gray-300 text-sm">
              <p>
                Evaluation Mode:{" "}
                <span className="text-blue-400 ml-1 font-medium">
                  {meta?.evaluation_mode}
                </span>
              </p>
              <p>
                Target Role:{" "}
                <span className="text-white ml-1 font-medium capitalize">
                  {meta?.role}
                </span>
              </p>
            </div>
          </div>

          {/* AI FEEDBACK CARD */}
          <div className="bg-gray-900 p-8 rounded-3xl border border-gray-700 shadow-xl space-y-8">
            <h2 className="text-2xl font-bold">Feedback</h2>

            {/* STRENGTHS */}
            {result.strengths?.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-green-400 mb-4">
                  ✅ Strengths
                </h3>
                <div className="space-y-3">
                  {result.strengths.map((item, index) => (
                    <div
                      key={index}
                      className="bg-green-950/30 border border-green-700/50 p-4 rounded-xl text-gray-200 flex items-start gap-3"
                    >
                      <span className="text-base select-none mt-0.5">✔️</span>
                      <span className="text-sm font-medium leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* IMPROVEMENTS */}
            {result.areas_for_improvement?.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-yellow-400 mb-4">
                  ⚠️ Areas For Improvement
                </h3>
                <div className="space-y-3">
                  {result.areas_for_improvement.map((item, index) => (
                    <div
                      key={index}
                      className="bg-yellow-950/30 border border-yellow-700/50 p-4 rounded-xl text-gray-200 flex items-start gap-3"
                    >
                      <span className="text-base select-none mt-0.5">⚠️</span>
                      <span className="text-sm font-medium leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MISSING SKILLS */}
            {result.missing_skills?.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-red-400 mb-4">
                  ❌ Missing Skills
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {result.missing_skills.map((item, index) => (
                    <div
                      key={index}
                      className="bg-red-950/30 border border-red-700/50 p-4 rounded-xl text-gray-200 flex items-start gap-3"
                    >
                      <span className="text-base select-none mt-0.5">❌</span>
                      <span className="text-sm font-medium leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FALLBACK EXCELLENT */}
            {!result.strengths?.length &&
              !result.areas_for_improvement?.length &&
              !result.missing_skills?.length && (
                <div className="text-center text-green-400 text-lg p-5 rounded-xl bg-green-950/30 border border-green-700">
                  🎉 Excellent Resume Alignment!
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}