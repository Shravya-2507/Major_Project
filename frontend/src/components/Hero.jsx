import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center text-center px-6 bg-gradient-to-br from-white to-indigo-50">
      
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-5xl md:text-6xl font-bold leading-tight"
      >
        Crack Your Dream Job 🚀
      </motion.h1>

      <p className="mt-4 text-gray-600 max-w-xl text-lg">
        Practice coding, analyze your resume, and crack interviews — all in one platform.
      </p>

      <div className="mt-8 flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => navigate("/practice")}
          className="bg-indigo-600 text-white px-7 py-3 rounded-xl shadow-md hover:bg-indigo-700 transition"
        >
          Start Practicing
        </button>

        <button
          onClick={() => navigate("/resume")}
          className="bg-white border px-7 py-3 rounded-xl shadow hover:bg-gray-100 transition"
        >
          Analyze Resume
        </button>

        <button
          onClick={() => navigate("/interview")}
          className="bg-gray-900 text-white px-7 py-3 rounded-xl shadow hover:bg-black transition"
        >
          Mock Interview
        </button>
      </div>
    </div>
  );
}