import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">

      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-4">

        <button
          onClick={() => navigate("/practice")}
          className="bg-indigo-500 text-white p-4 rounded-xl hover:bg-indigo-600"
        >
          Practice Tests
        </button>

        <button
          onClick={() => navigate("/interview")}
          className="bg-green-500 text-white p-4 rounded-xl hover:bg-green-600"
        >
          Mock Interview
        </button>

        <button
          onClick={() => navigate("/resume")}
          className="bg-purple-500 text-white p-4 rounded-xl hover:bg-purple-600"
        >
          Resume Analysis
        </button>

      </div>

    </div>
  );
};

export default Dashboard;