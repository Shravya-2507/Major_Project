import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">

      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl font-bold text-purple-700"
      >
        Your AI Placement Coach 🚀
      </motion.h1>

      <p className="mt-4 text-gray-600 max-w-xl">
        Practice interviews, analyze resumes, and track your skills — all in one friendly platform built for freshers.
      </p>

      <div className="mt-8 flex gap-4">
        <button
          onClick={() => navigate("/signup")}
          className="px-6 py-3 bg-purple-600 text-white rounded-2xl shadow hover:scale-105 transition"
        >
          Get Started
        </button>

        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-white border rounded-2xl shadow hover:scale-105 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default Home;