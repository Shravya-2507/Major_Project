import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchRoles, fetchCompanies } from "../services/api";

export default function MockInterview() {
  const [roles, setRoles] = useState([]);
  const [companies, setCompanies] = useState([]);

  const [selectedRole, setSelectedRole] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  const [loading, setLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(false);

  const navigate = useNavigate();

  // =========================================
  // Available Interview Topics
  // =========================================
  const topics = [
    "Data Structures",
    "Algorithms",
    "DBMS",
    "Operating Systems",
    "Computer Networks",
    "OOPS",
    "Software Engineering",
    "Artificial Intelligence",
    "Machine Learning",
    "Web Development",
  ];

  // =========================================
  // Initial Load - Companies
  // =========================================
  useEffect(() => {
    const initLoad = async () => {
      try {
        setLoading(true);

        const companiesData = await fetchCompanies();

        setCompanies(companiesData || []);
      } catch (err) {
        console.error(
          "Error fetching companies:",
          err
        );
      } finally {
        setLoading(false);
      }
    };

    initLoad();
  }, []);

  // =========================================
  // Load Roles Whenever Company Changes
  // =========================================
  useEffect(() => {
    const updateRoles = async () => {
      try {
        setRolesLoading(true);

        const rolesData =
          await fetchRoles(selectedCompany);

        setRoles(rolesData || []);

        if (rolesData && rolesData.length > 0) {
          // Automatically select first role
          setSelectedRole(
            String(rolesData[0].id)
          );
        } else {
          setSelectedRole("");
        }
      } catch (err) {
        console.error(
          "Error fetching roles:",
          err
        );

        setRoles([]);
        setSelectedRole("");
      } finally {
        setRolesLoading(false);
      }
    };

    updateRoles();
  }, [selectedCompany]);

  // =========================================
  // Start Interview
  // =========================================
  const handleStart = () => {
    if (!selectedRole) {
      return alert(
        "Please select a role to begin."
      );
    }

    if (!selectedTopic) {
      return alert(
        "Please select a topic to begin."
      );
    }

    // Find complete role object
    const selectedRoleObject = roles.find(
      (r) =>
        String(r.id) === String(selectedRole)
    );

    if (!selectedRoleObject) {
      return alert(
        "Unable to find the selected role."
      );
    }

    // Find complete company object
    const selectedCompanyObject =
      companies.find(
        (c) =>
          String(c.id) ===
          String(selectedCompany)
      );

    // Get actual names
    const roleName =
      selectedRoleObject.role_name;

    const companyName =
      selectedCompanyObject?.company_name ||
      "General";

    console.log(
      "========== STARTING INTERVIEW =========="
    );

    console.log({
      roleId: Number(selectedRole),
      role: roleName,
      companyId: selectedCompany
        ? Number(selectedCompany)
        : null,
      company: companyName,
      topic: selectedTopic,
    });

    console.log(
      "========================================="
    );

    // Save complete interview information
    // in case Interview.jsx needs it.
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
      })
    );

    // Navigate to interview page
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
      },
    });
  };

  return (
    <div className="p-10 max-w-2xl mx-auto shadow-xl rounded-2xl bg-white border mt-10">

      {/* Header */}
      <h2 className="text-3xl font-bold mb-6 text-blue-700">
        Prepare Your Interview
      </h2>

      <div className="space-y-6">

        {/* =====================================
            Company Selection
        ====================================== */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Target Company
          </label>

          <select
            className="w-full border-2 p-3 rounded-lg focus:border-blue-500 outline-none disabled:bg-gray-100"
            value={selectedCompany}
            onChange={(e) =>
              setSelectedCompany(
                e.target.value
              )
            }
            disabled={loading}
          >
            <option value="">
              -- General / Other Companies --
            </option>

            {companies.map((c) => (
              <option
                key={c.id}
                value={c.id}
              >
                {c.company_name}
              </option>
            ))}
          </select>
        </div>

        {/* =====================================
            Role Selection
        ====================================== */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Select Target Role
          </label>

          <select
            className="w-full border-2 p-3 rounded-lg focus:border-blue-500 outline-none disabled:bg-gray-100"
            value={selectedRole}
            onChange={(e) =>
              setSelectedRole(
                e.target.value
              )
            }
            disabled={
              loading ||
              rolesLoading
            }
          >
            {rolesLoading ? (
              <option>
                Updating roles...
              </option>
            ) : roles.length === 0 ? (
              <option value="">
                No roles available
              </option>
            ) : (
              roles.map((r) => (
                <option
                  key={r.id}
                  value={r.id}
                >
                  {r.role_name}
                </option>
              ))
            )}
          </select>
        </div>

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
              setSelectedTopic(
                e.target.value
              )
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
            Start Button
        ====================================== */}
        <button
          onClick={handleStart}
          disabled={
            loading ||
            rolesLoading ||
            !selectedRole ||
            !selectedTopic
          }
          className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-all text-lg shadow-lg disabled:bg-gray-400"
        >
          {loading || rolesLoading
            ? "Loading..."
            : "Start Mock Interview 🎤"}
        </button>
      </div>
    </div>
  );
}