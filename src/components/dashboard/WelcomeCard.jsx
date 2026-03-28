import { motion } from "framer-motion";

const WelcomeCard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white p-6 rounded-3xl shadow-md flex flex-col md:flex-row justify-between items-center"
    >
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Hey User 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Ready to crack your placements today?
        </p>
      </div>

      <button className="mt-4 md:mt-0 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2 rounded-xl transition">
        Start Mock Interview
      </button>
    </motion.div>
  );
};

export default WelcomeCard;