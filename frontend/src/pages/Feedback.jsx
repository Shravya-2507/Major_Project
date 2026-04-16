import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getReport } from "../services/api";

export default function Feedback() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state?.candidateId || !state?.sessionId) {
      navigate("/mock-interview");
      return;
    }
    loadReport();
  }, [state, navigate]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const data = await getReport(state.candidateId, state.sessionId);

      if (data && data.report) {
        // Parse the JSON strings if they come back as strings from PostgreSQL
        const parsedReport = {
          ...data.report,
          topic_averages: typeof data.report.topic_averages === 'string'
            ? JSON.parse(data.report.topic_averages) : data.report.topic_averages,
          classifications: typeof data.report.classifications === 'string'
            ? JSON.parse(data.report.classifications) : data.report.classifications
        };
        setReport(formattedReport(parsedReport));
      }
    } catch (err) {
      console.error("Error loading report:", err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to ensure we can map over individual answers if they aren't in the summary object
  const formattedReport = (data) => {
    // If your backend doesn't nest the individual answers inside report, 
    // you might need to fetch them separately or ensure they are part of the 'data' object.
    return data;
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
      <p className="text-xl font-semibold text-gray-700">Generating your AI Analysis...</p>
      <p className="text-gray-500">Comparing your answers against industry standards.</p>
    </div>
  );

  if (!report) return <div className="p-10 text-center">No report data found.</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 1. TOP SUMMARY SECTION */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">Performance Report</h2>
            <p className="text-gray-500 mt-1">Session ID: <span className="font-mono text-xs">{state.sessionId}</span></p>
          </div>
          <div className="text-center bg-blue-50 px-6 py-3 rounded-2xl">
            <p className="text-sm font-bold text-blue-600 uppercase">Overall Proficiency</p>
            <p className="text-3xl font-black text-blue-700">{report.total_score}%</p>
          </div>
        </div>

        {/* 2. TOPIC & SKILL GRIDS */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Topic Scores</h3>
            {Object.entries(report.topic_averages || {}).map(([topic, score]) => (
              <div key={topic} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="capitalize text-gray-600">{topic}</span>
                <span className="font-bold text-blue-600">{score}%</span>
              </div>
            ))}
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Skill Classification</h3>
            {Object.entries(report.classifications || {}).map(([topic, level]) => (
              <div key={topic} className="flex justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="capitalize text-gray-600">{topic}</span>
                <span className={`font-bold ${level === 'Expert' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {level}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. QUESTION BREAKDOWN (If data available) */}
        {/* Note: This section assumes 'report' contains an array of answers or you handle it separately */}
        <div className="mt-12 text-center pb-10">
          <button
            onClick={() => navigate("/mock-interview")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg mr-4"
          >
            Try Another Interview
          </button>
          <button
            onClick={() => window.print()}
            className="text-blue-600 font-bold hover:underline"
          >
            Download as PDF
          </button>
        </div>
      </div>
    </div>
  );
}