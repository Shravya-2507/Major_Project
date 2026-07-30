import { useEffect, useState } from "react";
import api from "../services/api";

export default function MonthlyRanking() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await api.get("/admin/leaderboard/monthly");
      setRows(res.data.data);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Monthly Rankings
      </h1>

      <table className="w-full border">

        <thead className="bg-gray-200">

          <tr>

            <th className="border p-2">Rank</th>

            <th className="border p-2">Candidate</th>

            <th className="border p-2">Email</th>

            <th className="border p-2">Score</th>

            <th className="border p-2">Average</th>

            <th className="border p-2">Tests</th>

          </tr>

        </thead>

        <tbody>

          {rows.map((item) => (

            <tr key={item.ranking_id}>

              <td className="border p-2">
                {item.overall_rank}
              </td>

              <td className="border p-2">
                {item.name}
              </td>

              <td className="border p-2">
                {item.email}
              </td>

              <td className="border p-2">
                {item.overall_score}
              </td>

              <td className="border p-2">
                {item.average_score}
              </td>

              <td className="border p-2">
                {item.tests_completed}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}