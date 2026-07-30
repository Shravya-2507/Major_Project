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
// ============================
// Admin API
// ============================

export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),

  getOverallLeaderboard: () =>
    api.get("/admin/leaderboard/overall"),

  getMonthlyLeaderboard: () =>
    api.get("/admin/leaderboard/monthly"),

  getWeeklyLeaderboard: () =>
    api.get("/admin/leaderboard/weekly"),

  getCandidate: (id) =>
    api.get(`/admin/candidate/${id}`),

  getCandidateHistory: (id) =>
    api.get(`/admin/candidate/${id}/history`),

  getSubjectPerformance: (id) =>
    api.get(`/admin/candidate/${id}/subjects`),

  getRecentActivities: () =>
    api.get("/admin/activities"),

  getTopPerformers: () =>
    api.get("/admin/top-performers"),

  getBestSubject: () =>
    api.get("/admin/best-subject"),

  getWeakestSubject: () =>
    api.get("/admin/weakest-subject"),
};