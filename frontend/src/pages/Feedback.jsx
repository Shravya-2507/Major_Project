import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getReport } from "../services/api";

export default function Feedback() {
  const { state } = useLocation();
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (state) {
      loadReport();
    }
  }, []);

  const loadReport = async () => {
    const data = await getReport(
      state.candidateId,
      state.sessionId
    );
    setReport(data.report);
  };

  if (!report) return <p className="p-6">Loading report...</p>;

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">AI Feedback</h2>

      <p className="mb-4">
        Total Score: <strong>{report.total_score}</strong>
      </p>

      <h3 className="font-semibold mt-4">Topic Scores:</h3>
      <pre className="bg-gray-100 p-3 rounded">
        {JSON.stringify(report.topic_averages, null, 2)}
      </pre>

      <h3 className="font-semibold mt-4">Classification:</h3>
      <pre className="bg-gray-100 p-3 rounded">
        {JSON.stringify(report.classifications, null, 2)}
      </pre>
    </div>
  );
}