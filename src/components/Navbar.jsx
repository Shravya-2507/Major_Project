import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="flex justify-between items-center px-8 py-4 shadow-md">
      <h1 className="text-2xl font-bold text-blue-600">
        AI Recruit
      </h1>

      <div className="space-x-6 text-gray-700">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/practice">Practice</Link>
      </div>

      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
        Login
      </button>
    </div>
  );
}

export default Navbar;