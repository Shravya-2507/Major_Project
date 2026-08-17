import { NavLink, useNavigate } from "react-router-dom";

export default function Sidebar() {

  const navigate = useNavigate();


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };


  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin",
    },
    {
      name: "Leaderboard",
      path: "/admin/leaderboard",
    },
    {
      name: "Monthly Ranking",
      path: "/admin/monthly-ranking",
    },
  ];


  return (
    <div className="w-64 min-h-screen bg-slate-900 text-white p-6 flex flex-col">


      <h1 className="text-2xl font-bold mb-8">
        Admin Panel
      </h1>



      <nav className="space-y-3 flex-1">

        {menuItems.map((item) => (

          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block p-3 rounded-lg transition ${
                isActive
                  ? "bg-purple-600"
                  : "hover:bg-slate-700"
              }`
            }
          >
            {item.name}
          </NavLink>

        ))}


      </nav>



      <button
        onClick={handleLogout}
        className="mt-auto bg-red-500 hover:bg-red-600 p-3 rounded-lg font-semibold transition"
      >
        Logout
      </button>


    </div>
  );
}