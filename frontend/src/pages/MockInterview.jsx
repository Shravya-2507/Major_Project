import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRoles, fetchCompanies } from "../services/api";

export default function MockInterview() {
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCompany, setSelectedCompany] = useState(""); // Empty string = General
  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false); // Sub-loading for role filtering
  const navigate = useNavigate();

  // 1. Initial Load: Just get companies
  useEffect(() => {
    const initLoad = async () => {
      try {
        setLoading(true);
        const companiesData = await fetchCompanies();
        setCompanies(companiesData || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
      } finally {
        setLoading(false);
      }
    };
    initLoad();
  }, []);

  // 2. Chained Load: Whenever selectedCompany changes, update roles
 useEffect(() => {
  const updateRoles = async () => {
    setRolesLoading(true);
    const rolesData = await fetchRoles(selectedCompany);
    setRoles(rolesData);

    if (rolesData.length > 0) {
      setSelectedRole(rolesData[0].id); // Select the first valid role
    } else {
      setSelectedRole(""); // Reset if no roles exist for this company
    }
    setRolesLoading(false);
  };

  updateRoles();
}, [selectedCompany]);

  const handleStart = () => {
    if (!selectedRole) return alert("Please select a role to begin.");

    navigate("/interview", {
      state: {
        roleId: Number(selectedRole),
        // If empty string, send null to backend for "General" logic
        companyId: selectedCompany ? Number(selectedCompany) : null,
      },
    });
  };

  return (
    <div className="p-10 max-w-2xl mx-auto shadow-xl rounded-2xl bg-white border mt-10">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Prepare Your Interview</h2>
      
      <div className="space-y-6">
        {/* Company Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Target Company</label>
          <select 
            className="w-full border-2 p-3 rounded-lg focus:border-blue-500 outline-none disabled:bg-gray-100"
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            disabled={loading}
          >
            <option value="">-- General / Other Companies --</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company_name}
              </option>
            ))}
          </select>
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Select Target Role</label>
          <select 
            className="w-full border-2 p-3 rounded-lg focus:border-blue-500 outline-none disabled:bg-gray-100"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={loading || rolesLoading}
          >
            {rolesLoading ? (
              <option>Updating roles...</option>
            ) : roles.length === 0 ? (
              <option value="">No roles available for this company</option>
            ) : (
              roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.role_name}
                </option>
              ))
            )}
          </select>
        </div>

        <button
          onClick={handleStart}
          disabled={loading || rolesLoading || !selectedRole}
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all text-lg shadow-lg disabled:bg-gray-400"
        >
          {loading || rolesLoading ? "Loading..." : "Start Mock Interview 🎤"}
        </button>
      </div>
    </div>
  );
}