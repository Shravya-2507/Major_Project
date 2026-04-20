import { useNavigate } from "react-router-dom";

export default function CompanySelect() {
  const navigate = useNavigate();

  const companies = ["TCS", "Infosys", "Wipro", "Accenture"];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Select Company</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {companies.map((c) => (
          <div
            key={c}
            onClick={() => navigate(`/test/company/${c}`)}
            className="p-4 bg-white rounded-lg shadow hover:shadow-lg cursor-pointer"
          >
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}