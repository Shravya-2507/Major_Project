import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Upload,
  MessageCircle,
  BarChart3,
} from "lucide-react";

function DashboardLayout({ children }) {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: Home },
    { name: "Resume", path: "/resume", icon: Upload },
    { name: "Interview", path: "/interview", icon: MessageCircle },
    { name: "Results", path: "/feedback", icon: BarChart3 },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">

      {/* Sidebar */}
      <div className="w-64 bg-white/60 backdrop-blur-xl shadow-xl p-6">
        <h1 className="text-2xl font-bold text-purple-700 mb-10">
          AI Coach 🚀
        </h1>

        <div className="space-y-3">
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
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        {children}
      </div>

    </div>
  );
}

export default DashboardLayout;