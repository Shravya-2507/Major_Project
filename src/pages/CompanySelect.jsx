import { useNavigate } from "react-router-dom";

const companies = ["TCS", "Infosys", "Wipro", "Amazon", "Accenture"];

const CompanySelect = () => {
  const navigate = useNavigate();

  const handleSelect = (company) => {
    navigate("/test", { state: { type: "company", company } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-50 p-6">
      
      <h1 className="text-2xl font-bold mb-6">
        Select Company
      </h1>

      <div className="grid grid-cols-2 gap-4">
        {companies.map((c, i) => (
          <button
            key={i}
            onClick={() => handleSelect(c)}
            className="bg-white p-4 rounded-xl shadow hover:scale-105 transition"
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CompanySelect;