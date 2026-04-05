import { motion } from "framer-motion";
import WelcomeCard from "../components/dashboard/WelcomeCard";
import SkillCard from "../components/dashboard/SkillCard";
import ActivitySection from "../components/dashboard/ActivitySection";

const skills = [
  { name: "DSA", level: 75 },
  { name: "DBMS", level: 60 },
  { name: "OS", level: 50 },
  { name: "CN", level: 65 },
];

const Dashboard = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen p-6 md:p-10 space-y-8">

      {/* Welcome */}
      <WelcomeCard />

      {/* Skills */}
      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-700">
          Your Skill Analysis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <SkillCard key={index} skill={skill} />
          ))}
        </div>
      </div>

      {/* Activity */}
      <ActivitySection />

    </div>
  );
};

export default Dashboard;