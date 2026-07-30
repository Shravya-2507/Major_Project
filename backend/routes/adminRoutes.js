import express from "express";
import {
  getDashboardStats,
  getOverallLeaderboard,
  getMonthlyLeaderboard,
  getWeeklyLeaderboard,
  getCandidateProfile,
  getCandidateTestHistory,
  getSubjectPerformance,
  getRecentActivities,
  getTopPerformers,
  getBestSubject,
  getWeakestSubject,
} from "../admin/adminController.js";
import { authenticate, authorizeAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate, authorizeAdmin);

router.get("/dashboard", getDashboardStats);
router.get("/leaderboard/overall", getOverallLeaderboard);
router.get("/leaderboard/monthly", getMonthlyLeaderboard);
router.get("/leaderboard/weekly", getWeeklyLeaderboard);
router.get("/candidate/:id", getCandidateProfile);
router.get("/candidate/:id/history", getCandidateTestHistory);
router.get("/candidate/:id/subjects", getSubjectPerformance);
router.get("/activities", getRecentActivities);
router.get("/top-performers", getTopPerformers);
router.get("/best-subject", getBestSubject);
router.get("/weakest-subject", getWeakestSubject);

export default router;