import { useEffect, useState } from "react";
import api from "../services/api";

export default function Leaderboard() {

  const [rows, setRows] = useState([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  async function loadLeaderboard() {
    const res = await api.get("/admin/leaderboard/overall");
    setRows(res.data.data);
  }

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        Overall Leaderboard
      </h1>

      <table className="w-full border">

        <thead className="bg-gray-200">

          <tr>

            <th className="border p-2">Rank</th>

            <th className="border p-2">Name</th>

            <th className="border p-2">Average</th>

            <th className="border p-2">Highest</th>

            <th className="border p-2">Tests</th>

          </tr>

        </thead>

        <tbody>

          {rows.map((r) => (

            <tr key={r.id}>

              <td className="border p-2">{r.overall_rank}</td>

              <td className="border p-2">{r.name}</td>

              <td className="border p-2">{r.average_score}</td>

              <td className="border p-2">{r.highest_score}</td>

              <td className="border p-2">{r.tests_attempted}</td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}