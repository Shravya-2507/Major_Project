import api from "../../services/api";

// ================= Dashboard =================

export const getDashboardStats = async () => {
  const { data } = await api.get("/admin/dashboard");
  return data.data;
};

// ================= Leaderboards =================

export const getOverallLeaderboard = async () => {
  const { data } = await api.get("/admin/leaderboard/overall");
  return data.data || [];
};

export const getMonthlyLeaderboard = async () => {
  const { data } = await api.get("/admin/leaderboard/monthly");
  return data.data || [];
};

export const getWeeklyLeaderboard = async () => {
  const { data } = await api.get("/admin/leaderboard/weekly");
  return data.data || [];
};

// ================= Candidate =================

export const getCandidateProfile = async (id) => {
  const { data } = await api.get(`/admin/candidate/${id}`);
  return data.data;
};

export const getCandidateHistory = async (id) => {
  const { data } = await api.get(`/admin/candidate/${id}/history`);
  return data.data || [];
};

export const getSubjectPerformance = async (id) => {
  const { data } = await api.get(`/admin/candidate/${id}/subjects`);
  return data.data || [];
};

// ================= Dashboard Extras =================

export const getTopPerformers = async () => {
  const { data } = await api.get("/admin/top-performers");
  return data.data || [];
};

export const getRecentActivities = async () => {
  const { data } = await api.get("/admin/activities");
  return data.data || [];
};

export const getBestSubject = async () => {
  const { data } = await api.get("/admin/best-subject");
  return data.data;
};

export const getWeakestSubject = async () => {
  const { data } = await api.get("/admin/weakest-subject");
  return data.data;
};