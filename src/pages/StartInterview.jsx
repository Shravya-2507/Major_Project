import { useNavigate } from "react-router-dom";

const skills = ["DSA", "DBMS", "OS", "CN"];

const StartInterview = () => {
  const navigate = useNavigate();

  const handleStart = (skill) => {
    navigate("/interview", { state: { skill } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
      
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Choose Interview Domain
      </h1>

      <div className="grid grid-cols-2 gap-4">
        {skills.map((skill, index) => (
          <button
            key={index}
            onClick={() => handleStart(skill)}
            className="bg-white px-6 py-4 rounded-2xl shadow hover:shadow-md hover:scale-105 transition"
          >
            {skill}
          </button>
        ))}
      </div>

    </div>
  );
};

export default StartInterview;