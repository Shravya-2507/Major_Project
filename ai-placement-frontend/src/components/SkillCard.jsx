import { motion } from "framer-motion";

function SkillCard({ skill }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white/70 backdrop-blur-xl p-5 rounded-2xl shadow-md border border-white"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-800">
          {skill.name}
        </h2>

        <span className="text-xs px-3 py-1 rounded-full bg-purple-100 text-purple-700">
          {skill.level}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-3 rounded-full mt-4 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
          style={{ width: `${skill.score}%` }}
        />
      </div>

      {/* Score */}
      <p className="text-sm text-gray-500 mt-2">
        {skill.score}% mastery
      </p>
    </motion.div>
  );
}

export default SkillCard;