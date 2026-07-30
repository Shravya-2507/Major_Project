import * as adminQueries from "./adminQueries.js";

/**
 * Dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalTests,
      averageScore,
      highestScore,
      lowestScore,
      activeUsers,
    ] = await Promise.all([
      adminQueries.getTotalUsers(),
      adminQueries.getTotalTests(),
      adminQueries.getAverageScore(),
      adminQueries.getHighestScore(),
      adminQueries.getLowestScore(),
      adminQueries.getActiveUsers(),
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: Number(totalUsers.total_users),
        totalTests: Number(totalTests.total_tests),
        averageScore: Number(averageScore.average_score || 0),
        highestScore: Number(highestScore.highest_score || 0),
        lowestScore: Number(lowestScore.lowest_score || 0),
        activeUsers: Number(activeUsers.active_users),
      },
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Dashboard Error",
    });
  }
};

/**
 * Overall Leaderboard
 */
export const getOverallLeaderboard = async (req, res) => {
  try {
    const data = await adminQueries.getOverallLeaderboard();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch leaderboard",
    });
  }
};

/**
 * Monthly Leaderboard
 */
export const getMonthlyLeaderboard = async (req, res) => {
  try {
    const data = await adminQueries.getMonthlyLeaderboard();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch monthly leaderboard",
    });
  }
};

/**
 * Weekly Leaderboard
 */
export const getWeeklyLeaderboard = async (req, res) => {
  try {
    const data = await adminQueries.getWeeklyLeaderboard();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch weekly leaderboard",
    });
  }
};

/**
 * Candidate Profile
 */
export const getCandidateProfile = async (req, res) => {
  try {
    const profile = await adminQueries.getCandidateProfile(req.params.id);

    res.json({
      success: true,
      data: profile,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch candidate profile",
    });
  }
};

/**
 * Candidate History
 */
export const getCandidateTestHistory = async (req, res) => {
  try {
    const history = await adminQueries.getCandidateTestHistory(req.params.id);

    res.json({
      success: true,
      data: history,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch history",
    });
  }
};

/**
 * Subject Performance
 */
export const getSubjectPerformance = async (req, res) => {
  try {
    const performance = await adminQueries.getSubjectPerformance(req.params.id);

    res.json({
      success: true,
      data: performance,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch subject performance",
    });
  }
};

/**
 * Recent Activities
 */
export const getRecentActivities = async (req, res) => {
  try {
    const data = await adminQueries.getRecentActivities();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch activities",
    });
  }
};

/**
 * Top Performers
 */
export const getTopPerformers = async (req, res) => {
  try {
    const data = await adminQueries.getTopPerformers();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch top performers",
    });
  }
};

/**
 * Best Subject
 */
export const getBestSubject = async (req, res) => {
  try {
    const data = await adminQueries.getBestSubject();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch best subject",
    });
  }
};

/**
 * Weakest Subject
 */
export const getWeakestSubject = async (req, res) => {
  try {
    const data = await adminQueries.getWeakestSubject();

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false,
      message: "Unable to fetch weakest subject",
    });
  }
};