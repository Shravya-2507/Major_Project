import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const WelcomeCard = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-center"
    >
      {/* Left Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Hey User 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Ready to crack your placements today?
        </p>
      </div>

      {/* Button */}
      <button
        onClick={() => navigate("/start-interview")}
        className="mt-4 md:mt-0 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl transition duration-200 shadow-sm hover:shadow-md"
      >
        Start Mock Interview
      </button>
    </motion.div>
  );
};

export default WelcomeCard;