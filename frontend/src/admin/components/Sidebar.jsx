import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-8">
        Admin Panel
      </h1>

      <nav className="space-y-4">

        <Link
          to="/admin"
          className="block p-3 rounded hover:bg-slate-700"
        >
          Dashboard
        </Link>

        <Link
          to="/admin/leaderboard"
          className="block p-3 rounded hover:bg-slate-700"
        >
          Leaderboard
        </Link>

        <Link
          to="/admin/monthly-ranking"
          className="block p-3 rounded hover:bg-slate-700"
        >
          Monthly Ranking
        </Link>

        <Link
          to="/admin/candidate/1"
          className="block p-3 rounded hover:bg-slate-700"
        >
          Candidate Profile
        </Link>

      </nav>
    </div>
  );
}