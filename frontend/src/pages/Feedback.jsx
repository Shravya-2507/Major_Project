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

      const data = await getReport(
        state.candidateId,
        state.sessionId
      );

      console.log("FINAL REPORT:", data);

      if (data?.report) {
        let parsedReport = data.report;

        // PostgreSQL JSON fields may come back as strings
        if (typeof parsedReport === "string") {
          try {
            parsedReport = JSON.parse(parsedReport);
          } catch (error) {
            console.error("Failed to parse report JSON:", error);
          }
        }

        setReport(parsedReport);
      } else {
        console.error("No report found:", data);
      }

    } catch (err) {
      console.error("Error loading report:", err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">

        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>

        <p className="text-xl font-semibold text-gray-700">
          Generating your AI Analysis...
        </p>

        <p className="text-gray-500 mt-2">
          Analyzing your complete interview performance.
        </p>

      </div>
    );
  }

  // ==========================================
  // NO REPORT
  // ==========================================

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">

        <div className="bg-white p-10 rounded-2xl shadow text-center">

          <h2 className="text-2xl font-bold text-gray-800">
            No report data found
          </h2>

          <p className="text-gray-500 mt-2">
            We could not generate your interview feedback.
          </p>

          <button
            onClick={() => navigate("/mock-interview")}
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold"
          >
            Try Another Interview
          </button>

        </div>

      </div>
    );
  }

  // ==========================================
  // NORMALIZE DATA
  // ==========================================

  const overallScore =
    report.overall_score ??
    report.total_score ??
    0;

  const classification =
    report.classification ??
    "Not Available";

  const summary =
    typeof report.summary === "string"
      ? report.summary
      : "No detailed summary available.";

  const strengths =
    Array.isArray(report.strengths)
      ? report.strengths
      : [];

  const weaknesses =
    Array.isArray(report.weaknesses)
      ? report.weaknesses
      : [];

  const recommendations =
    Array.isArray(report.recommendations)
      ? report.recommendations
      : [];

  const finalAssessment =
    report.final_assessment ||
    "No final assessment available.";

  const scores =
    Array.isArray(report.scores)
      ? report.scores
      : [];

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">

      <div className="max-w-5xl mx-auto">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">

            <div>

              <h1 className="text-3xl font-extrabold text-gray-900">
                Interview Feedback
              </h1>

              <p className="text-gray-500 mt-2">
                {report.role || "General"} interview
                {report.company
                  ? ` at ${report.company}`
                  : ""}
              </p>

              <p className="text-gray-400 text-sm mt-2">
                Session ID:{" "}
                <span className="font-mono">
                  {state.sessionId}
                </span>
              </p>

            </div>

            {/* SCORE */}

            <div className="text-center bg-blue-50 px-8 py-5 rounded-2xl">

              <p className="text-sm font-bold text-blue-600 uppercase">
                Overall Score
              </p>

              <p className="text-4xl font-black text-blue-700">
                {Number(overallScore).toFixed(2)}
              </p>

              <p className="text-gray-500">
                / 100
              </p>

              <div className="mt-2 inline-block bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                {classification}
              </div>

            </div>

          </div>

        </div>


        {/* ======================================
            OVERALL PERFORMANCE
        ====================================== */}

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Overall Performance
          </h2>

          <p className="text-gray-700 leading-8 whitespace-pre-line">
            {summary}
          </p>

        </div>


        {/* ======================================
            STRENGTHS + WEAKNESSES
        ====================================== */}

        <div className="grid md:grid-cols-2 gap-8 mb-8">

          {/* STRENGTHS */}

          <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">

            <h2 className="text-xl font-bold text-green-700 mb-5">
              Strong Areas
            </h2>

            {strengths.length > 0 ? (

              <ul className="space-y-3">

                {strengths.map((strength, index) => (

                  <li
                    key={index}
                    className="flex gap-3 text-gray-700"
                  >

                    <span className="text-green-600 font-bold">
                      ✓
                    </span>

                    <span>
                      {strength}
                    </span>

                  </li>

                ))}

              </ul>

            ) : (

              <p className="text-gray-500">
                No specific strengths were identified.
              </p>

            )}

          </div>


          {/* WEAKNESSES */}

          <div className="bg-white rounded-3xl p-7 shadow-sm border border-gray-100">

            <h2 className="text-xl font-bold text-red-600 mb-5">
              Areas to Improve
            </h2>

            {weaknesses.length > 0 ? (

              <ul className="space-y-3">

                {weaknesses.map((weakness, index) => (

                  <li
                    key={index}
                    className="flex gap-3 text-gray-700"
                  >

                    <span className="text-red-500 font-bold">
                      !
                    </span>

                    <span>
                      {weakness}
                    </span>

                  </li>

                ))}

              </ul>

            ) : (

              <p className="text-gray-500">
                No major weaknesses were identified.
              </p>

            )}

          </div>

        </div>


        {/* ======================================
            RECOMMENDATIONS
        ====================================== */}

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-5">
            Recommendations
          </h2>

          {recommendations.length > 0 ? (

            <div className="space-y-4">

              {recommendations.map((recommendation, index) => (

                <div
                  key={index}
                  className="flex gap-4 bg-blue-50 p-4 rounded-xl"
                >

                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
                    {index + 1}
                  </div>

                  <p className="text-gray-700">
                    {recommendation}
                  </p>

                </div>

              ))}

            </div>

          ) : (

            <p className="text-gray-500">
              No specific recommendations were generated.
            </p>

          )}

        </div>


        {/* ======================================
            FINAL ASSESSMENT
        ====================================== */}

        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">

          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Final Assessment
          </h2>

          <div className="bg-gray-50 rounded-2xl p-6">

            <p className="text-gray-700 leading-8">
              {finalAssessment}
            </p>

          </div>

        </div>


        {/* ======================================
            SCORE BREAKDOWN
        ====================================== */}

        {scores.length > 0 && (

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 mb-8">

            <h2 className="text-2xl font-bold text-gray-900 mb-5">
              Score Breakdown
            </h2>

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b">

                    <th className="text-left py-3">
                      Question
                    </th>

                    <th className="text-center py-3">
                      LLM
                    </th>

                    <th className="text-center py-3">
                      Smith-Waterman
                    </th>

                    <th className="text-center py-3">
                      Final
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {scores.map((item, index) => (

                    <tr
                      key={index}
                      className="border-b last:border-0"
                    >

                      <td className="py-4 font-semibold">
                        Q{item.question_number}
                      </td>

                      <td className="text-center py-4">
                        {Number(item.llm_score).toFixed(2)}
                      </td>

                      <td className="text-center py-4">
                        {Number(
                          item.smith_waterman_score
                        ).toFixed(2)}
                      </td>

                      <td className="text-center py-4 font-bold text-blue-600">
                        {Number(
                          item.final_score
                        ).toFixed(2)}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            <div className="mt-6 bg-gray-50 rounded-xl p-4 text-sm text-gray-600">

              <p>
                <strong>LLM:</strong> 80%
              </p>

              <p>
                <strong>Smith-Waterman:</strong> 20%
              </p>

              <p className="mt-1">
                Final Score = (LLM × 0.80) +
                (Smith-Waterman × 0.20)
              </p>

            </div>

          </div>

        )}


        {/* ======================================
            ACTIONS
        ====================================== */}

        <div className="flex flex-col md:flex-row justify-center gap-4 pb-10">

          <button
            onClick={() => navigate("/mock-interview")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg"
          >
            Try Another Interview
          </button>

          <button
            onClick={() => window.print()}
            className="border border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-bold transition-all"
          >
            Download as PDF
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-xl font-bold transition-all"
          >
            Dashboard
          </button>

        </div>

      </div>

    </div>
  );
}
