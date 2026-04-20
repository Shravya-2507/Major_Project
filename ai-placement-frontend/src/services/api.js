import api from "../config/api";

// ============================
// Selection API Functions
// ============================

/**
 * Fetch all companies
 */
export const fetchCompanies = async () => {
  try {
    const res = await api.get("/selection/companies");
    return res.data;
  } catch (err) {
    console.error("fetchCompanies error:", err);
    return [];
  }
};

/**
 * Fetch roles — filtered by company if companyId provided, else all roles
 */
export const fetchRoles = async (companyId) => {
  try {
    const url = companyId
      ? `/selection/companies/${companyId}/roles`
      : "/selection/roles";
    const res = await api.get(url);
    return res.data;
  } catch (err) {
    console.error("fetchRoles error:", err);
    return [];
  }
};
