import { useState } from "react";
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
  const [role, setRole] = useState("");
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [meta, setMeta] = useState(null);

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
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Resume analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 text-gray-900 p-8">

      {/* HEADER */}
      <div className="max-w-5xl mx-auto text-center mb-10">
        <h1 className="text-5xl font-extrabold text-gray-900">
          Resume Analyzer
        </h1>
      </div>

      {/* INPUT CARD */}
      <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 p-8 space-y-7">

        {/* Role */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Target Role
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="
            w-full p-4 rounded-xl 
            bg-gray-50 border border-gray-300
            focus:ring-2 focus:ring-purple-500
            outline-none
            "
          >
            <option value="">
              Select Target Role
            </option>

            {roles.map((item, index) => (
              <option key={index} value={item}>
                {item}
              </option>
            ))}

          </select>
        </div>

        {/* JD */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Job Description
            <span className="text-red-500 ml-1">*</span>
          </label>

          <textarea
            rows="7"
            value={jd}
            onChange={(e) => setJd(e.target.value)}
            placeholder="Paste job description here..."
            className="
            w-full p-4 rounded-xl
            bg-gray-50
            border border-gray-300
            focus:ring-2 focus:ring-purple-500
            outline-none
            resize-none
            "
          />
        </div>

        {/* Upload */}
        <div>
          <label className="block mb-2 font-semibold text-gray-700">
            Upload Resume
          </label>

          <div className="
            border-2 border-dashed 
            border-purple-300
            rounded-2xl
            p-6
            text-center
            bg-purple-50
          ">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="
              w-full
              file:bg-purple-600
              file:text-white
              file:border-0
              file:px-5
              file:py-2
              file:rounded-lg
              cursor-pointer
              "
            />

            {file && (
              <p className="mt-3 text-green-600 font-medium">
                📄 {file.name}
              </p>
            )}
          </div>
        </div>

        {/* Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`
          w-full py-4 rounded-xl
          text-lg font-bold
          transition-all shadow-lg
          ${
            loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:scale-[1.02]"
          }
          `}
        >
          {loading
          ? "Analyzing Resume..."
          : "Analyze Resume 🚀"
          }
        </button>

      </div>

      {/* RESULT SECTION */}
      {result && (
        <div className="max-w-5xl mx-auto mt-12 space-y-8">

          {/* SCORE */}
          <div className="
          bg-white rounded-3xl
          shadow-xl
          p-10
          text-center
          border
          ">
            <h2 className="text-2xl font-bold mb-5">
              Resume Score
            </h2>

            <div className="
            text-7xl
            font-extrabold
            bg-gradient-to-r
            from-green-500
            to-emerald-600
            bg-clip-text
            text-transparent
            ">
              {result.overall_score || 0}
              <span className="text-3xl text-gray-400">
                /100
              </span>
            </div>

            <div className="mt-6 flex justify-center gap-8 text-gray-600">
              <p>
                Mode:
                <span className="font-semibold text-purple-600 ml-2">
                  {meta?.evaluation_mode}
                </span>
              </p>

              <p>
                Role:
                <span className="font-semibold text-blue-600 ml-2">
                  {meta?.role}
                </span>
              </p>
            </div>
          </div>

          {/* FEEDBACK */}
          <div className="
          bg-white
          rounded-3xl
          shadow-xl
          p-8
          border
          space-y-8
          ">
            <h2 className="text-3xl font-bold">
              AI Feedback
            </h2>

            {/* Strength */}
            {result.strengths?.length > 0 && (
              <div>
                <h3 className="
                text-xl font-bold
                text-green-600 mb-4
                ">
                  ✅ Strengths
                </h3>

                <div className="space-y-3">
                  {result.strengths.map((item, index) => (
                    <div
                      key={index}
                      className="
                      bg-green-50
                      border border-green-200
                      p-4 rounded-xl
                      "
                    >
                      ✔️ {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Improvements */}
            {result.areas_for_improvement?.length > 0 && (
              <div>
                <h3 className="
                text-xl font-bold
                text-yellow-600 mb-4
                ">
                  ⚠️ Areas For Improvement
                </h3>

                {result.areas_for_improvement.map((item, index) => (
                  <div
                    key={index}
                    className="
                    bg-yellow-50
                    border border-yellow-200
                    p-4 rounded-xl mb-3
                    "
                  >
                    ⚠️ {item}
                  </div>
                ))}
              </div>
            )}

            {/* Missing */}
            {result.missing_skills?.length > 0 && (
              <div>
                <h3 className="
                text-xl font-bold
                text-red-600 mb-4
                ">
                  ❌ Missing Skills
                </h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {result.missing_skills.map((item, index) => (
                    <div
                      key={index}
                      className="
                      bg-red-50
                      border border-red-200
                      p-4 rounded-xl
                      "
                    >
                      ❌ {item}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}