import { useEffect, useState } from "react";
import { getCandidates, getCandidateHistory } from "./services/adminAPI";
import RankChart from "./components/RankChart";
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
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [candidateLoading, setCandidateLoading] = useState(true);
  const [candidateError, setCandidateError] = useState("");
  const [attempts, setAttempts] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    let isCurrent = true;

    const loadCandidates = async () => {
      setCandidateLoading(true);
      setCandidateError("");

      try {
        const response = await getCandidates();
        if (!isCurrent) return;

        const result = Array.isArray(response) ? response : [];
        setCandidates(result);
        setSelectedCandidateId((currentId) => {
          if (result.some((candidate) => String(candidate.id) === currentId)) {
            return currentId;
          }

          return result.length > 0 ? String(result[0].id) : "";
        });
      } catch (err) {
        if (!isCurrent) return;
        console.error("Failed to load candidates:", err);
        setCandidateError(
          err.response?.data?.message || "Unable to load candidates. Please try again."
        );
      } finally {
        if (isCurrent) setCandidateLoading(false);
      }
    };

    loadCandidates();

    return () => {
      isCurrent = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCandidateId) {
      setAttempts([]);
      setHistoryLoading(false);
      setHistoryError("");
      return undefined;
    }

    let isCurrent = true;
    setAttempts([]);
    setHistoryLoading(true);
    setHistoryError("");

    getCandidateHistory(selectedCandidateId)
      .then((history) => {
        if (!isCurrent) return;

        const chronologicalAttempts = (Array.isArray(history) ? history : [])
          .map((attempt) => ({
            ...attempt,
            score: attempt.score === null ||
              attempt.score === undefined ||
              attempt.score === ""
              ? Number.NaN
              : Number(attempt.score),
            completedTime: Date.parse(attempt.completed_at),
          }))
          .filter((attempt) =>
            attempt.completed_at &&
            Number.isFinite(attempt.completedTime) &&
            Number.isFinite(attempt.score) &&
            attempt.score >= 0 &&
            attempt.score <= 100
          )
          .sort((first, second) =>
            first.completedTime - second.completedTime ||
            Number(first.attempt_id) - Number(second.attempt_id)
          );

        setAttempts(chronologicalAttempts);
      })
      .catch((err) => {
        if (!isCurrent) return;
        console.error("Failed to load candidate performance:", err);
        setHistoryError(
          err.response?.data?.message ||
            "Unable to load this candidate's performance. Please try again."
        );
      })
      .finally(() => {
        if (isCurrent) setHistoryLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [selectedCandidateId]);

  const latestAttempt = attempts.at(-1);
  const previousAttempt = attempts.at(-2);
  const bestScore = attempts.length > 0
    ? Math.max(...attempts.map((attempt) => attempt.score))
    : null;
  const scoreChange = latestAttempt && previousAttempt
    ? latestAttempt.score - previousAttempt.score
    : null;

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

      <section className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <h2 className="text-2xl font-bold text-purple-700">
            Candidate Performance Improvement
          </h2>

          <label className="flex items-center gap-3 text-sm font-semibold text-gray-700">
            Candidate
            <select
              value={selectedCandidateId}
              onChange={(event) => setSelectedCandidateId(event.target.value)}
              disabled={candidateLoading || candidates.length === 0}
              className="min-w-48 max-w-full p-2 rounded-lg bg-white border border-gray-300 focus:ring-2 focus:ring-purple-500 outline-none disabled:bg-gray-100"
            >
              <option value="">
                {candidateLoading ? "Loading candidates..." : "Select candidate"}
              </option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={String(candidate.id)}>
                  {candidate.name || candidate.email || `Candidate ${candidate.id}`}
                </option>
              ))}
            </select>
          </label>
        </div>

        {candidateLoading ? (
          <p className="text-gray-500">Loading candidates...</p>
        ) : candidateError ? (
          <p role="alert" className="text-red-600">{candidateError}</p>
        ) : candidates.length === 0 ? (
          <p className="text-gray-500">No candidates available.</p>
        ) : historyLoading ? (
          <p className="text-gray-500">Loading candidate performance...</p>
        ) : historyError ? (
          <p role="alert" className="text-red-600">{historyError}</p>
        ) : attempts.length === 0 ? (
          <p className="text-gray-500">No performance data available</p>
        ) : (
          <>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
              <div className="bg-white/70 rounded-xl p-4">
                <h3 className="text-gray-500 text-sm">Latest Score</h3>
                <p className="text-2xl font-bold text-purple-700 mt-1">
                  {latestAttempt.score.toFixed(2)}%
                </p>
              </div>
              <div className="bg-white/70 rounded-xl p-4">
                <h3 className="text-gray-500 text-sm">Best Score</h3>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {bestScore.toFixed(2)}%
                </p>
              </div>
              <div className="bg-white/70 rounded-xl p-4">
                <h3 className="text-gray-500 text-sm">Completed Attempts</h3>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  {attempts.length}
                </p>
              </div>
              <div className="bg-white/70 rounded-xl p-4">
                <h3 className="text-gray-500 text-sm">Score Change</h3>
                <p className={`text-2xl font-bold mt-1 ${scoreChange === null ? "text-gray-500" : scoreChange >= 0 ? "text-green-600" : "text-red-500"}`}>
                  {scoreChange === null
                    ? "N/A"
                    : `${scoreChange > 0 ? "+" : ""}${scoreChange.toFixed(2)}%`}
                </p>
              </div>
            </div>

            <RankChart attempts={attempts} />
          </>
        )}
      </section>

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