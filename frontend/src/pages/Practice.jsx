import { useNavigate } from "react-router-dom";
import { Code, Building2 } from "lucide-react";

export default function Practice() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Choose Practice Type</h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Coding */}
        <div
          onClick={() => navigate("/test/coding")}
          className="p-6 rounded-xl shadow hover:shadow-lg cursor-pointer bg-white"
        >
          <Code className="mb-3 text-blue-500" size={28} />
          <h3 className="text-lg font-semibold">Coding Problems</h3>
          <p className="text-gray-500 text-sm">
            Solve coding questions (VTU + DSA)
          </p>
        </div>

        {/* Company */}
        <div
          onClick={() => navigate("/company")}
          className="p-6 rounded-xl shadow hover:shadow-lg cursor-pointer bg-white"
        >
          <Building2 className="mb-3 text-purple-500" size={28} />
          <h3 className="text-lg font-semibold">Company Specific</h3>
          <p className="text-gray-500 text-sm">
            Practice company-based tests
          </p>
        </div>
      </div>
    </div>
  );
}