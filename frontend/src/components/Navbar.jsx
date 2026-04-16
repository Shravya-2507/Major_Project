import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="flex justify-between items-center p-4 bg-white shadow">
      <h1 className="font-bold text-lg">AI Recruit</h1>

      <div className="flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/practice">Practice</Link>
      </div>
    </nav>
  );
}