import { useNavigate } from "react-router-dom";

export default function Features() {
  const navigate = useNavigate();

  const features = [
    {
      title: "Resume Analyzer 📄",
      desc: "ATS-based feedback with keyword matching",
      path: "/resume",
    },
    {
      title: "Coding Practice 💻",
      desc: "Solve problems with test cases",
      path: "/practice",
    },
    {
      title: "Company Tests 🏢",
      desc: "Prepare for company-specific rounds",
      path: "/company",
    },
    {
      title: "Mock Interviews 🎤",
      desc: "AI-based interview practice",
      path: "/interview",
    },
    {
      title: "Leaderboard 🏆",
      desc: "Track your performance",
      path: "/dashboard",
    },
    {
      title: "Feedback System 📊",
      desc: "Detailed performance insights",
      path: "/feedback",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-16 px-6">
      
      <h2 className="text-3xl font-bold text-center mb-12">
        Everything You Need to Get Placed ✨
      </h2>

      <div className="grid md:grid-cols-3 gap-8">
        {features.map((f, i) => (
          <div
            key={i}
            onClick={() => navigate(f.path)}
            className="cursor-pointer bg-white p-6 rounded-2xl shadow hover:shadow-xl transition transform hover:-translate-y-1"
          >
            <h3 className="text-lg font-semibold">{f.title}</h3>
            <p className="text-gray-600 mt-2">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}