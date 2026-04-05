import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Practice = () => {
  const navigate = useNavigate();

  const handleVTU = () => {
    navigate("/test", { state: { type: "vtu" } });
  };

  const handleCoding = () => {
    navigate("/coding");
  };

  const handleCompany = () => {
    navigate("/company-select");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex flex-col items-center justify-center p-6">
      
      {/* Heading */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Practice Arena 🚀
      </h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
        
        {/* VTU Test */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-6 rounded-2xl shadow-md cursor-pointer text-center"
          onClick={handleVTU}
        >
          <h2 className="text-xl font-semibold text-indigo-600 mb-2">
            VTU Subject Test
          </h2>
          <p className="text-gray-500 text-sm">
            Practice core subjects like DBMS, OS, CN
          </p>
        </motion.div>

        {/* Coding Round */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-6 rounded-2xl shadow-md cursor-pointer text-center"
          onClick={handleCoding}
        >
          <h2 className="text-xl font-semibold text-green-600 mb-2">
            Coding Round
          </h2>
          <p className="text-gray-500 text-sm">
            Solve coding problems like real interviews
          </p>
        </motion.div>

        {/* Company Specific */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white p-6 rounded-2xl shadow-md cursor-pointer text-center"
          onClick={handleCompany}
        >
          <h2 className="text-xl font-semibold text-purple-600 mb-2">
            Company Specific
          </h2>
          <p className="text-gray-500 text-sm">
            Prepare for TCS, Infosys, Amazon & more
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default Practice;