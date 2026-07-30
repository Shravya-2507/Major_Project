import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Upload,
  MessageCircle,
  BarChart3,
  LogOut,
  Home,
} from "lucide-react";

function DashboardLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Resume Analysis", path: "/resume", icon: Upload },
    { name: "Interview", path: "/interview", icon: MessageCircle },
    { name: "Results", path: "/feedback", icon: BarChart3 },
  ];

  const handleLogout = () => {
    // Remove stored user data
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Redirect to landing page
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">

      {/* Sidebar */}
      <div className="w-64 bg-white/60 backdrop-blur-xl shadow-xl p-6 flex flex-col">

        <h1 className="text-2xl font-bold text-purple-700 mb-10">
          Evalora
        </h1>


        {/* Navigation */}
        <div className="space-y-3 flex-1">

          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 p-3 rounded-xl transition ${
                  active
                    ? "bg-purple-600 text-white"
                    : "hover:bg-purple-100 text-gray-700"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}

        </div>


        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-xl text-red-600 hover:bg-red-100 transition"
        >
          <LogOut size={18} />
          Logout
        </button>


      </div>


      {/* Main Content */}
      <div className="flex-1 p-6">
        {children}
      </div>

    </div>
  );
}

export default DashboardLayout;