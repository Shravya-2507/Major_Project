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

<<<<<<< Updated upstream
  updateRoles();
}, [selectedCompany]);

  const handleStart = () => {
    if (!selectedRole) return alert("Please select a role to begin.");

    navigate("/interview", {
      state: {
        roleId: Number(selectedRole),
        // If empty string, send null to backend for "General" logic
        companyId: selectedCompany ? Number(selectedCompany) : null,
=======
    // =========================================
    // Find Selected Role
    // =========================================
    const selectedRoleObject = roles.find(
      (r) =>
        String(r.id) === String(selectedRole)
    );

    if (!selectedRoleObject) {
      return alert(
        "Unable to find the selected role."
      );
    }

    // =========================================
    // Find Selected Company
    // =========================================
    const selectedCompanyObject =
      companies.find(
        (c) =>
          String(c.id) ===
          String(selectedCompany)
      );

    // =========================================
    // Get Names
    // =========================================
    const roleName =
      selectedRoleObject.role_name;

    const companyName =
      selectedCompanyObject?.company_name ||
      "General";

    // =========================================
    // Get Candidate
    // =========================================
    const savedUser =
      localStorage.getItem("user");

    const user = savedUser
      ? JSON.parse(savedUser)
      : null;

    console.log(
      "========== STARTING NEW INTERVIEW =========="
    );

    console.log({
      candidateId: user?.id || null,
      roleId: Number(selectedRole),
      role: roleName,
      companyId: selectedCompany
        ? Number(selectedCompany)
        : null,
      company: companyName,
      topic: selectedTopic,
      totalQuestions: 5,
    });

    console.log(
      "============================================"
    );

    // =========================================
    // IMPORTANT:
    // Clear previous interview state
    // =========================================
    sessionStorage.removeItem(
      "current_interview_questions"
    );

    sessionStorage.removeItem(
      "current_interview_history"
    );

    // =========================================
    // Save Current Interview Information
    // =========================================
    sessionStorage.setItem(
      "current_interview",
      JSON.stringify({
        roleId: Number(selectedRole),

        role: roleName,

        companyId: selectedCompany
          ? Number(selectedCompany)
          : null,

        company: companyName,

        topic: selectedTopic,

        question_type: "Technical",

        category: "Conceptual",

        totalQuestions: 5,
      })
    );

    // =========================================
    // Navigate To Interview Page
    // =========================================
    navigate("/interview", {
      state: {
        roleId: Number(selectedRole),

        role: roleName,

        companyId: selectedCompany
          ? Number(selectedCompany)
          : null,

        company: companyName,

        topic: selectedTopic,

        question_type: "Technical",

        category: "Conceptual",

        totalQuestions: 5,
>>>>>>> Stashed changes
      },
    });
  };

  // =========================================
  // UI
  // =========================================
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
<<<<<<< Updated upstream
            onChange={(e) => setSelectedCompany(e.target.value)}
=======
            onChange={(e) =>
              setSelectedCompany(e.target.value)
            }
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
            onChange={(e) => setSelectedRole(e.target.value)}
            disabled={loading || rolesLoading}
=======
            onChange={(e) =>
              setSelectedRole(e.target.value)
            }
            disabled={
              loading ||
              rolesLoading
            }
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
        {/* =====================================
            Topic Selection
        ====================================== */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Select Interview Topic
          </label>

          <select
            className="w-full border-2 p-3 rounded-lg focus:border-blue-500 outline-none"
            value={selectedTopic}
            onChange={(e) =>
              setSelectedTopic(e.target.value)
            }
            disabled={
              loading ||
              rolesLoading
            }
          >
            <option value="">
              -- Select Topic --
            </option>

            {topics.map((topic) => (
              <option
                key={topic}
                value={topic}
              >
                {topic}
              </option>
            ))}
          </select>
        </div>

        {/* =====================================
            Interview Information
        ====================================== */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            <strong>Interview format:</strong>
          </p>

          <p className="text-sm text-blue-700 mt-1">
            You will be asked 10 questions.
          </p>
        </div>

        {/* =====================================
            Start Button
        ====================================== */}
>>>>>>> Stashed changes
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