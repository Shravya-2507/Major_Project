import { useEffect, useState } from "react";
import { 
  fetchAdminDashboard, 
  fetchTopPerformers, 
  fetchActivities, 
  fetchBestSubject, 
  fetchWeakestSubject 
} from "../services/api";

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
        fetchAdminDashboard(),
        fetchTopPerformers(),
        fetchActivities(),
        fetchBestSubject(),
        fetchWeakestSubject(),
      ]);

      setStats(dashboard.data);
      setTopPerformers(performers.data || []);
      setActivities(recent.data || []);
      setBestSubject(best.data);
      setWeakestSubject(weakest.data);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      if (err.response?.status === 401) {
        console.warn("Authentication token missing or invalid. Please log in again.");
        // Optional: window.location.href = '/admin/login';
      }
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-8">

      <h1 className="text-4xl font-bold text-purple-700 mb-8">
        Admin Dashboard
      </h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6">
            <h3 className="text-gray-500 text-sm">Total Users</h3>
            <p className="text-4xl font-bold text-purple-700 mt-2">
              {stats.totalUsers}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6">
            <h3 className="text-gray-500 text-sm">Total Tests</h3>
            <p className="text-4xl font-bold text-purple-700 mt-2">
              {stats.totalTests}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6">
            <h3 className="text-gray-500 text-sm">Average Score</h3>
            <p className="text-4xl font-bold text-purple-700 mt-2">
              {stats.averageScore}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6">
            <h3 className="text-gray-500 text-sm">Highest Score</h3>
            <p className="text-4xl font-bold text-green-600 mt-2">
              {stats.highestScore}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6">
            <h3 className="text-gray-500 text-sm">Lowest Score</h3>
            <p className="text-4xl font-bold text-red-500 mt-2">
              {stats.lowestScore}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6">
            <h3 className="text-gray-500 text-sm">Active Users</h3>
            <p className="text-4xl font-bold text-blue-600 mt-2">
              {stats.activeUsers}
            </p>
          </div>

        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Top Performers */}
        <div className="xl:col-span-2 bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6">

          <h2 className="text-2xl font-bold text-purple-700 mb-6">
            🏆 Top Performers
          </h2>

          <table className="w-full">

            <thead>
              <tr className="border-b border-gray-300">
                <th className="text-left py-3">Rank</th>
                <th className="text-left">Candidate</th>
                <th className="text-left">Average Score</th>
              </tr>
            </thead>

            <tbody>
              {topPerformers.map((item) => (
                <tr
                  key={item.rank}
                  className="border-b border-gray-200 hover:bg-purple-50 transition"
                >
                  <td className="py-3 font-semibold">
                    #{item.rank}
                  </td>

                  <td>{item.name}</td>

                  <td className="font-semibold text-purple-700">
                    {item.average_score}
                  </td>
                </tr>
              ))}
            </tbody>

          </table>

        </div>

        {/* Right Panel */}
        <div className="space-y-6">

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6">

            <h2 className="text-lg font-bold text-purple-700 mb-3">
              📘 Best Subject
            </h2>

            <p className="text-xl font-semibold">
              {bestSubject?.subject_name || "No Data"}
            </p>

          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6">

            <h2 className="text-lg font-bold text-purple-700 mb-3">
              📕 Weakest Subject
            </h2>

            <p className="text-xl font-semibold">
              {weakestSubject?.subject_name || "No Data"}
            </p>

          </div>

          <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6">

            <h2 className="text-lg font-bold text-purple-700 mb-4">
              📋 Recent Activities
            </h2>

            {activities.length === 0 ? (
              <p className="text-gray-500">
                No recent activities
              </p>
            ) : (
              <ul className="space-y-3">
                {activities.map((item, index) => (
                  <li
                    key={index}
                    className="border-l-4 border-purple-500 pl-3"
                  >
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