import { motion } from "framer-motion";

const SkillCard = ({ skill }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white p-5 rounded-2xl shadow-sm hover:shadow-md transition"
    >
      <h3 className="text-lg font-semibold text-gray-700">
        {skill.name}
      </h3>

      <div className="w-full bg-gray-200 h-2 rounded-full mt-3">
        <div
          className="bg-indigo-500 h-2 rounded-full"
          style={{ width: `${skill.level}%` }}
        ></div>
      </div>

      <p className="text-sm text-gray-500 mt-2">
        {skill.level}% proficiency
      </p>
    </motion.div>
  );
};

export default SkillCard;