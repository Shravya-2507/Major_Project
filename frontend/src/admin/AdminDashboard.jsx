import { useEffect, useState } from "react";
import api from "../services/api";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [bestSubject, setBestSubject] = useState(null);
  const [weakestSubject, setWeakestSubject] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [
        dashboard,
        performers,
        recent,
        best,
        weakest,
      ] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/top-performers"),
        api.get("/admin/activities"),
        api.get("/admin/best-subject"),
        api.get("/admin/weakest-subject"),
      ]);

      setStats(dashboard.data.data);
      setTopPerformers(performers.data.data || []);
      setActivities(recent.data.data || []);
      setBestSubject(best.data.data);
      setWeakestSubject(weakest.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="flex-1 p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-8">
        Admin Dashboard
      </h1>

      {stats && (
        <div className="grid grid-cols-3 gap-6 mb-10">

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold">{stats.totalUsers}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500">Total Tests</h3>
            <p className="text-3xl font-bold">{stats.totalTests}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500">Average Score</h3>
            <p className="text-3xl font-bold">{stats.averageScore}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500">Highest Score</h3>
            <p className="text-3xl font-bold">{stats.highestScore}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500">Lowest Score</h3>
            <p className="text-3xl font-bold">{stats.lowestScore}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-500">Active Users</h3>
            <p className="text-3xl font-bold">{stats.activeUsers}</p>
          </div>

        </div>
      )}

      <div className="grid grid-cols-2 gap-8">

        <div className="bg-white rounded-lg shadow p-6">

          <h2 className="text-xl font-bold mb-4">
            Top Performers
          </h2>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Rank</th>
                <th className="text-left">Name</th>
                <th className="text-left">Average</th>
              </tr>
            </thead>

            <tbody>
              {topPerformers.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.rank}</td>
                  <td>{item.name}</td>
                  <td>{item.average_score}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>

        <div className="space-y-6">

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-bold mb-3">Best Subject</h2>
            <p>{bestSubject?.subject_name || "No Data"}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="font-bold mb-3">Weakest Subject</h2>
            <p>{weakestSubject?.subject_name || "No Data"}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">

            <h2 className="font-bold mb-3">
              Recent Activities
            </h2>

            {activities.length === 0 ? (
              <p>No activities</p>
            ) : (
              <ul className="space-y-2">
                {activities.map((item, index) => (
                  <li key={index}>
                    {item.action}
                  </li>
                ))}
              </ul>
            )}

          </div>

        </div>

      </div>
    </main>
  );
}