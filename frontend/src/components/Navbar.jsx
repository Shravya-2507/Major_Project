import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow">

      <h1 className="font-bold text-lg text-purple-700">
        AI Recruit
      </h1>

      <div>
        <Link
          to="/login"
          className="px-5 py-2 rounded-xl bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
        >
          Login
        </Link>
      </div>

    </nav>
  );
}