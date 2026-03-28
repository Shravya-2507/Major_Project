import { motion } from "framer-motion";

const activities = [
  "Completed DSA Mock Test",
  "Uploaded Resume",
  "Practiced HR Interview",
  "Received Feedback Report",
];

const ActivitySection = () => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Recent Activity
      </h2>

      <div className="bg-white p-6 rounded-3xl shadow-md space-y-4">
        {activities.map((item, index) => (
          <motion.div
            key={index}
            whileHover={{ x: 5 }}
            className="p-3 bg-gray-50 rounded-xl text-gray-600"
          >
            {item}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ActivitySection;