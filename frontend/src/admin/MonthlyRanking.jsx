import { useEffect, useState } from "react";
import api from "../services/api";

export default function MonthlyRanking() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await api.get("/admin/leaderboard/monthly");
      setRows(res.data.data || []);
    } catch (err) {
      console.error("Monthly Ranking Error:", err);
    } finally {
      setLoading(false);
    }
  }

  const getRankStyle = (rank) => {
    if (rank === 1) return "bg-yellow-100 text-yellow-700";
    if (rank === 2) return "bg-gray-100 text-gray-700";
    if (rank === 3) return "bg-orange-100 text-orange-700";
    return "bg-purple-100 text-purple-700";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">
      <h1 className="text-4xl font-bold text-purple-700 mb-8">
        📅 Monthly Rankings
      </h1>

      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl p-6">
        {loading ? (
          <p className="text-center text-gray-500">Loading rankings...</p>
        ) : rows.length === 0 ? (
          <p className="text-center text-gray-500">
            No monthly ranking data available
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-purple-100 border-b">
                  <th className="p-4 text-left">Rank</th>
                  <th className="p-4 text-left">Candidate</th>
                  <th className="p-4 text-left">Email</th>
                  <th className="p-4 text-left">Score</th>
                  <th className="p-4 text-left">Average</th>
                  <th className="p-4 text-left">Tests</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr
                    key={item.ranking_id}
                    className="border-b hover:bg-purple-50 transition"
                  >
                    <td className="p-4">
                      <span
                        className={`px-4 py-1 rounded-full font-bold ${getRankStyle(
                          item.overall_rank
                        )}`}
                      >
                        #{item.overall_rank}
                      </span>
                    </td>
                    <td className="p-4 font-semibold">{item.name}</td>
                    <td className="p-4 text-gray-600">{item.email}</td>
                    <td className="p-4 font-bold text-purple-700">
                      {item.overall_score}
                    </td>
                    <td className="p-4 font-semibold text-blue-600">
                      {item.average_score}
                    </td>
                    <td className="p-4">{item.tests_completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}